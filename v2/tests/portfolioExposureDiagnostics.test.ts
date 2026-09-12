import assert from 'node:assert/strict'
import { calculatePortfolioTopExposure } from '../src/features/portfolio/portfolioExposureDiagnostics.ts'

const ordered = calculatePortfolioTopExposure([
  { ticker: 'A', weight: 0.10 },
  { ticker: 'B', weight: 0.40 },
  { ticker: 'C', weight: 0.20 },
  { ticker: 'D', weight: 0.30 },
], 3)
assert.equal(ordered.available, true)
assert.equal(ordered.eligibleCount, 4)
assert.equal(ordered.includedCount, 3)
assert.equal(ordered.identifiedIncludedCount, 3)
assert.ok(Math.abs((ordered.topWeight ?? 0) - 0.90) < 1e-12)
assert.ok(Math.abs((ordered.eligibleWeight ?? 0) - 1.00) < 1e-12)
assert.deepEqual(ordered.topPositions, [
  { label: 'B', weight: 0.40 },
  { label: 'D', weight: 0.30 },
  { label: 'C', weight: 0.20 },
])

const shuffled = calculatePortfolioTopExposure([
  { ticker: 'D', weight: 0.30 },
  { ticker: 'A', weight: 0.10 },
  { ticker: 'B', weight: 0.40 },
  { ticker: 'C', weight: 0.20 },
], 3)
assert.equal(shuffled.topWeight, ordered.topWeight)
assert.deepEqual(shuffled.topPositions, ordered.topPositions)

const equalWeightA = calculatePortfolioTopExposure([
  { ticker: 'ZZZ', weight: 0.25 },
  { ticker: 'AAA', weight: 0.25 },
], 2)
const equalWeightB = calculatePortfolioTopExposure([
  { ticker: 'AAA', weight: 0.25 },
  { ticker: 'ZZZ', weight: 0.25 },
], 2)
assert.deepEqual(equalWeightA.topPositions, equalWeightB.topPositions)
assert.deepEqual(equalWeightA.topPositions.map(item => item.label), ['AAA', 'ZZZ'])

const sanitized = calculatePortfolioTopExposure([
  { ticker: 'BAD_NAN', weight: Number.NaN },
  { ticker: 'BAD_NEG', weight: -0.20 },
  { ticker: 'BAD_ZERO', weight: 0 },
  { ticker: 'GOOD', weight: 0.25 },
  { name: 'Без тикера', weight: 0.15 },
], 3)
assert.equal(sanitized.eligibleCount, 2)
assert.equal(sanitized.includedCount, 2)
assert.equal(sanitized.identifiedIncludedCount, 2)
assert.ok(Math.abs((sanitized.topWeight ?? 0) - 0.40) < 1e-12)
assert.deepEqual(sanitized.topPositions.map(item => item.label), ['GOOD', 'Без тикера'])

const unidentified = calculatePortfolioTopExposure([
  { weight: 0.50 },
  { ticker: 'KNOWN', weight: 0.20 },
], 2)
assert.equal(unidentified.identifiedIncludedCount, 1)
assert.deepEqual(unidentified.topPositions, [
  { label: null, weight: 0.50 },
  { label: 'KNOWN', weight: 0.20 },
])

const invalidCount = calculatePortfolioTopExposure([{ ticker: 'ONE', weight: 0.50 }], 0)
assert.equal(invalidCount.available, false)
assert.equal(invalidCount.requestedCount, 0)
assert.equal(invalidCount.topWeight, null)
assert.deepEqual(invalidCount.topPositions, [])

const empty = calculatePortfolioTopExposure([], 3)
assert.equal(empty.available, false)
assert.equal(empty.topWeight, null)
assert.equal(empty.eligibleWeight, null)
assert.deepEqual(empty.topPositions, [])

console.log('portfolioExposureDiagnostics tests passed')
