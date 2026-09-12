import assert from 'node:assert/strict'
import { loadPayoutCalendar, PAYOUTS_NORMALIZATION_VERSION } from '../src/lib/payoutsApi.ts'

let payload: Record<string, unknown> = {}
let status = 200

;(globalThis as { fetch: typeof fetch }).fetch = async input => {
  assert.equal(String(input), '/api/payouts')
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function close(actual: number, expected: number, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

assert.equal(PAYOUTS_NORMALIZATION_VERSION, '1.0')

payload = {
  version: ' 7.16.0 ',
  generatedAt: '2026-09-12T08:00:00.000Z',
  period: { from: '2026-09-12T08:00:00.000Z', to: '2027-02-30' },
  basis: ' CURRENT_HOLDINGS_FULL_12M ',
  displayBasis: ' GROSS_SCHEDULED_PAYOUTS ',
  actual: {
    year: '2026',
    totalNet: '125,5',
    count: 2,
    observation: {
      available: true,
      from: '2026-07-26T00:00:00.000Z',
      to: '2026-09-12T08:00:00.000Z',
      completeMonths: ['2026-08', '2026-13', '2026-08'],
      partialMonths: ['2026-07', 'bad', '2026-09'],
      basis: ' ACCOUNT_OPEN_DATE ',
    },
    items: [
      {
        kind: 'coupon', ticker: ' OFZ ', name: ' ОФЗ 26242 ', figi: ' FIGI1 ', instrumentUid: ' UID1 ',
        date: '2026-09-03T08:14:17.000Z', net: '100,5', gross: null, tax: null, currency: ' rub ',
        source: ' TBANK_OPERATION ', status: 'fact',
      },
      { kind: 'DIVIDEND', ticker: 'BAD', name: 'Bad date', date: '2026-02-30', net: 25 },
    ],
  },
  forecast: { gross: '500,25', tax: '65', net: '435,25', count: 3 },
  next: {
    kind: 'COUPON', ticker: 'OFZ', name: 'OFZ', date: '2026-10-01T00:00:00.000Z',
    gross: { value: '50,5' }, tax: 6.5, net: 44, days: 19, couponNumber: 7, scheduleId: ' C:1:7 ', currency: 'rub',
  },
  events: [
    { kind: 'COUPON', ticker: 'OFZ', name: 'OFZ', date: '2026-10-01T00:00:00.000Z', gross: 50, couponNumber: 7 },
    { kind: 'DIVIDEND', ticker: 'BAD', name: 'Bad', date: 'not-a-date', gross: 30 },
  ],
  months: [
    { key: '2026-10', year: 1900, month: 99, gross: '50', tax: '6,5', net: '43,5', count: 1, items: [] },
    { key: '2026-13', year: 2026, month: 11, gross: 10, tax: 1, net: 9, count: 1, items: [] },
    { key: 'bad', year: 2026, month: 12, gross: 20, tax: 2, net: 18, count: 1, items: [] },
    { key: 'bad', year: 'oops', month: 0, gross: 99, count: 1 },
  ],
  coverage: {
    eligibleAssets: 4,
    scheduledEvents: 3,
    resolvedAssets: 3,
    coverageRatio: '0,75',
    errors: [{ ticker: ' FACT ', error: ' warning ' }, null, {}],
  },
  identity: {
    couponScheduleEvents: 2,
    couponScheduleIdentified: 1,
    couponScheduleCoverage: 0.5,
    basis: ' TBANK_COUPON_NUMBER ',
  },
  integrity: { complete: true, minimumCoverage: 0.95 },
  stale: false,
  warning: ' ',
  note: ' note ',
}

const normalized = await loadPayoutCalendar()
assert.equal(normalized.available, true)
assert.equal(normalized.version, '7.16.0')
assert.equal(normalized.generatedAt, '2026-09-12T08:00:00.000Z')
assert.equal(normalized.period.from, '2026-09-12T08:00:00.000Z')
assert.equal(normalized.period.to, null)
assert.equal(normalized.basis, 'CURRENT_HOLDINGS_FULL_12M')
assert.equal(normalized.displayBasis, 'GROSS_SCHEDULED_PAYOUTS')
assert.equal(normalized.actual.year, 2026)
close(normalized.actual.totalNet, 125.5)
assert.equal(normalized.actual.count, 2)
assert.equal(normalized.actual.items.length, 1)
assert.equal(normalized.actual.items[0].kind, 'COUPON')
assert.equal(normalized.actual.items[0].ticker, 'OFZ')
assert.equal(normalized.actual.items[0].currency, 'RUB')
assert.equal(normalized.actual.items[0].status, 'FACT')
close(normalized.actual.items[0].net ?? 0, 100.5)
assert.equal(normalized.actual.observation?.available, true)
assert.deepEqual(normalized.actual.observation?.completeMonths, ['2026-08'])
assert.deepEqual(normalized.actual.observation?.partialMonths, ['2026-07', '2026-09'])
assert.equal(normalized.actual.observation?.basis, 'ACCOUNT_OPEN_DATE')
close(normalized.forecast.gross, 500.25)
assert.equal(normalized.forecast.count, 3)
assert.equal(normalized.next?.couponNumber, 7)
assert.equal(normalized.next?.scheduleId, 'C:1:7')
assert.equal(normalized.events.length, 1)
assert.deepEqual(normalized.months.map(row => row.key), ['2026-10', '2026-11', '2026-12'])
assert.deepEqual(normalized.months.map(row => [row.year, row.month]), [[2026, 10], [2026, 11], [2026, 12]])
assert.equal(normalized.coverage.eligibleAssets, 4)
assert.equal(normalized.coverage.resolvedAssets, 3)
close(normalized.coverage.coverageRatio, 0.75)
assert.deepEqual(normalized.coverage.errors, [{ ticker: 'FACT', error: 'warning' }])
assert.equal(normalized.identity?.couponScheduleEvents, 2)
close(normalized.identity?.couponScheduleCoverage ?? 0, 0.5)
assert.equal(normalized.identity?.basis, 'TBANK_COUPON_NUMBER')
assert.equal(normalized.integrity.complete, true)
close(normalized.integrity.minimumCoverage, 0.95)
assert.equal(normalized.warning, null)
assert.equal(normalized.note, 'note')

payload = {
  available: true,
  generatedAt: 'bad',
  actual: {
    year: -1,
    count: -1,
    totalNet: 'bad',
    observation: {
      available: false,
      from: '2026-01-01',
      to: '2026-02-01',
      completeMonths: ['2026-01'],
      partialMonths: ['2026-02'],
    },
    items: [],
  },
  forecast: { count: -3, gross: 'bad', tax: Number.POSITIVE_INFINITY, net: null },
  coverage: { eligibleAssets: -1, scheduledEvents: 2.5, resolvedAssets: 'oops', coverageRatio: 1.2 },
  identity: { couponScheduleEvents: -1, couponScheduleIdentified: 1.5, couponScheduleCoverage: -0.1 },
  integrity: { complete: 'true', minimumCoverage: 2 },
  next: { date: 'bad' },
  months: [{ key: '2026-00', gross: 10 }],
  events: [{ date: 'bad' }],
}

const failClosed = await loadPayoutCalendar()
assert.equal(failClosed.available, true)
assert.equal(failClosed.generatedAt, null)
assert.equal(failClosed.actual.year, null)
assert.equal(failClosed.actual.count, 0)
close(failClosed.actual.totalNet, 0)
assert.equal(failClosed.actual.observation?.available, false)
assert.equal(failClosed.actual.observation?.from, null)
assert.deepEqual(failClosed.actual.observation?.completeMonths, [])
assert.equal(failClosed.forecast.count, 0)
close(failClosed.forecast.gross, 0)
assert.equal(failClosed.coverage.eligibleAssets, 0)
assert.equal(failClosed.coverage.scheduledEvents, 0)
close(failClosed.coverage.coverageRatio, 0)
assert.equal(failClosed.identity?.couponScheduleEvents, 0)
close(failClosed.identity?.couponScheduleCoverage ?? 0, 0)
assert.equal(failClosed.integrity.complete, false)
close(failClosed.integrity.minimumCoverage, 0.95)
assert.equal(failClosed.next, null)
assert.deepEqual(failClosed.months, [])
assert.deepEqual(failClosed.events, [])

status = 503
const unavailable = await loadPayoutCalendar()
assert.equal(unavailable.available, false)
assert.equal(unavailable.generatedAt, null)
assert.deepEqual(unavailable.events, [])
assert.deepEqual(unavailable.actual.observation?.completeMonths, [])

console.log('payouts API normalization regression: ok')
