import assert from 'node:assert/strict'
import { allowsConfirmedEmptyPortfolio, evaluateAssetHistoryTrust, evaluateDataTrust, evaluateFundamentalsTrust, evaluateHistoryTrust, evaluatePayoutTrust, ownsLatestRequest, resolveMetricEligibility } from '../src/lib/dataTrust.ts'

const now = Date.parse('2026-09-15T12:00:00.000Z')
const base = { sourceId: 'broker', sourceType: 'BROKER' as const, fetchedAt: '2026-09-15T11:59:00.000Z', staleAfterMs: 300_000, coverage: 'COMPLETE' as const, hasData: true, nowMs: now }
const matrix = [
  ['LIVE + fresh + complete', { ...base, sourceState: 'LIVE' as const }, 'LIVE'],
  ['LIVE + explicit stale + no timestamp', { ...base, sourceState: 'LIVE' as const, fetchedAt: null, explicitStale: true }, 'STALE'],
  ['LIVE + explicit stale + timestamp', { ...base, sourceState: 'LIVE' as const, explicitStale: true }, 'STALE'],
  ['LIVE + old timestamp', { ...base, sourceState: 'LIVE' as const, fetchedAt: '2026-09-15T10:00:00.000Z' }, 'STALE'],
  ['LIVE + partial coverage', { ...base, sourceState: 'LIVE' as const, coverage: 'PARTIAL' as const }, 'PARTIAL'],
  ['FALLBACK + complete payload', { ...base, sourceState: 'FALLBACK' as const }, 'FALLBACK'],
  ['ERROR + cached data', { ...base, sourceState: 'ERROR' as const }, 'ERROR'],
  ['UNAVAILABLE + no data', { ...base, sourceState: 'UNAVAILABLE' as const, hasData: false }, 'UNAVAILABLE'],
] as const
for (const [name, input, expected] of matrix) assert.equal(evaluateDataTrust(input).status, expected, name)

const unknownTime = evaluateDataTrust({ ...base, sourceState: 'LIVE', fetchedAt: null })
assert.equal(unknownTime.status, 'LIVE')
assert.equal(unknownTime.freshness, 'UNKNOWN')
assert.equal(unknownTime.sourceTimestamp, null)
assert.deepEqual(unknownTime, evaluateDataTrust({ ...base, sourceState: 'LIVE', fetchedAt: null }))
assert.equal(resolveMetricEligibility(evaluateDataTrust({ ...base, sourceState: 'FALLBACK' }), ['LIVE_SOURCE']).allowed, false)
assert.equal(resolveMetricEligibility(unknownTime, ['MATURE_HISTORY'], { historyPoints: 1, minimumHistoryPoints: 2 }).allowed, false)
assert.equal(resolveMetricEligibility(unknownTime, ['DATED_CASHFLOWS'], { datedCashflows: 0 }).allowed, false)

const history = evaluateHistoryTrust([
  { date: '2026-09-15', portfolio: 1.1, imoex: null },
  { date: '2026-09-13', portfolio: 0.9, imoex: 1.8 },
  { date: '2026-09-14', portfolio: 1, imoex: 2 },
], now)
assert.equal(history.pairedPoints, 2)
assert.equal(history.benchmarkPoints, 2)
assert.equal(history.missingSegments, 1)
assert.equal(history.latestPairedDate, '2026-09-14')
assert.equal(history.trust.sourceTimestamp, '2026-09-15')
assert.equal(history.trust.status, 'PARTIAL')
assert.equal(resolveMetricEligibility(history.trust, ['PAIRED_BENCHMARK'], { pairedPoints: 1, minimumPairedPoints: 2 }).allowed, false)
assert.equal(history.benchmarkPoints, 2, 'missing benchmark points are not fabricated')

const dateOnlyTail = evaluateHistoryTrust([
  { date: '2026-09-15', portfolio: null, imoex: null },
  { date: '2026-09-10', portfolio: 1, imoex: 1 },
], now)
assert.equal(dateOnlyTail.latestObservationDate, '2026-09-10')
assert.equal(dateOnlyTail.trust.freshness, 'FRESH')
assert.equal(dateOnlyTail.trust.status, 'PARTIAL', 'a date-only tail cannot make the real series current or complete')

const dateOnly = evaluateHistoryTrust([
  { date: '2026-09-15', portfolio: null, imoex: null },
  { date: '2026-09-14' },
], now)
assert.equal(dateOnly.trust.status, 'UNAVAILABLE')
assert.equal(dateOnly.portfolioTrust.status, 'UNAVAILABLE')
assert.equal(dateOnly.latestObservationDate, null)

