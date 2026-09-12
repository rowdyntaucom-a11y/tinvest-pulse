import type { PortfolioSnapshot } from '../../lib/portfolioApi'

export const PORTFOLIO_DATA_CONTEXT_CALC_VERSION = '1.1' as const

export type PortfolioDataSource = 'DASHBOARD' | 'PORTFOLIO' | 'FALLBACK'
export type TimestampState = 'REPORTED' | 'MISSING' | 'INVALID'

export type PortfolioDataContext = {
  calcVersion: typeof PORTFOLIO_DATA_CONTEXT_CALC_VERSION
  accountName: string | null
  source: PortfolioDataSource
  reportedAt: string | null
  timestampState: TimestampState
  ageMinutes: number | null
  history: {
    points: number
    validDatePoints: number
    firstDate: string | null
    lastDate: string | null
  }
  positions: {
    total: number
    priced: number
    withCostBasis: number
  }
}

function normaliseAccountName(value: string) {
  const name = String(value || '').trim()
  return name || null
}

function sourceLabel(source: PortfolioSnapshot['source']): PortfolioDataSource {
  if (source === 'dashboard') return 'DASHBOARD'
  if (source === 'portfolio') return 'PORTFOLIO'
  return 'FALLBACK'
}

function parseReportedAt(value: string | null, nowMs: number) {
  if (!value) {
    return { reportedAt: null, timestampState: 'MISSING' as const, ageMinutes: null }
  }

  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return { reportedAt: null, timestampState: 'INVALID' as const, ageMinutes: null }
  }

  return {
    reportedAt: new Date(timestamp).toISOString(),
    timestampState: 'REPORTED' as const,
    ageMinutes: Math.max(0, (nowMs - timestamp) / 60_000),
  }
}

function strictHistoryDate(value: unknown) {
  const raw = String(value || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const timestamp = Date.parse(`${raw}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString().slice(0, 10) === raw ? raw : null
}

export function buildPortfolioDataContext(snapshot: PortfolioSnapshot, now: Date = new Date()): PortfolioDataContext {
  const nowMs = Number.isFinite(now.getTime()) ? now.getTime() : Date.now()
  const timestamp = parseReportedAt(snapshot.updatedAt, nowMs)
  const datedHistory = snapshot.history
    .map(point => strictHistoryDate(point.date))
    .filter((date): date is string => date != null)
    .sort((a, b) => a.localeCompare(b))

  let priced = 0
  let withCostBasis = 0

  for (const position of snapshot.positionItems) {
    if (Number.isFinite(position.currentPrice) && position.currentPrice > 0) priced += 1
    if (Number.isFinite(position.costBasis) && position.costBasis > 0) withCostBasis += 1
  }

  return {
    calcVersion: PORTFOLIO_DATA_CONTEXT_CALC_VERSION,
    accountName: normaliseAccountName(snapshot.accountName),
    source: sourceLabel(snapshot.source),
    ...timestamp,
    history: {
      points: snapshot.history.length,
      validDatePoints: datedHistory.length,
      firstDate: datedHistory[0] ?? null,
      lastDate: datedHistory.at(-1) ?? null,
    },
    positions: {
      total: snapshot.positionItems.length,
      priced,
      withCostBasis,
    },
  }
}
