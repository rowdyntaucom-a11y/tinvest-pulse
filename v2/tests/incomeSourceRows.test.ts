import assert from 'node:assert/strict'
import {
  buildIncomeSourceRows,
  INCOME_SOURCE_ROWS_VERSION,
} from '../src/features/income/incomeSourceRows.ts'
import type { PayoutEvent } from '../src/lib/payoutsApi.ts'
import type { PositionSnapshot } from '../src/lib/portfolioApi.ts'

function event(overrides: Partial<PayoutEvent> = {}): PayoutEvent {
  return {
    kind: 'COUPON',
    ticker: 'SRC',
    name: 'Source',
    figi: 'FIGI_A',
    date: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

function position(overrides: Partial<PositionSnapshot> = {}): PositionSnapshot {
  return {
    figi: 'FIGI_A',
    instrumentUid: null,
    ticker: 'SRC',
    name: 'Source',
    instrumentType: 'bond',
    quantity: 1,
    averagePrice: 1000,
    costBasis: 1000,
    currentPrice: 1000,
    currentValue: 1000,
    expectedYield: 0,
    weight: 1,
    bond: null,
    ...overrides,
  }
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const exact = buildIncomeSourceRows(
  [
    event({ status: 'FACT', net: 100, figi: ' figi_a ' }),
    event({ status: 'FACT', net: 50, figi: 'FIGI_A' }),
    event({ status: 'FORECAST', net: 999, figi: 'FIGI_A' }),
  ],
  [
    event({ gross: 80, figi: 'FIGI_A' }),
    event({ gross: 20, figi: 'figi_a' }),
    event({ status: 'FACT', gross: 999, figi: 'FIGI_A' }),
    event({ gross: -5, figi: 'FIGI_A' }),
  ],
  [position()],
)
assert.equal(INCOME_SOURCE_ROWS_VERSION, '1.1')
assert.equal(exact.length, 1)
assert.equal(exact[0].identityState, 'EXACT_FIGI')
assert.equal(exact[0].figi, 'FIGI_A')
assert.equal(exact[0].matchBasis, 'FIGI')
close(exact[0].fact, 150)
close(exact[0].forecast, 100)
close(exact[0].costBasis, 1000)
close(exact[0].yoc12m, 0.1)
assert.equal(exact[0].factCount, 2)
assert.equal(exact[0].forecastCount, 2)

const aliasOnly = buildIncomeSourceRows(
  [event({ status: 'FACT', net: 100, figi: null, ticker: 'SAME', name: 'Same' })],
  [event({ gross: 120, figi: null, ticker: 'SAME', name: 'Same' })],
  [position({ figi: 'FIGI_REAL', ticker: 'SAME', name: 'Same', costBasis: 600 })],
)
assert.equal(aliasOnly[0].identityState, 'NO_FIGI')
assert.equal(aliasOnly[0].figi, null)
assert.equal(aliasOnly[0].matchBasis, null)
assert.equal(aliasOnly[0].costBasis, 0)
assert.equal(aliasOnly[0].yoc12m, null)

const incomplete = buildIncomeSourceRows(
  [event({ status: 'FACT', net: 100, figi: 'FIGI_A' })],
  [event({ gross: 120, figi: null })],
  [position()],
)
assert.equal(incomplete[0].identityState, 'INCOMPLETE_FIGI')
assert.equal(incomplete[0].figi, null)
assert.equal(incomplete[0].matchBasis, null)
assert.equal(incomplete[0].yoc12m, null)

const ambiguous = buildIncomeSourceRows(
  [event({ status: 'FACT', net: 100, figi: 'FIGI_A', ticker: 'SAME', name: 'Same' })],
  [event({ gross: 120, figi: 'FIGI_B', ticker: 'SAME', name: 'Same' })],
  [
    position({ figi: 'FIGI_A', ticker: 'SAME', name: 'Same', costBasis: 1000 }),
    position({ figi: 'FIGI_B', ticker: 'SAME', name: 'Same', costBasis: 2000 }),
  ],
)
assert.equal(ambiguous[0].identityState, 'AMBIGUOUS_FIGI')
assert.equal(ambiguous[0].figi, null)
assert.equal(ambiguous[0].matchBasis, null)
assert.equal(ambiguous[0].yoc12m, null)

const duplicatePosition = buildIncomeSourceRows(
  [],
  [event({ gross: 100, figi: 'FIGI_A' })],
  [position(), position({ name: 'Duplicate row' })],
)
assert.equal(duplicatePosition[0].identityState, 'EXACT_FIGI')
assert.equal(duplicatePosition[0].figi, 'FIGI_A')
assert.equal(duplicatePosition[0].matchBasis, null)
assert.equal(duplicatePosition[0].yoc12m, null)

const sorted = buildIncomeSourceRows(
  [
    event({ status: 'FACT', net: 10, figi: 'FIGI_A', ticker: 'B', name: 'B' }),
    event({ status: 'FACT', net: 20, figi: 'FIGI_B', ticker: 'A', name: 'A' }),
  ],
  [],
  [],
  1,
)
assert.equal(sorted.length, 1)
assert.equal(sorted[0].ticker, 'A')

console.log('income source rows regression: ok')
