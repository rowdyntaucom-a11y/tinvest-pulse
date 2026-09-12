import assert from 'node:assert/strict'
import {
  ANNUAL_RETURN_UNIT_CONTRACT_VERSION,
  annualReturnRatioToPercent,
} from '../src/features/analytics/returnUnits.ts'

assert.equal(ANNUAL_RETURN_UNIT_CONTRACT_VERSION, '1.0')
assert.equal(annualReturnRatioToPercent(null), null)
assert.equal(annualReturnRatioToPercent(undefined), null)
assert.equal(annualReturnRatioToPercent(Number.NaN), null)
assert.equal(annualReturnRatioToPercent(Number.POSITIVE_INFINITY), null)
assert.equal(annualReturnRatioToPercent(0), 0)
assert.equal(annualReturnRatioToPercent(0.0125), 1.25)
assert.equal(annualReturnRatioToPercent(-0.25), -25)
assert.equal(annualReturnRatioToPercent(1), 100)
assert.equal(annualReturnRatioToPercent(6), 600)
assert.equal(annualReturnRatioToPercent(-9.5), -950)

console.log('annual return unit contract regression: ok')
