import type { PayoutEvent } from '../../lib/payoutsApi'
import type { PositionSnapshot } from '../../lib/portfolioApi'

function cleanText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function payoutEventIsConfirmed(event: PayoutEvent): boolean {
  if (String(event.status || '').toUpperCase() === 'FACT') return false
  return String(event.confidence || '').toUpperCase() === 'HIGH'
}

export function findPayoutEventPosition(event: PayoutEvent, positions: PositionSnapshot[]): PositionSnapshot | null {
  const figi = cleanText(event.figi)
  if (!figi) return null
  const matches = positions.filter(position => cleanText(position.figi) === figi)
  return matches.length === 1 ? matches[0] : null
}


export type PayoutAttributionRow = {
  position: PositionSnapshot
  gross: number
  count: number
  nextDate: string | null
}

export type PayoutAttribution = {
  rows: PayoutAttributionRow[]
  confirmedGross: number
  matchedGross: number
  unmatchedGross: number
  confirmedCount: number
  matchedCount: number
  unmatchedCount: number
}

export function buildPayoutAttribution(events: PayoutEvent[], positions: PositionSnapshot[]): PayoutAttribution {
  const confirmed = events.filter(event => payoutEventIsConfirmed(event) && String(event.status || '').toUpperCase() !== 'FACT')
  const byFigi = new Map<string, PayoutAttributionRow>()
  let confirmedGross = 0, matchedGross = 0, confirmedCount = 0, matchedCount = 0
  for (const event of confirmed) {
    const gross = typeof event.gross === 'number' && Number.isFinite(event.gross) ? Math.max(0, event.gross) : 0
    confirmedGross += gross
    confirmedCount += 1
    const position = findPayoutEventPosition(event, positions)
    if (!position) continue
    matchedGross += gross
    matchedCount += 1
    const key = cleanText(position.figi) || cleanText(position.ticker)
    if (!key) continue
    const current = byFigi.get(key)
    if (current) {
      current.gross += gross
      current.count += 1
      if (!current.nextDate || event.date < current.nextDate) current.nextDate = event.date
    } else {
      byFigi.set(key, { position, gross, count: 1, nextDate: event.date || null })
    }
  }
  const rows = [...byFigi.values()].sort((a,b)=>b.gross-a.gross || a.position.ticker.localeCompare(b.position.ticker))
  return {
    rows,
    confirmedGross,
    matchedGross,
    unmatchedGross: Math.max(0, confirmedGross - matchedGross),
    confirmedCount,
    matchedCount,
    unmatchedCount: Math.max(0, confirmedCount - matchedCount),
  }
}
