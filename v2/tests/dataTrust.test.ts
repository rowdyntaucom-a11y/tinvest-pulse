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
console.log('data trust regression: ok')
