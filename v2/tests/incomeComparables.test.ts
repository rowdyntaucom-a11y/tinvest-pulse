import assert from 'node:assert/strict'
import {
  calculateIncomeComparablePeriod,
  INCOME_COMPARABLES_CALC_VERSION,
} from '../src/features/income/incomeComparables.ts'
import type { IncomeHistoryMonth } from '../src/features/income/incomeHistory.ts'

function month(
  key: string,
  totalNet: number,
  couponsNet = 0,
  dividendsNet = 0,
  complete = true,
): IncomeHistoryMonth {
  return {
    key,
    totalNet,
    couponsNet,
    dividendsNet,
    otherNet: Math.max(0, totalNet - couponsNet - dividendsNet),
    eventCount: totalNet > 0 ? 1 : 0,
    observed: complete,
    complete,
    partial: !complete,
  }
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const none = calculateIncomeComparablePeriod([
  month('2026-01', 100, 100, 0, false),
  month('bad', 100),
])
assert.equal(none.calcVersion, INCOME_COMPARABLES_CALC_VERSION)
assert.equal(none.calcVersion, '1.1')
assert.equal(none.available, false)
assert.equal(none.currentYear, null)

const twoPairs = calculateIncomeComparablePeriod([
  month('2025-01', 50), month('2025-02', 60),
  month('2026-01', 70), month('2026-02', 80),
  month('2026-03', 999, 0, 999, false),
])
assert.equal(twoPairs.available, false)
assert.equal(twoPairs.status, 'INSUFFICIENT')
assert.equal(twoPairs.currentYear, 2026)
assert.equal(twoPairs.previousYear, 2025)
assert.equal(twoPairs.monthCount, 2)
assert.deepEqual(twoPairs.months, [1, 2])
assert.equal(twoPairs.currentNet, null)

const preview = calculateIncomeComparablePeriod([
  month('2025-01', 50, 40, 10),
  month('2025-02', 50, 50, 0),
  month('2025-03', 100, 0, 100),
  month('2026-01', 100, 80, 20),
  month('2026-02', 0, 0, 0),
  month('2026-03', 200, 50, 150),
  month('2024-12', 999),
])
assert.equal(preview.available, true)
assert.equal(preview.status, 'PREVIEW')
assert.equal(preview.currentYear, 2026)
assert.equal(preview.previousYear, 2025)
assert.equal(preview.monthCount, 3)
assert.deepEqual(preview.months, [1, 2, 3])
close(preview.currentNet, 300)
close(preview.previousNet, 200)
close(preview.changeNet, 100)
close(preview.changeRatio, 0.5)
close(preview.currentCouponsNet, 130)
close(preview.previousCouponsNet, 90)
close(preview.currentDividendsNet, 170)
close(preview.previousDividendsNet, 110)

const zeroBase = calculateIncomeComparablePeriod([
  month('2025-01', 0), month('2025-02', 0), month('2025-03', 0),
  month('2026-01', 10), month('2026-02', 20), month('2026-03', 30),
])
assert.equal(zeroBase.available, true)
close(zeroBase.previousNet, 0)
close(zeroBase.currentNet, 60)
close(zeroBase.changeNet, 60)
assert.equal(zeroBase.changeRatio, null)

const matureRows: IncomeHistoryMonth[] = []
for (let number = 1; number <= 12; number += 1) {
  const suffix = String(number).padStart(2, '0')
  matureRows.push(month(`2025-${suffix}`, number * 10, number * 6, number * 4))
  matureRows.push(month(`2026-${suffix}`, number * 12, number * 7, number * 5))
}
const mature = calculateIncomeComparablePeriod(matureRows)
assert.equal(mature.available, true)
assert.equal(mature.status, 'MATURE')
assert.equal(mature.monthCount, 12)
assert.deepEqual(mature.months, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
close(mature.previousNet, 780)
close(mature.currentNet, 936)
close(mature.changeNet, 156)
close(mature.changeRatio, 0.2)

const duplicate = calculateIncomeComparablePeriod([
  month('2025-01', 10), month('2025-02', 10), month('2025-03', 10),
  month('2026-01', 20), month('2026-01', 25), month('2026-02', 20), month('2026-03', 20),
])
assert.equal(duplicate.available, false)
assert.equal(duplicate.currentYear, 2026)
assert.equal(duplicate.monthCount, 0)
assert.match(duplicate.note, /duplicate/i)

const invalidAmounts = calculateIncomeComparablePeriod([
  month('2025-01', Number.NaN), month('2025-02', -10), month('2025-03', 0),
  month('2026-01', 30), month('2026-02', 30), month('2026-03', 30),
])
assert.equal(invalidAmounts.available, true)
close(invalidAmounts.previousNet, 0)
close(invalidAmounts.currentNet, 90)
assert.equal(invalidAmounts.changeRatio, null)

console.log('income comparables regression: ok')
