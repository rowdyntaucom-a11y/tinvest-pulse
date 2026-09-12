import assert from 'node:assert/strict'
import { calculateRelativePerformance, RELATIVE_PERFORMANCE_CALC_VERSION } from '../src/features/analytics/relativePerformance.ts'
import { calculateRollingRisk } from '../src/features/analytics/rollingRisk.ts'
import { calculateRecoveryDiagnostics, RECOVERY_DIAGNOSTICS_CALC_VERSION } from '../src/features/analytics/recoveryDiagnostics.ts'

const close = (actual: number | null, expected: number, tolerance = 1e-10) => {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

function dateAt(index: number) {
  return new Date(Date.UTC(2025, 0, 1 + index)).toISOString().slice(0, 10)
}

function dualHistory(returns: number[]) {
  let portfolio = 100
  let imoex = 100
  const rows = [{ date: dateAt(0), portfolio, imoex }]
  for (let index = 0; index < returns.length; index += 1) {
    portfolio *= 1 + returns[index]
    imoex *= 1 + returns[index]
    rows.push({ date: dateAt(index + 1), portfolio, imoex })
  }
  return rows
}

const varyingReturns = Array.from({ length: 252 }, (_, index) => index % 2 === 0 ? 0.01 : -0.005)

const relative59 = calculateRelativePerformance(dualHistory(varyingReturns.slice(0, 59)))
assert.equal(relative59.calcVersion, RELATIVE_PERFORMANCE_CALC_VERSION)
assert.equal(relative59.status, 'insufficient_history')
assert.equal(relative59.pairedReturns, 59)
assert.equal(relative59.trackingError, null)
assert.equal(relative59.beta, null)

const perfectTracker = calculateRelativePerformance(dualHistory(varyingReturns.slice(0, 60)))
assert.equal(perfectTracker.calcVersion, '1.1')
assert.equal(perfectTracker.available, true)
assert.equal(perfectTracker.status, 'preview')
assert.equal(perfectTracker.pairedReturns, 60)
close(perfectTracker.trackingError, 0)
assert.equal(perfectTracker.informationRatio, null)
close(perfectTracker.beta, 1)
close(perfectTracker.correlation, 1)
close(perfectTracker.excessReturn, 0)

const relativeMature = calculateRelativePerformance(dualHistory(varyingReturns))
assert.equal(relativeMature.status, 'mature')
assert.equal(relativeMature.pairedReturns, 252)
assert.equal(relativeMature.matureReturns, 252)
close(relativeMature.trackingError, 0)

const rolling19 = calculateRollingRisk(dualHistory(varyingReturns.slice(0, 19)))
assert.equal(rolling19.version, '1.0')
assert.equal(rolling19.availableReturns, 19)
assert.equal(rolling19.activeWindow, null)

const rolling20 = calculateRollingRisk(dualHistory(varyingReturns.slice(0, 20)))
assert.equal(rolling20.availableReturns, 20)
assert.equal(rolling20.activeWindow?.tradingDays, 20)
assert.equal(rolling20.activeWindow?.pairedBenchmarkReturns, 20)
assert.notEqual(rolling20.activeWindow?.benchmarkReturn, null)
close(rolling20.activeWindow?.excessReturn ?? null, 0)

const rolling60 = calculateRollingRisk(dualHistory(varyingReturns.slice(0, 60)))
assert.equal(rolling60.activeWindow?.tradingDays, 60)
assert.equal(rolling60.activeWindow?.pairedBenchmarkReturns, 60)

const rollingMissingBenchmarkHistory = dualHistory(varyingReturns.slice(0, 20))
rollingMissingBenchmarkHistory[10].imoex = null as unknown as number
const rollingMissingBenchmark = calculateRollingRisk(rollingMissingBenchmarkHistory)
assert.equal(rollingMissingBenchmark.activeWindow?.tradingDays, 20)
assert.equal(rollingMissingBenchmark.activeWindow?.benchmarkReturn, null)
assert.equal(rollingMissingBenchmark.activeWindow?.excessReturn, null)
assert.equal(rollingMissingBenchmark.activeWindow?.pairedBenchmarkReturns, 0)

const recovery59 = calculateRecoveryDiagnostics(dualHistory(varyingReturns.slice(0, 59)))
assert.equal(recovery59.calcVersion, RECOVERY_DIAGNOSTICS_CALC_VERSION)
assert.equal(recovery59.available, false)
assert.equal(recovery59.quality, 'SHORT')
assert.equal(recovery59.returnObservations, 59)

const recoveryValues = [100, 90, 100, ...Array.from({ length: 57 }, () => 100), 95]
const recoveryHistory = recoveryValues.map((portfolio, index) => ({ date: dateAt(index), portfolio, imoex: null }))
const recovery = calculateRecoveryDiagnostics(recoveryHistory)
assert.equal(recovery.calcVersion, '1.0')
assert.equal(recovery.available, true)
assert.equal(recovery.quality, 'DEVELOPING')
assert.equal(recovery.returnObservations, 60)
assert.equal(recovery.completedEpisodes.length, 1)
close(recovery.completedEpisodes[0].depth, 0.10)
assert.equal(recovery.completedEpisodes[0].peakToTroughDays, 1)
assert.equal(recovery.completedEpisodes[0].troughToRecoveryDays, 1)
assert.equal(recovery.medianRecoveryDays, 1)
assert.notEqual(recovery.activeDrawdown, null)
close(recovery.activeDrawdown?.depth ?? null, 0.05)
close(recovery.activeDrawdown?.currentDrawdown ?? null, 0.05)
assert.equal(recovery.activeDrawdown?.daysSincePeak, 1)

const recoveryMature = calculateRecoveryDiagnostics(dualHistory(Array.from({ length: 252 }, () => 0)))
assert.equal(recoveryMature.available, true)
assert.equal(recoveryMature.quality, 'MATURE')
assert.equal(recoveryMature.returnObservations, 252)

console.log('risk core regression: ok')