const portfolioOnly = evaluateHistoryTrust([{ date: '2026-09-15', portfolio: 1 }], now)
assert.equal(portfolioOnly.portfolioPoints, 1)
assert.equal(portfolioOnly.portfolioTrust.safeToDisplay, true)
assert.equal(portfolioOnly.pairedPoints, 0)
assert.notEqual(portfolioOnly.trust.coverage, 'COMPLETE')

const benchmarkOnly = evaluateHistoryTrust([{ date: '2026-09-15', imoex: 1 }], now)
assert.equal(benchmarkOnly.benchmarkPoints, 1)
assert.equal(benchmarkOnly.portfolioPoints, 0)
assert.equal(benchmarkOnly.portfolioTrust.status, 'UNAVAILABLE')

const nonFinite = evaluateHistoryTrust([
  { date: '2026-09-15', portfolio: Number.NaN, imoex: Number.POSITIVE_INFINITY },
  { date: '2026-09-14', portfolio: 1, imoex: Number.NEGATIVE_INFINITY },
  { date: '2026-09-13', portfolio: 2, imoex: 3 },
], now)
assert.equal(nonFinite.portfolioPoints, 2)
assert.equal(nonFinite.benchmarkPoints, 1)
assert.equal(nonFinite.pairedPoints, 1, 'a pair requires two finite numeric observations')
assert.equal(nonFinite.latestObservationDate, '2026-09-14')
const reversed = evaluateHistoryTrust([
  { date: '2026-09-13', portfolio: 2, imoex: 3 },
  { date: '2026-09-14', portfolio: 1, imoex: null },
  { date: '2026-09-15', portfolio: null, imoex: null },
], now)
assert.equal(reversed.latestObservationDate, nonFinite.latestObservationDate, 'input ordering cannot change latest real observation')

for (const generatedAt of [null, '2026-09-15T11:59:00.000Z']) {
  assert.equal(evaluatePayoutTrust({ available: true, stale: true, generatedAt, eligibleAssets: 4, resolvedAssets: 4, scheduleComplete: true }, now).status, 'STALE')
}
const payoutPartial = evaluatePayoutTrust({ available: true, stale: false, generatedAt: null, eligibleAssets: 4, resolvedAssets: 3, scheduleComplete: false }, now)
assert.equal(payoutPartial.status, 'PARTIAL')
assert.equal(payoutPartial.safeToCalculate, false)
assert.equal(evaluatePayoutTrust({ loading: true, available: false, stale: false, generatedAt: null, eligibleAssets: 0, resolvedAssets: 0, scheduleComplete: false }, now).status, 'LOADING')
assert.equal(evaluatePayoutTrust({ available: false, stale: false, generatedAt: null, eligibleAssets: 0, resolvedAssets: 0, scheduleComplete: false }, now).status, 'UNAVAILABLE')

assert.equal(evaluateAssetHistoryTrust({ available: true, source: 'GetCandles', latestPointAt: '2026-09-14', requested: 2, availableSeries: 1, points: 10 }, now).status, 'PARTIAL')
assert.equal(evaluateAssetHistoryTrust({ available: true, source: 'GetCandles', latestPointAt: '2026-08-01', requested: 1, availableSeries: 1, points: 10 }, now).status, 'STALE')
assert.equal(evaluateFundamentalsTrust({ available: false, source: 'UNAVAILABLE', updatedAt: null, reason: 'API_ERROR' }, now).status, 'ERROR')

const live = evaluateDataTrust({ ...base, sourceState: 'LIVE' })
assert.equal(allowsConfirmedEmptyPortfolio(live, 0), true)
assert.equal(allowsConfirmedEmptyPortfolio(evaluateDataTrust({ ...base, sourceState: 'LIVE', explicitStale: true }), 0), false)
assert.equal(allowsConfirmedEmptyPortfolio(evaluateDataTrust({ ...base, sourceState: 'FALLBACK' }), 0), false)
assert.equal(ownsLatestRequest(2, 2), true)
assert.equal(ownsLatestRequest(1, 2), false, 'older request failure cannot overwrite newer success')
assert.equal(ownsLatestRequest(2, 2, false), false)

let raceState = 'initial'
let currentSequence = 2
if (ownsLatestRequest(2, currentSequence)) raceState = 'B success'
if (ownsLatestRequest(1, currentSequence)) raceState = 'A late error'
assert.equal(raceState, 'B success', 'older error cannot overwrite newer success')
raceState = 'initial'
if (ownsLatestRequest(2, currentSequence)) raceState = 'B error'
if (ownsLatestRequest(1, currentSequence)) raceState = 'A late success'
assert.equal(raceState, 'B error', 'older success cannot overwrite newer error')
console.log('data trust regression: ok')
