import assert from 'node:assert/strict'
import {
  buildRealizedIncomeHistory,
  calculateIncomeGoalProgress,
  calculateIncomeSourceConcentration,
  calculateIncomeStability,
  INCOME_HISTORY_CALC_VERSION,
} from '../src/features/income/incomeHistory.ts'
import type { PayoutEvent, PayoutObservation } from '../src/lib/payoutsApi.ts'

function event(
  kind: string,
  date: string,
  net: number | null,
  ticker = 'SRC',
  status = 'FACT',
  name = ticker,
): PayoutEvent {
  return { kind, date, net, ticker, name, status }
}

function observation(
  completeMonths: string[],
  partialMonths: string[] = [],
  available = true,
): PayoutObservation {
  return {
    available,
    from: completeMonths[0] ? `${completeMonths[0]}-01` : null,
    to: (partialMonths.at(-1) ?? completeMonths.at(-1))
      ? `${partialMonths.at(-1) ?? completeMonths.at(-1)}-28`
      : null,
    completeMonths,
    partialMonths,
    basis: 'test-observation',
  }
}

function months(year: number, count: number) {
  return Array.from({ length: count }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`)
}

function close(actual: number | null, expected: number, tolerance = 1e-10) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const mixed = buildRealizedIncomeHistory([
  event('COUPON', '2025-01-10', 100, 'OFZ'),
  event('DIVIDEND', '2025-01-20', 50, 'SBER'),
  event('INCOME', '2025-02-05', 25, 'OTHER'),
  event('COUPON', '2025-03-15', 10, 'OFZ'),
  event('COUPON', '2025-04-15', 30, 'OFZ'),
  event('COUPON', '2025-01-25', 999, 'OFZ', 'FORECAST'),
  event('COUPON', '2025-02-12', -10, 'OFZ'),
  event('COUPON', 'not-a-date', 40, 'OFZ'),
], observation(['2025-01', '2025-02'], ['2025-01', '2025-03']))

assert.equal(mixed.version, INCOME_HISTORY_CALC_VERSION)
assert.equal(mixed.version, '1.1')
assert.equal(mixed.observation.available, true)
assert.equal(mixed.observation.completeMonths, 2)
assert.equal(mixed.observation.partialMonths, 1)
assert.deepEqual(mixed.months.map(row => row.key), ['2025-01', '2025-02', '2025-03', '2025-04'])

const january = mixed.months.find(row => row.key === '2025-01')!
close(january.totalNet, 150)
close(january.couponsNet, 100)
close(january.dividendsNet, 50)
close(january.otherNet, 0)
assert.equal(january.eventCount, 2)
assert.equal(january.observed, true)
assert.equal(january.complete, true)
assert.equal(january.partial, false)

const february = mixed.months.find(row => row.key === '2025-02')!
close(february.totalNet, 25)
close(february.otherNet, 25)
assert.equal(february.complete, true)

const march = mixed.months.find(row => row.key === '2025-03')!
assert.equal(march.partial, true)
assert.equal(march.complete, false)
close(march.totalNet, 10)

const april = mixed.months.find(row => row.key === '2025-04')!
assert.equal(april.observed, false)
assert.equal(april.complete, false)
assert.equal(april.partial, false)
close(april.totalNet, 30)

const mixedYear = mixed.years[0]
close(mixedYear.totalNet, 215)
close(mixedYear.couponsNet, 140)
close(mixedYear.dividendsNet, 50)
close(mixedYear.otherNet, 25)
assert.equal(mixedYear.eventCount, 5)
assert.equal(mixedYear.monthsCovered, 2)
assert.equal(mixedYear.payoutMonths, 4)
assert.equal(mixedYear.partialMonths, 1)

const shortStability = calculateIncomeStability(mixed)
assert.equal(shortStability.available, false)
assert.equal(shortStability.status, 'insufficient')
assert.equal(shortStability.observedMonths, 2)
assert.equal(shortStability.payoutMonths, 2)
assert.equal(shortStability.zeroIncomeMonths, 0)

const unavailableObservation = buildRealizedIncomeHistory([
  event('COUPON', '2025-01-10', 100, 'OFZ'),
], observation(['2025-01', '2025-02', '2025-03'], [], false))
assert.equal(unavailableObservation.observation.available, false)
assert.equal(unavailableObservation.observation.completeMonths, 0)
assert.equal(unavailableObservation.observation.partialMonths, 0)
assert.equal(unavailableObservation.months.length, 1)
assert.equal(unavailableObservation.months[0].observed, false)
assert.equal(unavailableObservation.months[0].complete, false)
assert.equal(calculateIncomeStability(unavailableObservation).observedMonths, 0)

const previewHistory = buildRealizedIncomeHistory([
  event('COUPON', '2025-01-10', 100, 'OFZ'),
  event('DIVIDEND', '2025-03-10', 200, 'SBER'),
], observation(['2025-01', '2025-02', '2025-03']))
const previewStability = calculateIncomeStability(previewHistory)
assert.equal(previewStability.available, true)
assert.equal(previewStability.status, 'preview')
assert.equal(previewStability.observedMonths, 3)
assert.equal(previewStability.payoutMonths, 2)
assert.equal(previewStability.zeroIncomeMonths, 1)
close(previewStability.averageMonthlyNet, 100)
close(previewStability.largestMonthNet, 200)
close(previewStability.largestMonthShare, 2 / 3)
close(previewStability.coefficientOfVariation, Math.sqrt(2 / 3))

const completeYearHistory = buildRealizedIncomeHistory([
  event('COUPON', '2025-01-15', 1200, 'OFZ'),
], observation(months(2025, 12)))
const matureStability = calculateIncomeStability(completeYearHistory)
assert.equal(matureStability.available, true)
assert.equal(matureStability.status, 'mature')
assert.equal(matureStability.observedMonths, 12)
assert.equal(matureStability.payoutMonths, 1)
assert.equal(matureStability.zeroIncomeMonths, 11)
close(matureStability.averageMonthlyNet, 100)

const noTarget = calculateIncomeGoalProgress(completeYearHistory, 0)
assert.equal(noTarget.available, false)
assert.equal(noTarget.targetAnnualNet, 0)
assert.equal(noTarget.progress, null)

const incompleteGoal = calculateIncomeGoalProgress(
  buildRealizedIncomeHistory([event('COUPON', '2025-01-15', 1100, 'OFZ')], observation(months(2025, 11))),
  2400,
)
assert.equal(incompleteGoal.available, false)
assert.equal(incompleteGoal.comparableMonths, 11)
assert.equal(incompleteGoal.realizedAnnualNet, null)

const completeGoal = calculateIncomeGoalProgress(completeYearHistory, 2400)
assert.equal(completeGoal.available, true)
close(completeGoal.realizedAnnualNet, 1200)
close(completeGoal.progress, 0.5)
assert.equal(completeGoal.comparableMonths, 12)

const concentration = calculateIncomeSourceConcentration([
  event('COUPON', '2025-01-10', 75, 'A'),
  event('DIVIDEND', '2025-01-11', 25, 'B'),
  event('COUPON', '2025-01-12', 999, 'A', 'FORECAST'),
  event('COUPON', '2025-01-13', -5, 'C'),
  event('COUPON', '2025-01-14', 0, 'D'),
])
close(concentration.totalNet, 100)
close(concentration.hhi, 0.625)
close(concentration.effectiveSources, 1.6)
close(concentration.topSourceShare, 0.75)
assert.equal(concentration.sourceCount, 2)

console.log('income history regression: ok')
