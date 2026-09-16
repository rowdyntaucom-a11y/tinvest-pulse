import assert from 'node:assert/strict'
import type { PayoutCalendar, PayoutEvent } from '../src/lib/payoutsApi.ts'
import { separateTrustedIncomeData } from '../src/features/income/incomeDataTrust.ts'

const fact: PayoutEvent = { kind: 'DIVIDEND', ticker: 'FACT', name: 'Fact', date: '2026-01-10', status: 'FACT', gross: 100, tax: 13, net: 87 }
const future: PayoutEvent = { kind: 'COUPON', ticker: 'FUT', name: 'Future', date: '2026-10-10', status: 'SCHEDULED', gross: 50, tax: 6.5, net: 43.5 }

function calendar(overrides: Partial<PayoutCalendar> = {}): PayoutCalendar {
  return {
    available: true, generatedAt: '2026-09-16T00:00:00.000Z',
    period: { from: '2026-09-01T00:00:00.000Z', to: '2027-08-31T00:00:00.000Z' },
    basis: 'broker actual + schedule', displayBasis: 'broker',
    actual: { year: 2026, items: [fact], totalNet: 87, count: 1 },
    forecast: { gross: 50, tax: 6.5, net: 43.5, count: 1 }, next: future,
    months: [{ key: '2026-10', year: 2026, month: 10, gross: 50, tax: 6.5, net: 43.5, count: 1, items: [future] }],
    events: [fact, future],
    coverage: { eligibleAssets: 2, scheduledEvents: 1, resolvedAssets: 1, coverageRatio: .5, errors: [] },
    integrity: { complete: false, minimumCoverage: .95 }, stale: false, warning: null, note: null,
    ...overrides,
  }
}

// CASE 1: incomplete future coverage cannot erase independently observed facts.
const partial = separateTrustedIncomeData(calendar(), false)
assert.deepEqual(partial.actualEvents, [fact])
assert.deepEqual(partial.futureEvents, [])
assert.equal(partial.taxCalendar.actual.items.length, 1)
assert.equal(partial.taxCalendar.next, null)
assert.equal(partial.taxCalendar.forecast.count, 0)
assert.deepEqual(partial.taxCalendar.months, [])

// CASE 2: trusted schedule enables forecast, next and future calendar rows.
const live = separateTrustedIncomeData(calendar({ integrity: { complete: true, minimumCoverage: .95 } }), true)
assert.deepEqual(live.actualEvents, [fact])
assert.deepEqual(live.futureEvents, [future])
assert.equal(live.taxCalendar.forecast.gross, 50)
assert.equal(live.taxCalendar.next?.ticker, 'FUT')
assert.equal(live.taxCalendar.months.length, 1)

// CASE 3: stale/partial schedule fails closed without affecting historical tax facts.
const stale = separateTrustedIncomeData(calendar({ stale: true }), false)
assert.equal(stale.taxCalendar.available, false)
assert.equal(stale.taxCalendar.actual.items[0]?.net, 87)
assert.equal(stale.taxCalendar.forecast.count, 0)
assert.deepEqual(stale.futureEvents, [])

// CASE 4: no historical or future evidence stays empty; nothing is fabricated.
const unavailable = separateTrustedIncomeData(calendar({ available: false, actual: { year: null, items: [], totalNet: 0, count: 0 }, forecast: { gross: 0, tax: 0, net: 0, count: 0 }, next: null, months: [], events: [] }), false)
assert.deepEqual(unavailable.actualEvents, [])
assert.deepEqual(unavailable.futureEvents, [])
assert.equal(unavailable.taxCalendar.available, false)
assert.equal(unavailable.taxCalendar.next, null)

console.log('income data trust boundary regression: ok')
