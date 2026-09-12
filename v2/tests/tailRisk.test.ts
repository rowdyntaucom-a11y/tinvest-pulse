import assert from 'node:assert/strict'
import { calculateTailRisk, TAIL_RISK_CALC_VERSION } from '../src/features/analytics/tailRisk.ts'

const close = (actual: number | null, expected: number, tolerance = 1e-10) => {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

function historyFromReturns(returns: number[]) {
  const rows = [{ date: '2026-01-01', portfolio: 100, imoex: null }]
  let value = 100
  for (let index = 0; index < returns.length; index += 1) {
    value *= 1 + returns[index]
    const date = new Date(Date.UTC(2026, 0, 2 + index)).toISOString().slice(0, 10)
    rows.push({ date, portfolio: value, imoex: null })
  }
  return rows
}

const insufficient = calculateTailRisk(historyFromReturns(Array.from({ length: 125 }, () => 0.001)))
assert.equal(insufficient.calcVersion, TAIL_RISK_CALC_VERSION)
assert.equal(insufficient.calcVersion, '1.2')
assert.equal(insufficient.available, false)
assert.equal(insufficient.status, 'insufficient_history')
assert.equal(insufficient.returns, 125)
assert.equal(insufficient.minimumReturns, 126)
assert.equal(insufficient.var95Loss, null)
assert.equal(insufficient.cvar95Loss, null)
assert.equal(insufficient.sampleFrom, '2026-01-01')
assert.equal(insufficient.sampleTo, '2026-05-06')
assert.equal(insufficient.duplicateRowsCollapsed, 0)
assert.equal(insufficient.conflictingDates, 0)

const tailReturns = [
  -0.60, -0.10, -0.08, -0.06, -0.05, -0.04, -0.03,
  ...Array.from({ length: 119 }, () => 0.002),
]
const preview = calculateTailRisk(historyFromReturns(tailReturns))
assert.equal(preview.available, true)
assert.equal(preview.status, 'preview')
assert.equal(preview.returns, 126)
assert.equal(preview.tailObservations, 7)
close(preview.worstDay, -0.60)
close(preview.downsideFrequency, 7 / 126)
close(preview.var95Loss, 0.022)
close(preview.cvar95Loss, 0.96 / 7)
assert.ok((preview.cvar95Loss ?? 0) >= (preview.var95Loss ?? 0))

// Regression guard: the old implementation silently removed returns outside
// (-50%, +50%), which could understate historical tail risk. A finite -60%
// TWR observation must remain in the sample and be the observed worst day.
assert.equal(preview.returns, tailReturns.length)
close(preview.worstDay, -0.60)

const exactDuplicateHistory = historyFromReturns(tailReturns)
exactDuplicateHistory.push({ ...exactDuplicateHistory[40] })
const exactDuplicate = calculateTailRisk(exactDuplicateHistory)
assert.equal(exactDuplicate.available, true)
assert.equal(exactDuplicate.status, 'preview')
assert.equal(exactDuplicate.returns, 126)
assert.equal(exactDuplicate.duplicateRowsCollapsed, 1)
assert.equal(exactDuplicate.conflictingDates, 0)
close(exactDuplicate.var95Loss, preview.var95Loss ?? 0)
close(exactDuplicate.cvar95Loss, preview.cvar95Loss ?? 0)

const conflictingHistory = historyFromReturns(tailReturns)
conflictingHistory.push({
  ...conflictingHistory[40],
  portfolio: conflictingHistory[40].portfolio * 1.01,
})
const conflicting = calculateTailRisk(conflictingHistory)
assert.equal(conflicting.available, false)
assert.equal(conflicting.status, 'invalid_history')
assert.equal(conflicting.conflictingDates, 1)
assert.equal(conflicting.var95Loss, null)
assert.equal(conflicting.cvar95Loss, null)
assert.equal(conflicting.worstDay, null)
assert.equal(conflicting.downsideFrequency, null)
assert.equal(conflicting.tailObservations, 0)

const matureReturns = Array.from({ length: 252 }, (_, index) => index % 3 === 0 ? -0.004 : 0.003)
const mature = calculateTailRisk(historyFromReturns(matureReturns))
assert.equal(mature.available, true)
assert.equal(mature.status, 'mature')
assert.equal(mature.returns, 252)
assert.equal(mature.matureReturns, 252)
assert.equal(mature.duplicateRowsCollapsed, 0)
assert.equal(mature.conflictingDates, 0)

console.log('tail risk regression: ok')
