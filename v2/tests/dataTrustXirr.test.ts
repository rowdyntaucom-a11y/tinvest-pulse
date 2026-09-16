import assert from 'node:assert/strict'
import { evaluateDataTrust, resolveMetricEligibility } from '../src/lib/dataTrust.ts'

const now = Date.parse('2026-09-16T12:00:00.000Z')
const canonical = (sourceId: 'DASHBOARD' | 'PORTFOLIO', sourceState: 'LIVE' | 'FALLBACK' = 'LIVE', coverage: 'COMPLETE' | 'PARTIAL' = 'COMPLETE') => evaluateDataTrust({
  sourceId,
  sourceType: 'BROKER',
  sourceState,
  fetchedAt: '2026-09-16T11:59:00.000Z',
  staleAfterMs: 300_000,
  coverage,
  hasData: true,
  nowMs: now,
})

for (const sourceId of ['DASHBOARD', 'PORTFOLIO'] as const) {
  const eligibility = resolveMetricEligibility(canonical(sourceId), ['LIVE_SOURCE', 'COMPLETE_COVERAGE', 'DATED_CASHFLOWS'], { datedCashflows: 0 })
  assert.equal(eligibility.allowed, true, `${sourceId} canonical server XIRR remains eligible when the live complete response already contains the deterministic aggregate`)
}

assert.equal(resolveMetricEligibility(canonical('DASHBOARD', 'FALLBACK'), ['LIVE_SOURCE', 'COMPLETE_COVERAGE', 'DATED_CASHFLOWS'], { datedCashflows: 0 }).allowed, false, 'fallback cannot promote canonical XIRR')
assert.equal(resolveMetricEligibility(canonical('PORTFOLIO', 'LIVE', 'PARTIAL'), ['LIVE_SOURCE', 'COMPLETE_COVERAGE', 'DATED_CASHFLOWS'], { datedCashflows: 0 }).allowed, false, 'partial coverage cannot promote canonical XIRR')

const unrelatedBroker = evaluateDataTrust({ sourceId: 'OTHER_BROKER_PAYLOAD', sourceType: 'BROKER', sourceState: 'LIVE', coverage: 'COMPLETE', hasData: true, nowMs: now })
assert.equal(resolveMetricEligibility(unrelatedBroker, ['DATED_CASHFLOWS'], { datedCashflows: 0 }).allowed, false, 'unrelated broker payload still requires explicit dated cashflow evidence')
assert.equal(resolveMetricEligibility(unrelatedBroker, ['DATED_CASHFLOWS'], { datedCashflows: 2 }).allowed, true, 'explicit dated cashflow evidence remains valid')

console.log('Data Trust canonical XIRR regression: ok')
