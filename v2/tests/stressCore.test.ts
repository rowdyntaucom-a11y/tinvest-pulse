import assert from 'node:assert/strict'
import { calculateStressScenario, STRESS_CALC_VERSION } from '../src/features/analytics/stress.ts'

const close = (actual: number | null, expected: number, tolerance = 1e-10) => {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const exposures = [
  { key: 'EQ', label: 'Equity', classKey: 'equity', currentValue: 100 },
  { key: 'OFZ', label: 'OFZ', classKey: 'ofz', currentValue: 50 },
  { key: 'OTHER', label: 'Other', classKey: 'other', currentValue: 50 },
]

const partial = calculateStressScenario(exposures, {
  id: 'partial',
  label: 'Partial',
  source: 'test',
  sourceDate: '2026-01-01',
  shocks: { equity: -0.20, ofz: -0.10 },
})
assert.equal(partial.calcVersion, STRESS_CALC_VERSION)
assert.equal(partial.calcVersion, '1.1')
assert.equal(partial.available, true)
close(partial.currentValue, 200)
close(partial.coveredValue, 150)
close(partial.coverageRatio, 0.75)
close(partial.shockedCoveredValue, 125)
close(partial.pnlCovered, -25)
close(partial.pnlCoveredPct, -25 / 150)
assert.equal(partial.rows.find(row => row.key === 'OTHER')?.shock, null)
assert.equal(partial.rows.find(row => row.key === 'OTHER')?.pnl, null)

const totalLoss = calculateStressScenario([
  { key: 'EQ', label: 'Equity', classKey: 'equity', currentValue: 100 },
], {
  id: 'total-loss',
  label: 'Total loss',
  source: 'test',
  sourceDate: null,
  shocks: { equity: -1 },
})
assert.equal(totalLoss.available, true)
close(totalLoss.rows[0].shockedValue, 0)
close(totalLoss.rows[0].pnl, -100)
close(totalLoss.pnlCoveredPct, -1)

const impossible = calculateStressScenario([
  { key: 'EQ', label: 'Equity', classKey: 'equity', currentValue: 100 },
], {
  id: 'impossible',
  label: 'Impossible',
  source: 'test',
  sourceDate: null,
  shocks: { equity: -1.01 },
})
assert.equal(impossible.available, false)
assert.equal(impossible.coveredValue, 0)
assert.equal(impossible.coverageRatio, 0)
assert.equal(impossible.shockedCoveredValue, null)
assert.equal(impossible.pnlCovered, null)
assert.equal(impossible.pnlCoveredPct, null)
assert.equal(impossible.rows[0].shock, null)
assert.equal(impossible.rows[0].shockedValue, null)
assert.equal(impossible.rows[0].pnl, null)

const upside = calculateStressScenario([
  { key: 'EQ', label: 'Equity', classKey: 'equity', currentValue: 100 },
], {
  id: 'upside',
  label: 'Upside',
  source: 'test',
  sourceDate: null,
  shocks: { equity: 1.5 },
})
assert.equal(upside.available, true)
close(upside.rows[0].shockedValue, 250)
close(upside.rows[0].pnl, 150)

const invalidExposure = calculateStressScenario([
  { key: 'ZERO', label: 'Zero', classKey: 'equity', currentValue: 0 },
  { key: 'NEG', label: 'Negative', classKey: 'equity', currentValue: -10 },
  { key: 'NAN', label: 'NaN', classKey: 'equity', currentValue: Number.NaN },
], {
  id: 'invalid-exposure',
  label: 'Invalid exposure',
  source: 'test',
  sourceDate: null,
  shocks: { equity: -0.2 },
})
assert.equal(invalidExposure.rows.length, 0)
assert.equal(invalidExposure.available, false)
assert.equal(invalidExposure.currentValue, 0)

console.log('stress core regression: ok')
