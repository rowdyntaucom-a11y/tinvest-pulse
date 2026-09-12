import type { HistoryPoint } from '../../lib/portfolioApi'
import type { TransactionMarker } from './transactionMarkers'

export const TRANSACTION_MARKER_PRESENTATION_VERSION = '1.0' as const
export const MAX_VISIBLE_TRANSACTION_EVENT_DAYS = 18

export type TransactionMarkerDay = {
  date: string
  index: number
  buys: number
  sells: number
}

export type TransactionMarkerPresentation = {
  version: typeof TRANSACTION_MARKER_PRESENTATION_VERSION
  eventDays: TransactionMarkerDay[]
  visibleEventDays: TransactionMarkerDay[]
  hiddenEventDays: number
  totalBuys: number
  totalSells: number
}

function dateOnly(value: unknown) {
  const raw = String(value || '').trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const timestamp = Date.parse(`${raw}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString().slice(0, 10) === raw ? raw : null
}

/**
 * Groups verified BUY/SELL operations by chart day and caps only the visual
 * event-day layer. Totals always describe all matched event days, including
 * days hidden by the mobile-density cap.
 *
 * Duplicate chart dates are ambiguous for x-coordinate placement and therefore
 * fail closed for markers on that date instead of letting input order choose a
 * coordinate.
 */
export function buildTransactionMarkerPresentation(
  markers: readonly TransactionMarker[],
  chartPoints: readonly Pick<HistoryPoint, 'date'>[],
  maxVisibleEventDays = MAX_VISIBLE_TRANSACTION_EVENT_DAYS,
): TransactionMarkerPresentation {
  const countsByDate = new Map<string, number>()
  const firstIndexByDate = new Map<string, number>()

  chartPoints.forEach((point, index) => {
    const date = dateOnly(point.date)
    if (!date) return
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1)
    if (!firstIndexByDate.has(date)) firstIndexByDate.set(date, index)
  })

  const indexByDate = new Map<string, number>()
  for (const [date, count] of countsByDate) {
    if (count === 1) indexByDate.set(date, firstIndexByDate.get(date)!)
  }

  const grouped = new Map<string, { buys: number; sells: number }>()
  for (const marker of markers) {
    const date = dateOnly(marker.date)
    if (!date || !indexByDate.has(date)) continue
    const row = grouped.get(date) ?? { buys: 0, sells: 0 }
    if (marker.side === 'BUY') row.buys += 1
    else if (marker.side === 'SELL') row.sells += 1
    else continue
    grouped.set(date, row)
  }

  const eventDays = [...grouped.entries()]
    .map(([date, row]) => ({ date, index: indexByDate.get(date)!, ...row }))
    .sort((a, b) => a.index - b.index || a.date.localeCompare(b.date))

  const rawLimit = Number(maxVisibleEventDays)
  const safeLimit = Number.isFinite(rawLimit) && rawLimit >= 0 ? Math.floor(rawLimit) : MAX_VISIBLE_TRANSACTION_EVENT_DAYS
  const visibleEventDays = safeLimit === 0 ? [] : eventDays.slice(-safeLimit)

  return {
    version: TRANSACTION_MARKER_PRESENTATION_VERSION,
    eventDays,
    visibleEventDays,
    hiddenEventDays: eventDays.length - visibleEventDays.length,
    totalBuys: eventDays.reduce((sum, row) => sum + row.buys, 0),
    totalSells: eventDays.reduce((sum, row) => sum + row.sells, 0),
  }
}
