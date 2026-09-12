import type { PositionSnapshot } from '../../lib/portfolioApi'

export const PORTFOLIO_PNL_ATTRIBUTION_CALC_VERSION = '1.0' as const

export type PositionPnlAttribution = {
  key: string
  ticker: string
  name: string
  instrumentType: string
  pnl: number
  direction: 'positive' | 'negative' | 'flat'
  grossPnlShare: number | null
}

export type AssetClassPnlAttribution = {
  assetClass: string
  pnl: number
  grossAbsolutePnl: number
  direction: 'positive' | 'negative' | 'flat'
  grossPnlShare: number | null
}

export type PortfolioPnlAttribution = {
  calcVersion: typeof PORTFOLIO_PNL_ATTRIBUTION_CALC_VERSION
  netPnl: number
  grossAbsolutePnl: number
  positivePnl: number
  negativePnl: number
  positions: PositionPnlAttribution[]
  assetClasses: AssetClassPnlAttribution[]
}

function finite(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function direction(value: number): 'positive' | 'negative' | 'flat' {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'flat'
}

function assetClass(type: string) {
  const key = String(type || '').toLowerCase()
  if (key.includes('bond')) return 'Облигации'
  if (key.includes('share') || key.includes('stock')) return 'Акции'
  if (key.includes('etf') || key.includes('fund')) return 'Фонды'
  if (key.includes('currency')) return 'Валюта'
  if (key.includes('future')) return 'Фьючерсы'
  return 'Прочее'
}

/**
 * Current unrealized broker P/L attribution.
 *
 * This intentionally does NOT claim to be return attribution or TWR attribution.
 * `grossPnlShare` is abs(position expectedYield) / sum(abs(expectedYield)) so
 * offsetting winners/losers cannot create unstable shares when net P/L is near zero.
 */
export function calculatePortfolioPnlAttribution(positions: PositionSnapshot[]): PortfolioPnlAttribution {
  const normalized = positions.map((position, index) => {
    const pnl = finite(position.expectedYield)
    return {
      key: `${position.ticker || ''}|${position.name || ''}|${position.instrumentType || ''}|${index}`,
      ticker: position.ticker || position.name || '—',
      name: position.name || position.ticker || '—',
      instrumentType: position.instrumentType || '',
      pnl,
    }
  })

  const grossAbsolutePnl = normalized.reduce((sum, row) => sum + Math.abs(row.pnl), 0)
  const netPnl = normalized.reduce((sum, row) => sum + row.pnl, 0)
  const positivePnl = normalized.reduce((sum, row) => sum + Math.max(0, row.pnl), 0)
  const negativePnl = normalized.reduce((sum, row) => sum + Math.min(0, row.pnl), 0)

  const positionRows: PositionPnlAttribution[] = normalized
    .map(row => ({
      ...row,
      direction: direction(row.pnl),
      grossPnlShare: grossAbsolutePnl > 0 ? Math.abs(row.pnl) / grossAbsolutePnl : null,
    }))
    .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))

  const byClass = new Map<string, { pnl: number; grossAbsolutePnl: number }>()
  for (const row of normalized) {
    const label = assetClass(row.instrumentType)
    const current = byClass.get(label) ?? { pnl: 0, grossAbsolutePnl: 0 }
    current.pnl += row.pnl
    current.grossAbsolutePnl += Math.abs(row.pnl)
    byClass.set(label, current)
  }

  const assetClasses: AssetClassPnlAttribution[] = [...byClass.entries()]
    .map(([label, values]) => ({
      assetClass: label,
      pnl: values.pnl,
      grossAbsolutePnl: values.grossAbsolutePnl,
      direction: direction(values.pnl),
      grossPnlShare: grossAbsolutePnl > 0 ? values.grossAbsolutePnl / grossAbsolutePnl : null,
    }))
    .sort((a, b) => b.grossAbsolutePnl - a.grossAbsolutePnl)

  return {
    calcVersion: PORTFOLIO_PNL_ATTRIBUTION_CALC_VERSION,
    netPnl,
    grossAbsolutePnl,
    positivePnl,
    negativePnl,
    positions: positionRows,
    assetClasses,
  }
}

export function findPositionPnlAttribution(
  attribution: PortfolioPnlAttribution,
  position: Pick<PositionSnapshot, 'ticker' | 'name' | 'instrumentType'>,
) {
  return attribution.positions.find(row =>
    row.ticker === (position.ticker || position.name || '—')
    && row.name === (position.name || position.ticker || '—')
    && row.instrumentType === (position.instrumentType || ''),
  ) ?? null
}
