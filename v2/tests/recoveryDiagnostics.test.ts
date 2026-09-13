import assert from 'node:assert/strict'
import {
  calculateRecoveryDiagnostics,
  RECOVERY_DIAGNOSTICS_CALC_VERSION,
} from '../src/features/analytics/recoveryDiagnostics.ts'
import type { AnalyticsHistoryPoint } from '../src/features/analytics/metrics.ts'

const DAY_MS = 86_400_000

function day(offset: number) {
  return new Date(Date.UTC(2025, 0, 1) + offset * DAY_MS).toISOString().slice(0, 10)
}

function point(offset: number, portfolio: number): AnalyticsHistoryPoint {
  return { date: day(offset), portfolio, imoex: null }
}

function flatHistory(points: number, value = 100) {
  return Array.from({ length: points }, (_, index) => point(index, value))
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const short = calculateRecoveryDiagnostics(flatHistory(60))
assert.equal(short.calcVersion, RECOVERY_DIAGNOSTICS_CALC_VERSION)
assert.equal(short.calcVersion, '1.2')
assert.equal(short.available, false)
assert.equal(short.quality, 'SHORT')
assert.equal(short.integrity, 'OK')
assert.equal(short.returnObservations, 59)
assert.equal(short.historyPoints, 60)
assert.equal(short.duplicateRowsCollapsed, 0)
assert.equal(short.conflictingDates, 0)
assert.equal(short.sampleFrom, day(0))
assert.equal(short.sampleTo, day(59))
assert.deepEqual(short.completedEpisodes, [])
assert.equal(short.activeDrawdown, null)

const gate = calculateRecoveryDiagnostics(flatHistory(61))
assert.equal(gate.available, true)
assert.equal(gate.quality, 'DEVELOPING')
assert.equal(gate.returnObservations, 60)

const mature = calculateRecoveryDiagnostics(flatHistory(253))
assert.equal(mature.available, true)
assert.equal(mature.quality, 'MATURE')
assert.equal(mature.returnObservations, 252)

const episodeHistory = flatHistory(61)
episodeHistory[0] = point(0, 100)
episodeHistory[1] = point(1, 90)
episodeHistory[2] = point(2, 80)
episodeHistory[3] = point(3, 95)
episodeHistory[4] = point(4, 100)
for (let index = 5; index < episodeHistory.length; index += 1) episodeHistory[index] = point(index, 100 + index * 0.01)

const completed = calculateRecoveryDiagnostics(episodeHistory)
assert.equal(completed.available, true)
assert.equal(completed.completedEpisodes.length, 1)
assert.equal(completed.activeDrawdown, null)
const episode = completed.completedEpisodes[0]
assert.equal(episode.peakDate, day(0))
assert.equal(episode.troughDate, day(2))
assert.equal(episode.recoveryDate, day(4))
close(episode.depth, 0.2)
assert.equal(episode.peakToTroughDays, 2)
assert.equal(episode.troughToRecoveryDays, 2)
assert.equal(episode.totalDays, 4)
assert.equal(completed.worstCompletedEpisode?.troughDate, day(2))
assert.equal(completed.medianRecoveryDays, 2)

const activeHistory = flatHistory(61)
for (let index = 0; index < 58; index += 1) activeHistory[index] = point(index, 100 + index * 0.1)
activeHistory[58] = point(58, 105.7)
activeHistory[59] = point(59, 90)
activeHistory[60] = point(60, 95)

const active = calculateRecoveryDiagnostics(activeHistory)
assert.equal(active.available, true)
assert.equal(active.completedEpisodes.length, 0)
assert.notEqual(active.activeDrawdown, null)
assert.equal(active.activeDrawdown?.peakDate, day(58))
assert.equal(active.activeDrawdown?.troughDate, day(59))
assert.equal(active.activeDrawdown?.asOfDate, day(60))
close(active.activeDrawdown?.depth ?? null, 1 - 90 / 105.7)
close(active.activeDrawdown?.currentDrawdown ?? null, 1 - 95 / 105.7)
assert.equal(active.activeDrawdown?.daysSincePeak, 2)
assert.equal(active.activeDrawdown?.daysSinceTrough, 1)
assert.equal(active.worstCompletedEpisode, null)
assert.equal(active.medianRecoveryDays, null)

const dirty = flatHistory(61)
dirty.push({ date: '2026-02-30', portfolio: 200, imoex: null })
dirty.push({ date: 'bad', portfolio: 200, imoex: null })
dirty.push({ date: day(70), portfolio: Number.NaN, imoex: null })
const cleaned = calculateRecoveryDiagnostics(dirty)
assert.equal(cleaned.available, true)
assert.equal(cleaned.integrity, 'OK')
assert.equal(cleaned.historyPoints, 61)
assert.equal(cleaned.returnObservations, 60)

const identicalDuplicate = flatHistory(61)
identicalDuplicate.push({ date: `${day(10)}T18:30:00.000Z`, portfolio: 100, imoex: null })
const deduped = calculateRecoveryDiagnostics(identicalDuplicate)
assert.equal(deduped.available, true)
assert.equal(deduped.integrity, 'OK')
assert.equal(deduped.historyPoints, 61)
assert.equal(deduped.returnObservations, 60)
assert.equal(deduped.duplicateRowsCollapsed, 1)
assert.equal(deduped.conflictingDates, 0)
assert.equal(deduped.sampleFrom, day(0))
assert.equal(deduped.sampleTo, day(60))

const conflictingDuplicate = flatHistory(61)
conflictingDuplicate.push({ date: `${day(10)}T18:30:00.000Z`, portfolio: 101, imoex: null })
const conflicted = calculateRecoveryDiagnostics(conflictingDuplicate)
assert.equal(conflicted.available, false)
assert.equal(conflicted.integrity, 'CONFLICT')
assert.equal(conflicted.historyPoints, 61)
assert.equal(conflicted.returnObservations, 60)
assert.equal(conflicted.duplicateRowsCollapsed, 1)
assert.equal(conflicted.conflictingDates, 1)
assert.deepEqual(conflicted.completedEpisodes, [])
assert.equal(conflicted.activeDrawdown, null)
assert.equal(conflicted.worstCompletedEpisode, null)
assert.equal(conflicted.medianRecoveryDays, null)
assert.match(conflicted.reason ?? '', /конфликт/i)

console.log('recovery diagnostics regression: ok')
