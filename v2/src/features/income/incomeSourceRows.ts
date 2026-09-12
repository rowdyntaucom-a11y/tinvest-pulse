import type { PayoutEvent } from '../../lib/payoutsApi'
import type { PositionSnapshot } from '../../lib/portfolioApi'

export const INCOME_SOURCE_ROWS_VERSION = '1.1' as const

export type IncomeSourceIdentityState = 'EXACT_FIGI' | 'AMBIGUOUS_FIGI' | 'INCOMPLETE_FIGI' | 'NO_FIGI'

export type IncomeSourceRow = {
  key: string
  figi: string | null
  ticker: string
  name: string
  fact: number
  forecast: number
  factCount: number
  forecastCount: number
  costBasis: number
  yoc12m: number | null
  matchBasis: 'FIGI' | null
  identityState: IncomeSourceIdentityState
}

type WorkingRow = Omit<IncomeSourceRow, 'figi' | 'costBasis' | 'yoc12m' | 'matchBasis' | 'identityState'> & {
  figis: Set<string>
  missingFigi: boolean
}

function clean(value: unknown) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

function upper(value: unknown) {
  return clean(value)?.toUpperCase() ?? null
}

function positive(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function sourceLabel(event: PayoutEvent) {
  const ticker = clean(event.ticker) || clean(event.name) || '—'
  const name = clean(event.name) || ticker
  return { ticker, name, key: upper(ticker) || upper(name) || '—' }
}

function addIdentity(row: WorkingRow, event: PayoutEvent) {
  const figi = upper(event.figi)
  if (figi) row.figis.add(figi)
  else row.missingFigi = true
}

/**
 * Builds the compact Income → Sources rows while keeping instrument identity
 * separate from display aliases.
 *
 * Rows remain grouped by the displayed source label for continuity with the
 * existing income UI. Yield-on-cost is stricter: it is available only when
 * every included payout event carries the same FIGI and that FIGI maps to
 * exactly one current portfolio position. Ticker/name aliases never select
 * cost basis.
 */
export function buildIncomeSourceRows(
  actualEvents: PayoutEvent[],
  scheduledEvents: PayoutEvent[],
  positions: PositionSnapshot[],
  limit = 6,
): IncomeSourceRow[] {
  const rows = new Map<string, WorkingRow>()

  const ensure = (event: PayoutEvent) => {
    const label = sourceLabel(event)
    const current = rows.get(label.key)
    if (current) {
      addIdentity(current, event)
      return current
    }
    const row: WorkingRow = {
      key: label.key,
      ticker: label.ticker,
      name: label.name,
      fact: 0,
      forecast: 0,
      factCount: 0,
      forecastCount: 0,
      figis: new Set<string>(),
      missingFigi: false,
    }
    addIdentity(row, event)
    rows.set(label.key, row)
    return row
  }

  for (const event of Array.isArray(actualEvents) ? actualEvents : []) {
    if (upper(event.status) !== 'FACT') continue
    const amount = positive(event.net)
    if (amount == null) continue
    const row = ensure(event)
    row.fact += amount
    row.factCount += 1
  }

  for (const event of Array.isArray(scheduledEvents) ? scheduledEvents : []) {
    if (upper(event.status) === 'FACT') continue
    const amount = positive(event.gross)
    if (amount == null) continue
    const row = ensure(event)
    row.forecast += amount
    row.forecastCount += 1
  }

  const positionsByFigi = new Map<string, PositionSnapshot[]>()
  for (const position of Array.isArray(positions) ? positions : []) {
    const figi = upper(position.figi)
    if (!figi) continue
    const bucket = positionsByFigi.get(figi) ?? []
    bucket.push(position)
    positionsByFigi.set(figi, bucket)
  }

  const normalizedLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 6

  return [...rows.values()]
    .map(row => {
      const figis = [...row.figis]
      const identityState: IncomeSourceIdentityState = figis.length > 1
        ? 'AMBIGUOUS_FIGI'
        : row.missingFigi && figis.length === 1
          ? 'INCOMPLETE_FIGI'
          : row.missingFigi
            ? 'NO_FIGI'
            : figis.length === 1
              ? 'EXACT_FIGI'
              : 'NO_FIGI'
      const figi = identityState === 'EXACT_FIGI' ? figis[0] : null
      const matches = figi ? positionsByFigi.get(figi) ?? [] : []
      const position = matches.length === 1 ? matches[0] : null
      const rawCostBasis = position?.costBasis
      const costBasis = typeof rawCostBasis === 'number' && Number.isFinite(rawCostBasis) && rawCostBasis > 0
        ? rawCostBasis
        : 0
      const exactPositionMatch = Boolean(figi && position)
      return {
        key: row.key,
        figi,
        ticker: row.ticker,
        name: row.name,
        fact: row.fact,
        forecast: row.forecast,
        factCount: row.factCount,
        forecastCount: row.forecastCount,
        costBasis,
        yoc12m: exactPositionMatch && costBasis > 0 && row.forecast > 0 ? row.forecast / costBasis : null,
        matchBasis: exactPositionMatch ? 'FIGI' as const : null,
        identityState,
      }
    })
    .sort((a, b) => (b.fact + b.forecast) - (a.fact + a.forecast) || a.key.localeCompare(b.key))
    .slice(0, normalizedLimit)
}
