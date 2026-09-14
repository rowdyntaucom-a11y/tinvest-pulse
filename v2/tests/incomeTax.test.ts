import assert from 'node:assert/strict'
import { buildIncomeTaxBridge, estimateIisLongTermDeduction, IIS_LONG_TERM_DEDUCTION_BASE_LIMIT } from '../src/features/income/incomeTax.ts'
import type { PayoutCalendar } from '../src/lib/payoutsApi.ts'

const calendar: PayoutCalendar = {
  available: true,
  generatedAt: '2026-09-14T00:00:00.000Z',
  period: { from: null, to: null },
  basis: null,
  displayBasis: null,
  actual: {
    year: 2026,
    totalNet: 175,
    count: 3,
    observation: { available: true, from: null, to: null, completeMonths: [], partialMonths: [], basis: null },
    items: [
      { kind: 'COUPON', ticker: 'A', name: 'A', date: '2026-01-10T00:00:00.000Z', status: 'FACT', gross: 100, tax: 13, net: 87 },
      { kind: 'DIVIDEND', ticker: 'B', name: 'B', date: '2026-02-10T00:00:00.000Z', status: 'FACT', gross: 100, tax: 12, net: 88 },
      { kind: 'DIVIDEND', ticker: 'C', name: 'C', date: '2026-03-10T00:00:00.000Z', status: 'FACT', gross: null, tax: null, net: null },
    ],
  },
  forecast: { gross: 1000, tax: 130, net: 870, count: 4 },
  next: null,
  months: [],
  events: [],
  coverage: { eligibleAssets: 0, scheduledEvents: 0, resolvedAssets: 0, coverageRatio: 0, errors: [] },
  integrity: { complete: true, minimumCoverage: .95 },
  stale: false,
  warning: null,
  note: null,
}

const bridge = buildIncomeTaxBridge(calendar)
assert.equal(bridge.actual.gross, 200)
assert.equal(bridge.actual.tax, 25)
assert.equal(bridge.actual.net, 175)
assert.equal(bridge.actual.rows, 3)
assert.equal(bridge.actual.completeRows, 2)
assert.equal(bridge.forecast12m.net, 870)

const estimate = estimateIisLongTermDeduction({
  contribution: 500_000,
  otherLongTermSavingsBaseUsed: 50_000,
  ndflRate: .13,
  refundableNdflAvailable: 20_000,
})
assert.equal(IIS_LONG_TERM_DEDUCTION_BASE_LIMIT, 400_000)
assert.equal(estimate.unusedBaseLimit, 350_000)
assert.equal(estimate.eligibleBase, 350_000)
assert.equal(estimate.theoreticalRefund, 45_500)
assert.equal(estimate.refundableEstimate, 20_000)
assert.equal(estimate.limitedByTaxPaid, true)

const noTaxPaid = estimateIisLongTermDeduction({ contribution: 100_000, otherLongTermSavingsBaseUsed: 0, ndflRate: .15 })
assert.equal(noTaxPaid.theoreticalRefund, 15_000)
assert.equal(noTaxPaid.refundableEstimate, null)

console.log('income tax bridge regression: ok')
