import type { PortfolioSnapshot } from '../../lib/portfolioApi'

export type PortfolioDataSource = 'DASHBOARD' | 'PORTFOLIO' | 'FALLBACK'
export type TimestampState = 'REPORTED' | 'MISSING' | 'INVALID'

export type PortfolioDataContext = {
  accountName: string | null
  source: PortfolioDataSource
  reportedAt: string | null
  timestampState: TimestampState
  ageMinutes: number | null
  history: {
    points: number
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

export function buildPortfolioDataContext(snapshot: PortfolioSnapshot, now: Date = new Date()): PortfolioDataContext {
  const nowMs = Number.isFinite(now.getTime()) ? now.getTime() : Date.now()
  const timestamp = parseReportedAt(snapshot.updatedAt, nowMs)
  const datedHistory = snapshot.history
    .map(point => String(point.date || '').slice(0, 10))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  let priced = 0
  let withCostBasis = 0

  for (const position of snapshot.positionItems) {
    if (Number.isFinite(position.currentPrice) && position.currentPrice > 0) priced += 1
    if (Number.isFinite(position.costBasis) && position.costBasis > 0) withCostBasis += 1
  }

  return {
    accountName: normaliseAccountName(snapshot.accountName),
    source: sourceLabel(snapshot.source),
    ...timestamp,
    history: {
      points: snapshot.history.length,
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
