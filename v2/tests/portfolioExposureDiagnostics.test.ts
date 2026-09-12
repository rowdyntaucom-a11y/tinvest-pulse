import assert from 'node:assert/strict'
import { calculatePortfolioTopExposure } from '../src/features/portfolio/portfolioExposureDiagnostics.ts'

const ordered = calculatePortfolioTopExposure([
  { weight: 0.10 },
  { weight: 0.40 },
  { weight: 0.20 },
  { weight: 0.30 },
], 3)
assert.equal(ordered.available, true)
assert.equal(ordered.eligibleCount, 4)
assert.equal(ordered.includedCount, 3)
assert.ok(Math.abs((ordered.topWeight ?? 0) - 0.90) < 1e-12)
assert.ok(Math.abs((ordered.eligibleWeight ?? 0) - 1.00) < 1e-12)

const shuffled = calculatePortfolioTopExposure([
  { weight: 0.30 },
  { weight: 0.10 },
  { weight: 0.40 },
  { weight: 0.20 },
], 3)
assert.equal(shuffled.topWeight, ordered.topWeight)

const sanitized = calculatePortfolioTopExposure([
  { weight: Number.NaN },
  { weight: -0.20 },
  { weight: 0 },
  { weight: 0.25 },
  { weight: 0.15 },
], 3)
assert.equal(sanitized.eligibleCount, 2)
assert.equal(sanitized.includedCount, 2)
assert.ok(Math.abs((sanitized.topWeight ?? 0) - 0.40) < 1e-12)

const invalidCount = calculatePortfolioTopExposure([{ weight: 0.50 }], 0)
assert.equal(invalidCount.available, false)
assert.equal(invalidCount.requestedCount, 0)
assert.equal(invalidCount.topWeight, null)

const empty = calculatePortfolioTopExposure([], 3)
assert.equal(empty.available, false)
assert.equal(empty.topWeight, null)
assert.equal(empty.eligibleWeight, null)

console.log('portfolioExposureDiagnostics tests passed')
