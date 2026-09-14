import assert from 'node:assert/strict'
import type { PayoutEvent } from '../src/lib/payoutsApi.ts'
import { buildIncomeCalendarVisual, filterIncomeCalendarEvents } from '../src/features/income/incomeCalendarVisual.ts'

const events: PayoutEvent[] = [
  { kind: 'COUPON', ticker: 'A', name: 'A', date: '2026-01-01', gross: 100, status: 'FORECAST' },
  { kind: 'DIVIDEND', ticker: 'B', name: 'B', date: '2026-01-31', gross: 300, status: 'FORECAST' },
  { kind: 'COUPON', ticker: 'C', name: 'C', date: '2026-02-01', gross: null, status: 'FORECAST' },
  { kind: 'COUPON', ticker: 'D', name: 'D', date: '2026-02-28', gross: null, status: 'FORECAST' },
  { kind: 'COUPON', ticker: 'FACT', name: 'FACT', date: '2026-01-15', gross: 9999, status: 'FACT' },
  { kind: 'COUPON', ticker: 'OUT', name: 'OUT', date: '2027-01-01', gross: 500, status: 'FORECAST' },
]

const months = buildIncomeCalendarVisual(events, '2026-01-15', 12)
assert.equal(months.length, 12)
assert.equal(months[0].key, '2026-01')
assert.equal(months[11].key, '2026-12')
assert.equal(months[0].count, 2)
assert.equal(months[0].gross, 400)
assert.equal(months[0].grossAvailable, true)
assert.equal(months[0].intensity, 1)
assert.equal(months[0].intensityBasis, 'gross')
assert.equal(months[1].count, 2)
assert.equal(months[1].grossAvailable, false)
assert.equal(months[1].intensity, 1)
assert.equal(months[1].intensityBasis, 'count')
assert.equal(months[2].count, 0)
assert.equal(months[2].intensity, 0)
assert.equal(months[2].intensityBasis, 'empty')

const january = filterIncomeCalendarEvents(events, '2026-01')
assert.deepEqual(january.map(event => event.ticker), ['A', 'B'])
assert.equal(filterIncomeCalendarEvents(events, null).some(event => event.status === 'FACT'), false)
assert.equal(buildIncomeCalendarVisual(events, 'not-a-date').length, 0)
assert.equal(buildIncomeCalendarVisual(events, '2026-01-01', 25).length, 0)

console.log('income calendar visual tests: ok')
