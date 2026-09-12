import assert from 'node:assert/strict'
import {
  calculateCurrentRiskContribution,
  CURRENT_RISK_CONTRIBUTION_CALC_VERSION,
  type CurrentRiskSeriesInput,
} from '../src/features/analytics/currentRiskContribution.ts'

const DAY_MS = 86_400_000

function makeSeries(key: string, returns: number[], currentValue: number, label = key): CurrentRiskSeriesInput {
  let value = 100
  const start = Date.parse('2025-01-01T00:00:00.000Z')
  const points = [{ date: '2025-01-01', value }]
  for (let index = 0; index < returns.length; index += 1) {
    value *= 1 + returns[index]
    points.push({
      date: new Date(start + (index + 1) * DAY_MS).toISOString().slice(0, 10),
      value,
    })
  }
  return { key, label, points, currentValue }
}

function pattern(length: number) {
  return Array.from({ length }, (_, index) => index % 2 === 0 ? 0.01 : -0.005)
}

function close(actual: number | null, expected: number, tolerance = 1e-10) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const short = calculateCurrentRiskContribution([
  makeSeries('A', pattern(59), 60),
  makeSeries('B', pattern(59), 40),
], 125)
assert.equal(short.calcVersion, CURRENT_RISK_CONTRIBUTION_CALC_VERSION)
assert.equal(short.calcVersion, '1.0')
assert.equal(short.available, false)
assert.equal(short.status, 'INSUFFICIENT_HISTORY')
assert.equal(short.commonReturns, 59)
assert.equal(short.assetCount, 2)
close(short.coverageRatio, 0.8)

const preview = calculateCurrentRiskContribution([
  makeSeries('A', pattern(60), 60),
  makeSeries('B', pattern(60), 40),
], 125)
assert.equal(preview.available, true)
assert.equal(preview.status, 'PREVIEW')
assert.equal(preview.commonReturns, 60)
assert.equal(preview.rows.length, 2)
close(preview.rows[0].weight, 0.6)
close(preview.rows[1].weight, 0.4)
close(preview.rows[0].riskContributionShare, 0.6)
close(preview.rows[1].riskContributionShare, 0.4)
close(preview.rows.reduce((sum, row) => sum + (row.riskContributionShare ?? 0), 0), 1)
assert.equal(preview.topAbsoluteContributor?.key, 'A')
assert.ok((preview.annualizedVolatility ?? 0) > 0)
close(preview.coveredValue, 100)
close(preview.totalPortfolioValue, 125)
close(preview.coverageRatio, 0.8)

const mature = calculateCurrentRiskContribution([
  makeSeries('A', pattern(252), 75),
  makeSeries('B', pattern(252), 25),
], 100)
assert.equal(mature.available, true)
assert.equal(mature.status, 'MATURE')
assert.equal(mature.commonReturns, 252)
assert.equal(mature.matureReturns, 252)
close(mature.rows[0].riskContributionShare, 0.75)
close(mature.rows[1].riskContributionShare, 0.25)
close(mature.coverageRatio, 1)

const duplicate = calculateCurrentRiskContribution([
  makeSeries('DUP', pattern(60), 50),
  makeSeries('DUP', pattern(60), 50),
], 100)
assert.equal(duplicate.available, false)
assert.match(duplicate.reason ?? '', /Duplicate series keys/)

const flat = calculateCurrentRiskContribution([
  makeSeries('FLAT_A', new Array(60).fill(0), 60),
  makeSeries('FLAT_B', new Array(60).fill(0), 40),
], 100)
assert.equal(flat.available, false)
close(flat.annualizedVolatility, 0)
assert.equal(flat.rows.length, 0)
assert.equal(flat.topAbsoluteContributor, null)

const invalidValues = calculateCurrentRiskContribution([
  makeSeries('GOOD', pattern(60), 100),
  makeSeries('NAN', pattern(60), Number.NaN),
  makeSeries('NEG', pattern(60), -5),
], 100)
assert.equal(invalidValues.available, false)
assert.equal(invalidValues.assetCount, 1)
close(invalidValues.coveredValue, 100)
close(invalidValues.coverageRatio, 1)

console.log('current risk contribution regression: ok')
