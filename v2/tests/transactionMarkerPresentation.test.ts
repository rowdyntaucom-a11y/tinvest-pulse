import assert from 'node:assert/strict'
import {
  buildTransactionMarkerPresentation,
  MAX_VISIBLE_TRANSACTION_EVENT_DAYS,
  TRANSACTION_MARKER_PRESENTATION_VERSION,
} from '../src/features/portfolio/transactionMarkerPresentation.ts'
import type { TransactionMarker } from '../src/features/portfolio/transactionMarkers.ts'

function dateAt(day: number) {
  return `2025-01-${String(day).padStart(2, '0')}`
}

function marker(day: number, side: 'BUY' | 'SELL', suffix = ''): TransactionMarker {
  return {
    id: `${side}-${day}${suffix}`,
    date: `${dateAt(day)}T10:00:00.000Z`,
    side,
    figi: `FIGI-${day}`,
    instrumentUid: null,
    quantity: 1,
  }
}

const chart = Array.from({ length: 20 }, (_, index) => ({ date: dateAt(index + 1) }))
const markers = Array.from({ length: 20 }, (_, index) => marker(index + 1, index % 2 === 0 ? 'BUY' : 'SELL'))
markers.push(marker(20, 'BUY', '-second'))
markers.push({ ...marker(1, 'BUY', '-outside'), id: 'outside', date: '2025-02-01T10:00:00.000Z' })

const presentation = buildTransactionMarkerPresentation(markers, chart)
assert.equal(presentation.version, TRANSACTION_MARKER_PRESENTATION_VERSION)
assert.equal(presentation.version, '1.0')
assert.equal(MAX_VISIBLE_TRANSACTION_EVENT_DAYS, 18)
assert.equal(presentation.eventDays.length, 20)
assert.equal(presentation.visibleEventDays.length, 18)
assert.equal(presentation.hiddenEventDays, 2)
assert.equal(presentation.visibleEventDays[0].date, '2025-01-03')
assert.equal(presentation.visibleEventDays.at(-1)?.date, '2025-01-20')
assert.equal(presentation.totalBuys, 11)
assert.equal(presentation.totalSells, 10)
const lastDay = presentation.eventDays.at(-1)!
assert.equal(lastDay.buys, 1)
assert.equal(lastDay.sells, 1)

const compact = buildTransactionMarkerPresentation(markers, chart, 2)
assert.deepEqual(compact.visibleEventDays.map(row => row.date), ['2025-01-19', '2025-01-20'])
assert.equal(compact.hiddenEventDays, 18)
assert.equal(compact.totalBuys, 11)
assert.equal(compact.totalSells, 10)

const hidden = buildTransactionMarkerPresentation(markers, chart, 0)
assert.equal(hidden.visibleEventDays.length, 0)
assert.equal(hidden.hiddenEventDays, 20)
assert.equal(hidden.eventDays.length, 20)

const ambiguousChart = [
  { date: '2025-01-01' },
  { date: '2025-01-01T15:00:00Z' },
  { date: '2025-01-02' },
]
const ambiguous = buildTransactionMarkerPresentation([
  marker(1, 'BUY'),
  marker(2, 'SELL'),
], ambiguousChart)
assert.equal(ambiguous.eventDays.length, 1)
assert.equal(ambiguous.eventDays[0].date, '2025-01-02')
assert.equal(ambiguous.eventDays[0].index, 2)
assert.equal(ambiguous.totalBuys, 0)
assert.equal(ambiguous.totalSells, 1)

const invalidDates = buildTransactionMarkerPresentation([
  { ...marker(1, 'BUY'), id: 'invalid-marker', date: 'not-a-date' },
], [{ date: '2025-02-30' }, { date: 'not-a-date' }])
assert.deepEqual(invalidDates.eventDays, [])
assert.deepEqual(invalidDates.visibleEventDays, [])
assert.equal(invalidDates.totalBuys, 0)
assert.equal(invalidDates.totalSells, 0)

console.log('transaction marker presentation regression: ok')
