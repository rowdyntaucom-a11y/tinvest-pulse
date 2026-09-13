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

function repeating(length: number, values: number[]) {
  return Array.from({ length }, (_, index) => values[index % values.length])
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
assert.equal(short.calcVersion, '1.4')
assert.equal(short.available, false)
assert.equal(short.status, 'INSUFFICIENT_HISTORY')
assert.equal(short.integrity, 'VALID')
assert.equal(short.duplicateRowsCollapsed, 0)
assert.equal(short.conflictingDates, 0)
assert.equal(short.commonReturns, 59)
assert.equal(short.sampleFrom, '2025-01-01')
assert.equal(short.sampleTo, '2025-03-01')
assert.equal(short.assetCount, 2)
close(short.coverageRatio, 0.8)
assert.equal(short.diversificationRatio, null)
assert.equal(short.effectiveCapitalCount, null)
assert.equal(short.effectiveRiskContributorCount, null)

const preview = calculateCurrentRiskContribution([
  makeSeries('A', pattern(60), 60),
  makeSeries('B', pattern(60), 40),
], 125)
assert.equal(preview.available, true)
assert.equal(preview.status, 'PREVIEW')
assert.equal(preview.integrity, 'VALID')
assert.equal(preview.commonReturns, 60)
assert.equal(preview.sampleFrom, '2025-01-01')
assert.equal(preview.sampleTo, '2025-03-02')
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
close(preview.diversificationRatio, 1)
close(preview.capitalHhi, 0.52)
close(preview.effectiveCapitalCount, 1 / 0.52)
close(preview.riskMagnitudeHhi, 0.52)
close(preview.effectiveRiskContributorCount, 1 / 0.52)
close(preview.topAbsoluteRiskShare, 0.6)
assert.match(preview.note, /2025-01-01 → 2025-03-02/)

const exactDuplicateA = makeSeries('EXACT_A', pattern(60), 60)
exactDuplicateA.points.push({ ...exactDuplicateA.points[20] })
const exactDuplicate = calculateCurrentRiskContribution([
  exactDuplicateA,
  makeSeries('EXACT_B', pattern(60), 40),
], 100)
assert.equal(exactDuplicate.available, true)
assert.equal(exactDuplicate.integrity, 'VALID')
assert.equal(exactDuplicate.duplicateRowsCollapsed, 1)
assert.equal(exactDuplicate.conflictingDates, 0)
assert.equal(exactDuplicate.commonReturns, 60)
assert.equal(exactDuplicate.sampleFrom, '2025-01-01')
assert.equal(exactDuplicate.sampleTo, '2025-03-02')
assert.match(exactDuplicate.note, /Exact same-day duplicates collapsed: 1/)

const conflictingA = makeSeries('CONFLICT_A', pattern(60), 60)
conflictingA.points.push({
  date: conflictingA.points[20].date,
  value: conflictingA.points[20].value * 1.01,
})
const conflicting = calculateCurrentRiskContribution([
  conflictingA,
  makeSeries('CONFLICT_B', pattern(60), 40),
], 100)
assert.equal(conflicting.available, false)
assert.equal(conflicting.integrity, 'CONFLICT')
assert.equal(conflicting.duplicateRowsCollapsed, 0)
assert.equal(conflicting.conflictingDates, 1)
assert.equal(conflicting.commonReturns, 0)
assert.equal(conflicting.sampleFrom, null)
assert.equal(conflicting.sampleTo, null)
assert.equal(conflicting.rows.length, 0)
assert.equal(conflicting.annualizedVolatility, null)
assert.equal(conflicting.diversificationRatio, null)
assert.match(conflicting.reason ?? '', /Conflicting same-day market-history values/)

// 61 nominal returns with one internal missing candle leave only 59 exact
// shared intervals. Ending-date-only matching would incorrectly accept the
// wider return after the gap and cross the 60-return gate.
const gapA = makeSeries('GAP_A', pattern(61), 55)
const gapBBase = makeSeries('GAP_B', repeating(61, [0.004, -0.003, 0.006, -0.002]), 45)
const gapB = { ...gapBBase, points: gapBBase.points.filter((_, index) => index !== 20) }
const gapGuard = calculateCurrentRiskContribution([gapA, gapB], 100)
assert.equal(gapGuard.commonReturns, 59)
assert.equal(gapGuard.available, false)
assert.equal(gapGuard.status, 'INSUFFICIENT_HISTORY')
assert.equal(gapGuard.integrity, 'VALID')
assert.equal(gapGuard.sampleFrom, '2025-01-01')
assert.equal(gapGuard.sampleTo, '2025-03-03')
assert.match(gapGuard.reason ?? '', /identical observation intervals/)

const mature = calculateCurrentRiskContribution([
  makeSeries('A', pattern(252), 75),
  makeSeries('B', pattern(252), 25),
], 100)
assert.equal(mature.available, true)
assert.equal(mature.status, 'MATURE')
assert.equal(mature.integrity, 'VALID')
assert.equal(mature.commonReturns, 252)
assert.equal(mature.matureReturns, 252)
assert.equal(mature.sampleFrom, '2025-01-01')
assert.equal(mature.sampleTo, '2025-09-10')
close(mature.rows[0].riskContributionShare, 0.75)
close(mature.rows[1].riskContributionShare, 0.25)
close(mature.coverageRatio, 1)
close(mature.capitalHhi, 0.625)
close(mature.riskMagnitudeHhi, 0.625)
close(mature.effectiveCapitalCount, 1.6)
close(mature.effectiveRiskContributorCount, 1.6)

const diversified = calculateCurrentRiskContribution([
  makeSeries('A', repeating(60, [0.01, -0.01, 0.01, -0.01]), 50),
  makeSeries('B', repeating(60, [0.01, 0.01, -0.01, -0.01]), 50),
], 100)
assert.equal(diversified.available, true)
close(diversified.diversificationRatio, Math.SQRT2, 1e-8)
close(diversified.effectiveCapitalCount, 2)
close(diversified.effectiveRiskContributorCount, 2)
close(diversified.topAbsoluteRiskShare, 0.5)

const offsetting = calculateCurrentRiskContribution([
  makeSeries('LONG_A', repeating(60, [0.01, -0.01]), 80),
  makeSeries('OFFSET_B', repeating(60, [-0.005, 0.005]), 20),
], 100)
assert.equal(offsetting.available, true)
close(offsetting.rows[0].riskContributionShare, 8 / 7, 1e-8)
close(offsetting.rows[1].riskContributionShare, -1 / 7, 1e-8)
close(offsetting.rows.reduce((sum, row) => sum + (row.riskContributionShare ?? 0), 0), 1, 1e-8)
close(offsetting.diversificationRatio, 9 / 7, 1e-8)
close(offsetting.capitalHhi, 0.68)
close(offsetting.effectiveCapitalCount, 25 / 17, 1e-8)
close(offsetting.riskMagnitudeHhi, 65 / 81, 1e-8)
close(offsetting.effectiveRiskContributorCount, 81 / 65, 1e-8)
close(offsetting.topAbsoluteRiskShare, 8 / 9, 1e-8)
assert.match(offsetting.note, /absolute contribution magnitudes/)

const duplicate = calculateCurrentRiskContribution([
  makeSeries('DUP', pattern(60), 50),
  makeSeries('DUP', pattern(60), 50),
], 100)
assert.equal(duplicate.available, false)
assert.equal(duplicate.integrity, 'VALID')
assert.equal(duplicate.sampleFrom, null)
assert.equal(duplicate.sampleTo, null)
assert.match(duplicate.reason ?? '', /Duplicate series keys/)
assert.equal(duplicate.diversificationRatio, null)

const flat = calculateCurrentRiskContribution([
  makeSeries('FLAT_A', new Array(60).fill(0), 60),
  makeSeries('FLAT_B', new Array(60).fill(0), 40),
], 100)
assert.equal(flat.available, false)
close(flat.annualizedVolatility, 0)
assert.equal(flat.rows.length, 0)
assert.equal(flat.topAbsoluteContributor, null)
assert.equal(flat.effectiveRiskContributorCount, null)

const invalidValues = calculateCurrentRiskContribution([
  makeSeries('GOOD', pattern(60), 100),
  makeSeries('NAN', pattern(60), Number.NaN),
  makeSeries('NEG', pattern(60), -5),
], 100)
assert.equal(invalidValues.available, false)
assert.equal(invalidValues.assetCount, 1)
assert.equal(invalidValues.integrity, 'VALID')
assert.equal(invalidValues.sampleFrom, '2025-01-01')
assert.equal(invalidValues.sampleTo, '2025-03-02')
close(invalidValues.coveredValue, 100)
close(invalidValues.coverageRatio, 1)
assert.equal(invalidValues.capitalHhi, null)

console.log('current risk contribution regression: ok')
