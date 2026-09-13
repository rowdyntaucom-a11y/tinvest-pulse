import assert from 'node:assert/strict'
import { calculatePortfolioAnalytics, PORTFOLIO_ANALYTICS_CALC_VERSION } from '../src/features/analytics/metrics.ts'

const close = (actual: number | null, expected: number, tolerance = 1e-10) => {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const history = [
  { date: '2026-01-01', portfolio: 100, imoex: null },
  { date: '2026-01-02', portfolio: 120, imoex: null },
  { date: '2026-01-03', portfolio: 90, imoex: null },
  { date: '2026-01-04', portfolio: 110, imoex: null },
]

const positions = [
  { ticker: 'AAA', name: 'A', instrumentType: 'share', currentValue: 50 },
  { ticker: 'BBB', name: 'B', instrumentType: 'bond', currentValue: 50 },
]

const result = calculatePortfolioAnalytics(history, positions, 0)
assert.equal(result.calcVersion, PORTFOLIO_ANALYTICS_CALC_VERSION)
assert.equal(result.calcVersion, '1.1')
assert.equal(result.historyIntegrity, 'OK')
assert.equal(result.duplicateRowsCollapsed, 0)
assert.equal(result.conflictingDates, 0)
assert.equal(result.sampleFrom, '2026-01-01')
assert.equal(result.sampleTo, '2026-01-04')
assert.equal(result.historyPoints, 4)
assert.equal(result.historyDays, 3)
close(result.twr, 0.10)
close(result.maxDrawdown, 0.25)
close(result.hhi, 0.5)
close(result.effectivePositions, 2)
assert.equal(result.assetClassCount, 2)
assert.ok(result.volatility != null && result.volatility > 0)
assert.ok(result.sharpe != null && Number.isFinite(result.sharpe))
assert.ok(result.sortino != null && Number.isFinite(result.sortino))

const exactDuplicate = calculatePortfolioAnalytics([
  ...history,
  { date: '2026-01-02', portfolio: 120, imoex: null },
], positions, 0)
assert.equal(exactDuplicate.historyIntegrity, 'OK')
assert.equal(exactDuplicate.duplicateRowsCollapsed, 1)
assert.equal(exactDuplicate.conflictingDates, 0)
assert.equal(exactDuplicate.historyPoints, 4)
close(exactDuplicate.twr, 0.10)
close(exactDuplicate.maxDrawdown, 0.25)

const conflictingDuplicate = calculatePortfolioAnalytics([
  ...history,
  { date: '2026-01-02', portfolio: 121, imoex: null },
], positions, 0)
assert.equal(conflictingDuplicate.historyIntegrity, 'CONFLICT')
assert.equal(conflictingDuplicate.duplicateRowsCollapsed, 1)
assert.equal(conflictingDuplicate.conflictingDates, 1)
assert.equal(conflictingDuplicate.sampleFrom, null)
assert.equal(conflictingDuplicate.sampleTo, null)
assert.equal(conflictingDuplicate.historyPoints, 0)
assert.equal(conflictingDuplicate.historyDays, 0)
assert.equal(conflictingDuplicate.twr, null)
assert.equal(conflictingDuplicate.maxDrawdown, null)
assert.equal(conflictingDuplicate.volatility, null)
assert.equal(conflictingDuplicate.sharpe, null)
assert.equal(conflictingDuplicate.sortino, null)
close(conflictingDuplicate.hhi, 0.5)
close(conflictingDuplicate.effectivePositions, 2)
assert.equal(conflictingDuplicate.healthScore, null)

const concentrationOnly = calculatePortfolioAnalytics([], [
  { ticker: 'ONE', name: 'One', instrumentType: 'share', currentValue: 100 },
], null)
assert.equal(concentrationOnly.available, true)
assert.equal(concentrationOnly.historyIntegrity, 'OK')
assert.equal(concentrationOnly.historyPoints, 0)
assert.equal(concentrationOnly.twr, null)
assert.equal(concentrationOnly.maxDrawdown, null)
assert.equal(concentrationOnly.volatility, null)
assert.equal(concentrationOnly.sharpe, null)
assert.equal(concentrationOnly.sortino, null)
close(concentrationOnly.hhi, 1)
close(concentrationOnly.effectivePositions, 1)
assert.equal(concentrationOnly.healthScore, null)

const invalidHistory = calculatePortfolioAnalytics([
  { date: '2026-01-01', portfolio: 100, imoex: null },
  { date: '2026-01-02', portfolio: 0, imoex: null },
  { date: '2026-01-03', portfolio: Number.NaN, imoex: null },
  { date: '2026-01-04', portfolio: 110, imoex: null },
], [], 14)
assert.equal(invalidHistory.historyIntegrity, 'OK')
assert.equal(invalidHistory.historyPoints, 2)
assert.equal(invalidHistory.sampleFrom, '2026-01-01')
assert.equal(invalidHistory.sampleTo, '2026-01-04')
close(invalidHistory.twr, 0.10)
assert.equal(invalidHistory.hhi, null)
assert.equal(invalidHistory.effectivePositions, null)
assert.equal(invalidHistory.healthScore, null)

console.log('analytics core regression: ok')
