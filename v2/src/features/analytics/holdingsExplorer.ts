import type { PositionSnapshot } from '../../lib/portfolioApi'

export type HoldingDimension = 'class' | 'instrument' | 'issuer' | 'sector' | 'currency'
export type HoldingPreset = 'compact' | 'return' | 'risk' | 'fundamental'
export type HoldingSort = 'weight' | 'value' | 'pnl' | 'name'
export type AssetClassFilter = 'all' | 'shares' | 'bonds' | 'funds' | 'currency' | 'futures' | 'other'

export function classifyPosition(type: unknown): Exclude<AssetClassFilter, 'all'> {
  const value = String(type ?? '').toLowerCase()
  if (value.includes('share') || value.includes('stock')) return 'shares'
  if (value.includes('bond')) return 'bonds'
  if (value.includes('etf') || value.includes('fund')) return 'funds'
  if (value.includes('currenc')) return 'currency'
  if (value.includes('future')) return 'futures'
  return 'other'
}

export function filterAndSortHoldings(positions: PositionSnapshot[], filter: AssetClassFilter, sort: HoldingSort) {
  const rows = positions.filter(row => filter === 'all' || classifyPosition(row.instrumentType) === filter)
  return [...rows].sort((a, b) => {
    if (sort === 'name') return (a.ticker || a.name).localeCompare(b.ticker || b.name, 'ru')
    if (sort === 'pnl') return b.expectedYield - a.expectedYield
    if (sort === 'value') return b.currentValue - a.currentValue
    return b.weight - a.weight
  })
}

export function holdingDimension(position: PositionSnapshot, dimension: HoldingDimension): string | null {
  if (dimension === 'instrument') return position.ticker || position.name || null
  if (dimension === 'class') return classifyPosition(position.instrumentType)
  if (dimension === 'issuer') return position.bond?.issuerName ?? null
  if (dimension === 'sector') return position.bond?.sector ?? null
  if (dimension === 'currency') return position.bond?.currency ?? null
  return null
}

export function aggregateHoldings(positions: PositionSnapshot[], dimension: HoldingDimension) {
  const groups = new Map<string, number>()
  let unclassified = 0
  for (const position of positions) {
    const key = holdingDimension(position, dimension)
    if (!key) { unclassified += position.currentValue; continue }
    groups.set(key, (groups.get(key) ?? 0) + position.currentValue)
  }
  return {
    rows: [...groups].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    unclassified,
  }
}
