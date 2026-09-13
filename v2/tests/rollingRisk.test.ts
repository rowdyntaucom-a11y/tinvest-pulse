import assert from 'node:assert/strict'
import { calculateRollingRisk } from '../src/features/analytics/rollingRisk.ts'
import type { AnalyticsHistoryPoint } from '../src/features/analytics/metrics.ts'

function makeHistory(count: number): AnalyticsHistoryPoint[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10)
    return {
      date,
      portfolio: 100 + index,
      imoex: 200 + index * 0.5,
    }
  })
}

const full = calculateRollingRisk(makeHistory(21))
assert.equal(full.version, '1.1')
assert.equal(full.integrityState, 'OK')
assert.equal(full.availableReturns, 20)
assert.equal(full.sampleFrom, '2026-01-01')
assert.equal(full.sampleTo, '2026-01-21')
assert.equal(full.duplicateRowsCollapsed, 0)
assert.equal(full.portfolioConflictingDates, 0)
assert.equal(full.benchmarkConflictingDates, 0)
assert.equal(full.windows[0].available, true)
assert.equal(full.windows[0].pairedBenchmarkReturns, 20)
assert.notEqual(full.windows[0].benchmarkReturn, null)
assert.notEqual(full.windows[0].excessReturn, null)

const missingBenchmarkHistory = makeHistory(21)
missingBenchmarkHistory[10] = { ...missingBenchmarkHistory[10], imoex: null }
const missingBenchmark = calculateRollingRisk(missingBenchmarkHistory)
assert.equal(missingBenchmark.integrityState, 'OK')
assert.equal(missingBenchmark.windows[0].available, true)
assert.equal(missingBenchmark.windows[0].pairedBenchmarkReturns, 18)
assert.equal(missingBenchmark.windows[0].benchmarkReturn, null)
assert.equal(missingBenchmark.windows[0].excessReturn, null)
assert.notEqual(missingBenchmark.windows[0].portfolioReturn, null)

const exactDuplicateHistory = makeHistory(21)
exactDuplicateHistory.splice(6, 0, { ...exactDuplicateHistory[5] })
const exactDuplicate = calculateRollingRisk(exactDuplicateHistory)
assert.equal(exactDuplicate.integrityState, 'OK')
assert.equal(exactDuplicate.duplicateRowsCollapsed, 1)
assert.equal(exactDuplicate.availableReturns, 20)
assert.equal(exactDuplicate.windows[0].pairedBenchmarkReturns, 20)
assert.equal(exactDuplicate.windows[0].portfolioReturn, full.windows[0].portfolioReturn)
assert.equal(exactDuplicate.windows[0].benchmarkReturn, full.windows[0].benchmarkReturn)

const portfolioConflictHistory = makeHistory(21)
portfolioConflictHistory.push({
  ...portfolioConflictHistory[5],
  portfolio: (portfolioConflictHistory[5].portfolio ?? 0) + 1,
})
const portfolioConflict = calculateRollingRisk(portfolioConflictHistory)
assert.equal(portfolioConflict.integrityState, 'PORTFOLIO_CONFLICT')
assert.equal(portfolioConflict.portfolioConflictingDates, 1)
assert.equal(portfolioConflict.availableReturns, 0)
assert.equal(portfolioConflict.sampleFrom, null)
assert.equal(portfolioConflict.sampleTo, null)
assert.equal(portfolioConflict.activeWindow, null)
assert.ok(portfolioConflict.windows.every(window => window.available === false))

const benchmarkConflictHistory = makeHistory(21)
benchmarkConflictHistory.push({
  ...benchmarkConflictHistory[5],
  imoex: (benchmarkConflictHistory[5].imoex ?? 0) + 1,
})
const benchmarkConflict = calculateRollingRisk(benchmarkConflictHistory)
assert.equal(benchmarkConflict.integrityState, 'BENCHMARK_CONFLICT')
assert.equal(benchmarkConflict.portfolioConflictingDates, 0)
assert.equal(benchmarkConflict.benchmarkConflictingDates, 1)
assert.equal(benchmarkConflict.availableReturns, 20)
assert.equal(benchmarkConflict.windows[0].available, true)
assert.equal(benchmarkConflict.windows[0].pairedBenchmarkReturns, 18)
assert.equal(benchmarkConflict.windows[0].benchmarkReturn, null)
assert.equal(benchmarkConflict.windows[0].excessReturn, null)
assert.notEqual(benchmarkConflict.windows[0].portfolioReturn, null)

const bothConflictHistory = makeHistory(21)
bothConflictHistory.push({
  ...bothConflictHistory[4],
  portfolio: (bothConflictHistory[4].portfolio ?? 0) + 1,
  imoex: (bothConflictHistory[4].imoex ?? 0) + 1,
})
const bothConflict = calculateRollingRisk(bothConflictHistory)
assert.equal(bothConflict.integrityState, 'BOTH_CONFLICT')
assert.equal(bothConflict.portfolioConflictingDates, 1)
assert.equal(bothConflict.benchmarkConflictingDates, 1)
assert.equal(bothConflict.activeWindow, null)

console.log('rollingRisk tests passed')
