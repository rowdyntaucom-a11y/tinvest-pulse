import assert from 'node:assert/strict'
import {
  calculatePositionIncomeContribution,
  POSITION_INCOME_CONTRIBUTION_VERSION,
} from '../src/features/portfolio/positionIncomeContribution.ts'
import type { PayoutCalendar, PayoutEvent } from '../src/lib/payoutsApi.ts'

function event(overrides: Partial<PayoutEvent>): PayoutEvent {
  return {
    kind: 'COUPON',
    ticker: 'OFZ',
    name: 'OFZ',
    figi: null,
    date: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

function calendar(overrides: Partial<PayoutCalendar> = {}): PayoutCalendar {
  return {
    available: true,
    generatedAt: '2026-09-12T00:00:00.000Z',
    period: { from: '2026-09-12T00:00:00.000Z', to: '2027-09-12T00:00:00.000Z' },
    basis: 'CURRENT_HOLDINGS_FULL_12M',
    displayBasis: 'GROSS_SCHEDULED_PAYOUTS',
    actual: {
      year: 2026,
      items: [],
      totalNet: 0,
      count: 0,
      observation: { available: true, from: '2026-01-01T00:00:00.000Z', to: '2026-09-12T00:00:00.000Z', completeMonths: [], partialMonths: [], basis: 'TEST' },
    },
    forecast: { gross: 0, tax: 0, net: 0, count: 0 },
    next: null,
    months: [],
    events: [],
    coverage: { eligibleAssets: 4, scheduledEvents: 4, resolvedAssets: 3, coverageRatio: 0.75, errors: [] },
    identity: { couponScheduleEvents: 0, couponScheduleIdentified: 0, couponScheduleCoverage: 0, basis: null },
    integrity: { complete: false, minimumCoverage: 0.95 },
    stale: false,
    warning: null,
    note: null,
    ...overrides,
  }
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const data = calendar({
  actual: {
    year: 2026,
    totalNet: 300,
    count: 4,
    observation: {
      available: true,
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-09-12T00:00:00.000Z',
      completeMonths: ['2026-01', '2026-02', '2026-03'],
      partialMonths: ['2026-09'],
      basis: 'TEST',
    },
    items: [
      event({ figi: 'FIGI_A', status: 'FACT', net: 100 }),
      event({ figi: ' figi_a ', status: 'fact', net: 50 }),
      event({ figi: 'FIGI_B', status: 'FACT', net: 150 }),
      event({ figi: 'FIGI_A', status: 'FACT', net: 0 }),
      event({ figi: 'FIGI_A', status: 'FORECAST', net: 999 }),
    ],
  },
  events: [
    event({ figi: 'FIGI_A', gross: 80, status: undefined }),
    event({ figi: 'figi_a', gross: 20, status: 'FORECAST' }),
    event({ figi: 'FIGI_B', gross: 300, status: undefined }),
    event({ figi: 'FIGI_A', gross: 999, status: 'FACT' }),
    event({ figi: 'FIGI_A', gross: -10, status: undefined }),
  ],
})

const exact = calculatePositionIncomeContribution({ figi: 'figi_a' }, data)
assert.equal(exact.version, POSITION_INCOME_CONTRIBUTION_VERSION)
assert.equal(exact.version, '1.1')
assert.equal(exact.available, true)
assert.equal(exact.figi, 'FIGI_A')
close(exact.factNet, 150)
assert.equal(exact.factCount, 2)
close(exact.factShare, 0.5)
assert.equal(exact.factObservationFrom, '2026-01-01T00:00:00.000Z')
assert.equal(exact.factObservationTo, '2026-09-12T00:00:00.000Z')
assert.equal(exact.factObservationCompleteMonths, 3)
close(exact.scheduledGross, 100)
assert.equal(exact.scheduledCount, 2)
close(exact.scheduledShare, 0.25)
close(exact.scheduleCoverageRatio, 0.75)
assert.equal(exact.reason, null)
assert.match(exact.note, /Exact FIGI only/)
assert.match(exact.note, /observation window/)
assert.match(exact.note, /FACT↔schedule/)

const aliasOnly = calculatePositionIncomeContribution({ figi: 'FIGI_C' }, calendar({
  actual: {
    year: 2026,
    totalNet: 10,
    count: 1,
    observation: { available: true, from: null, to: null, completeMonths: [], partialMonths: [], basis: null },
    items: [event({ ticker: 'SAME', name: 'SAME', figi: 'FIGI_X', status: 'FACT', net: 10 })],
  },
  events: [event({ ticker: 'SAME', name: 'SAME', figi: 'FIGI_X', gross: 20 })],
}))
assert.equal(aliasOnly.available, true)
assert.equal(aliasOnly.factNet, null)
assert.equal(aliasOnly.factCount, 0)
assert.equal(aliasOnly.factShare, null)
assert.equal(aliasOnly.factObservationFrom, null)
assert.equal(aliasOnly.factObservationTo, null)
assert.equal(aliasOnly.factObservationCompleteMonths, 0)
assert.equal(aliasOnly.scheduledGross, null)
assert.equal(aliasOnly.scheduledCount, 0)
assert.equal(aliasOnly.scheduledShare, null)

const noObservation = calculatePositionIncomeContribution({ figi: 'FIGI_A' }, calendar({
  actual: {
    year: 2026,
    totalNet: 100,
    count: 1,
    observation: { available: false, from: '2026-01-01T00:00:00.000Z', to: '2026-09-12T00:00:00.000Z', completeMonths: ['2026-01'], partialMonths: [], basis: 'TEST' },
    items: [event({ figi: 'FIGI_A', status: 'FACT', net: 100 })],
  },
}))
close(noObservation.factNet, 100)
assert.equal(noObservation.factObservationFrom, null)
assert.equal(noObservation.factObservationTo, null)
assert.equal(noObservation.factObservationCompleteMonths, null)

const noFigi = calculatePositionIncomeContribution({ figi: null }, data)
assert.equal(noFigi.available, false)
assert.equal(noFigi.figi, null)
assert.match(noFigi.reason ?? '', /no verified FIGI/i)

const unavailable = calculatePositionIncomeContribution({ figi: 'FIGI_A' }, calendar({
  available: false,
  coverage: { eligibleAssets: 4, scheduledEvents: 0, resolvedAssets: 0, coverageRatio: 0, errors: [] },
}))
assert.equal(unavailable.available, false)
assert.equal(unavailable.factNet, null)
assert.equal(unavailable.scheduledGross, null)
assert.equal(unavailable.scheduleCoverageRatio, null)
assert.match(unavailable.reason ?? '', /unavailable/i)

console.log('position income contribution regression: ok')
