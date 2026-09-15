import assert from 'node:assert/strict'
import { evaluateAssetHistoryTrust, evaluateDataTrust, evaluateFundamentalsTrust, evaluateHistoryTrust, evaluatePayoutTrust, resolveMetricEligibility } from '../src/lib/dataTrust.ts'

const now = Date.parse('2026-09-15T12:00:00.000Z')
const base = { sourceId: 'broker', sourceType: 'BROKER' as const, fetchedAt: '2026-09-15T11:59:00.000Z', staleAfterMs: 300_000, coverage: 'COMPLETE' as const, hasData: true, nowMs: now }
const matrix = [
  [{ ...base, sourceState: 'LIVE' as const }, 'LIVE'],
  [{ ...base, sourceState: 'LIVE' as const, fetchedAt: '2026-09-15T10:00:00.000Z' }, 'STALE'],
  [{ ...base, sourceState: 'FALLBACK' as const }, 'FALLBACK'],
  [{ ...base, sourceState: 'LIVE' as const, coverage: 'PARTIAL' as const }, 'PARTIAL'],
  [{ ...base, sourceState: 'ERROR' as const }, 'ERROR'],
  [{ ...base, sourceState: 'UNAVAILABLE' as const, hasData: false }, 'UNAVAILABLE'],
] as const
for (const [input, expected] of matrix) assert.equal(evaluateDataTrust(input).status, expected)
const deterministic = evaluateDataTrust({ ...base, sourceState: 'LIVE' })
assert.deepEqual(deterministic, evaluateDataTrust({ ...base, sourceState: 'LIVE' }))
assert.equal(deterministic.sourceTimestamp, null)
const fallback = evaluateDataTrust({ ...base, sourceState: 'FALLBACK' })
assert.equal(fallback.safeToCalculate, false)
assert.equal(resolveMetricEligibility(fallback, ['LIVE_SOURCE']).allowed, false)
assert.equal(resolveMetricEligibility(deterministic, ['MATURE_HISTORY'], { historyPoints: 1, minimumHistoryPoints: 2 }).allowed, false)
assert.equal(resolveMetricEligibility(deterministic, ['DATED_CASHFLOWS'], { datedCashflows: 0 }).allowed, false)

const history = evaluateHistoryTrust([{ date: '2026-09-14', portfolio: 1, imoex: 2 }, { date: '2026-09-15', portfolio: 1.1, imoex: null }], now)
assert.equal(history.pairedPoints, 1)
assert.equal(history.missingSegments, 1)
assert.equal(history.latestPairedDate, '2026-09-14')
assert.equal(history.trust.status, 'PARTIAL')
assert.equal(resolveMetricEligibility(history.trust, ['PAIRED_BENCHMARK'], { pairedPoints: history.pairedPoints, minimumPairedPoints: 2 }).allowed, false)

const payout = evaluatePayoutTrust({ available: true, stale: false, generatedAt: null, eligibleAssets: 4, resolvedAssets: 3, errors: 0 }, now)
assert.equal(payout.status, 'PARTIAL')
assert.equal(payout.safeToCalculate, false)
assert.equal(evaluatePayoutTrust({ available: false, stale: false, generatedAt: null, eligibleAssets: 0, resolvedAssets: 0, errors: 0 }, now).status, 'UNAVAILABLE')
assert.equal(evaluateAssetHistoryTrust({ available: true, source: 'GetCandles', to: '2026-09-15', requested: 2, availableSeries: 1, points: 10 }, now).status, 'PARTIAL')
assert.equal(evaluateFundamentalsTrust({ available: false, source: 'UNAVAILABLE', updatedAt: null, reason: 'API_ERROR' }, now).status, 'ERROR')
console.log('data trust regression: ok')
