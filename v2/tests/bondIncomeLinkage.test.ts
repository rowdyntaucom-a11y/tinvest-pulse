import assert from 'node:assert/strict'
import {
  BOND_INCOME_LINKAGE_CALC_VERSION,
  buildBondIncomeLinkage,
} from '../src/features/income/bondIncomeLinkage.ts'
import type { PayoutEvent } from '../src/lib/payoutsApi.ts'
import type { PositionSnapshot } from '../src/lib/portfolioApi.ts'

function position(
  ticker: string,
  instrumentType: string,
  currentValue: number,
  figi: string | null,
  name = ticker,
): PositionSnapshot {
  return {
    figi,
    instrumentUid: null,
    ticker,
    name,
    instrumentType,
    quantity: 1,
    averagePrice: 1,
    costBasis: 1,
    currentPrice: 1,
    currentValue,
    expectedYield: 0,
    weight: 0,
    bond: null,
  }
}

function event(
  kind: string,
  figi: string | null,
  date: string,
  gross: number | null,
  status?: string,
): PayoutEvent {
  return {
    kind,
    figi,
    ticker: figi || '—',
    name: figi || '—',
    date,
    gross,
    status,
  }
}

function close(actual: number, expected: number, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const positions = [
  position('SU1', 'bond', 100, 'figi-a'),
  position('SU2', 'share', 200, 'FIGI-B', 'ОФЗ тест'),
  position('CORP', 'bond', 300, 'FIGI-C'),
  position('NO_FIGI', 'bond', 50, null),
  position('ZERO', 'bond', 0, 'FIGI-Z'),
  position('SBER', 'share', 1000, 'FIGI-SBER', 'Сбер'),
]

const result = buildBondIncomeLinkage(positions, [
  event('COUPON', 'FIGI-A', '2026-12-10T00:00:00.000Z', 15),
  event('COUPON', 'figi-a', '2026-10-10T00:00:00.000Z', 10),
  event('COUPON', 'FIGI-B', '2026-11-10T00:00:00.000Z', 20),
  event('COUPON', 'FIGI-C', '2026-09-20T00:00:00.000Z', 30, 'FACT'),
  event('DIVIDEND', 'FIGI-C', '2026-10-20T00:00:00.000Z', 40),
  event('COUPON', 'FIGI-C', 'not-a-date', 50),
  event('COUPON', null, '2026-10-20T00:00:00.000Z', 60),
])

assert.equal(result.version, BOND_INCOME_LINKAGE_CALC_VERSION)
assert.equal(result.version, '1.1')
assert.equal(result.eligibleBondCount, 4)
assert.equal(result.linkedBondCount, 2)
close(result.totalBondValue, 650)
close(result.linkedBondValue, 300)
close(result.valueCoverage, 300 / 650)
assert.equal(result.couponEvents, 3)
close(result.scheduledGross, 45)
assert.deepEqual(result.rows.map(row => row.figi), ['FIGI-A', 'FIGI-B'])
assert.equal(result.rows[0].couponEvents, 2)
close(result.rows[0].scheduledGross, 25)
assert.equal(result.rows[0].nextCouponDate, '2026-10-10T00:00:00.000Z')
assert.equal(result.rows[1].couponEvents, 1)
close(result.rows[1].scheduledGross, 20)
assert.match(result.note, /FACT events are rejected/)

const factOnly = buildBondIncomeLinkage([
  position('BOND', 'bond', 100, 'FIGI-X'),
], [
  event('COUPON', 'FIGI-X', '2026-09-20T00:00:00.000Z', 10, 'FACT'),
])
assert.equal(factOnly.eligibleBondCount, 1)
assert.equal(factOnly.linkedBondCount, 0)
assert.equal(factOnly.couponEvents, 0)
close(factOnly.scheduledGross, 0)
close(factOnly.valueCoverage, 0)

const invalidValues = buildBondIncomeLinkage([
  position('NAN', 'bond', Number.NaN, 'FIGI-NAN'),
  position('NEG', 'bond', -10, 'FIGI-NEG'),
], [
  event('COUPON', 'FIGI-NAN', '2026-10-20T00:00:00.000Z', 10),
])
assert.equal(invalidValues.eligibleBondCount, 0)
assert.equal(invalidValues.linkedBondCount, 0)
close(invalidValues.totalBondValue, 0)
close(invalidValues.valueCoverage, 0)

const empty = buildBondIncomeLinkage([], [])
assert.equal(empty.eligibleBondCount, 0)
assert.equal(empty.linkedBondCount, 0)
assert.equal(empty.rows.length, 0)
close(empty.scheduledGross, 0)

console.log('bond income linkage regression: ok')
