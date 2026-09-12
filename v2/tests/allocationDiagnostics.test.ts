import assert from 'node:assert/strict'
import {
  ALLOCATION_DIAGNOSTICS_CALC_VERSION,
  calculateAllocationDiagnostics,
  type AllocationScenario,
} from '../src/features/analytics/allocationDiagnostics.ts'
import type { RiskSeries } from '../src/features/analytics/riskMatrix.ts'

const DAY_MS = 86_400_000

function makeSeries(key: string, returns: number[], label = key): RiskSeries {
  let value = 100
  const points = [{ date: '2025-01-01', value }]
  const start = Date.parse('2025-01-01T00:00:00Z')
  for (let index = 0; index < returns.length; index += 1) {
    value *= 1 + returns[index]
    points.push({
      date: new Date(start + (index + 1) * DAY_MS).toISOString().slice(0, 10),
      value,
    })
  }
  return { key, label, points }
}

function pattern(length: number, values: number[]) {
  return Array.from({ length }, (_, index) => values[index % values.length])
}

function close(actual: number | null, expected: number, tolerance = 1e-9) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

function assertLongOnly(scenario: AllocationScenario) {
  assert.equal(scenario.available, true)
  const total = scenario.weights.reduce((sum, row) => sum + row.weight, 0)
  close(total, 1, 1e-8)
  assert.equal(scenario.weights.every(row => Number.isFinite(row.weight) && row.weight >= -1e-12), true)
}

const a59 = makeSeries('A', pattern(59, [0.012, -0.009, 0.006, -0.004, 0.011, -0.007, 0.002, -0.003]))
const b59 = makeSeries('B', pattern(59, [-0.003, 0.005, -0.001, 0.004, -0.002, 0.003, -0.004, 0.006]))
const short = calculateAllocationDiagnostics([a59, b59])
assert.equal(short.version, ALLOCATION_DIAGNOSTICS_CALC_VERSION)
assert.equal(short.version, '1.2')
assert.equal(short.available, false)
assert.equal(short.status, 'INSUFFICIENT_HISTORY')
assert.equal(short.commonReturns, 59)
assert.equal(short.minimumReturns, 60)

const a60 = makeSeries('A', pattern(60, [0.012, -0.009, 0.006, -0.004, 0.011, -0.007, 0.002, -0.003]))
const b60 = makeSeries('B', pattern(60, [-0.003, 0.005, -0.001, 0.004, -0.002, 0.003, -0.004, 0.006]))
const preview = calculateAllocationDiagnostics([a60, b60])
assert.equal(preview.available, true)
assert.equal(preview.status, 'PREVIEW')
assert.equal(preview.commonReturns, 60)
assert.equal(preview.assetCount, 2)
assert.notEqual(preview.equalWeight, null)
assertLongOnly(preview.equalWeight!)
close(preview.equalWeight!.weights[0].weight, 0.5)
close(preview.equalWeight!.weights[1].weight, 0.5)
assert.ok((preview.equalWeight!.annualizedVolatility ?? 0) > 0)

assert.notEqual(preview.minimumVariance, null)
assert.equal(preview.minimumVariance!.converged, true)
assertLongOnly(preview.minimumVariance!)
assert.ok(
  (preview.minimumVariance!.annualizedVolatility ?? Infinity)
    <= (preview.equalWeight!.annualizedVolatility ?? -Infinity) + 1e-8,
)

assert.notEqual(preview.equalRiskContribution, null)
assert.equal(preview.equalRiskContribution!.converged, true)
assertLongOnly(preview.equalRiskContribution!)
const ercContributions = preview.equalRiskContribution!.weights.map(row => row.riskContribution)
assert.equal(ercContributions.every(value => value != null), true)
for (const contribution of ercContributions) close(contribution, 0.5, 2e-6)

// 61 nominal returns with one missing intermediate candle leave 59 exact
// common return intervals. Ending-date-only alignment would incorrectly count
// the wider return after the gap and cross the 60-return availability gate.
const gapA = makeSeries('GAP_A', pattern(61, [0.012, -0.009, 0.006, -0.004, 0.011, -0.007, 0.002, -0.003]))
const gapBBase = makeSeries('GAP_B', pattern(61, [-0.003, 0.005, -0.001, 0.004, -0.002, 0.003, -0.004, 0.006]))
const gapB = { ...gapBBase, points: gapBBase.points.filter((_, index) => index !== 20) }
const gapGuard = calculateAllocationDiagnostics([gapA, gapB])
assert.equal(gapGuard.commonReturns, 59)
assert.equal(gapGuard.available, false)
assert.equal(gapGuard.status, 'INSUFFICIENT_HISTORY')
assert.match(gapGuard.note, /одинаковым интервалам наблюдения/)

const mature = calculateAllocationDiagnostics([
  makeSeries('A', pattern(252, [0.012, -0.009, 0.006, -0.004, 0.011, -0.007, 0.002, -0.003])),
  makeSeries('B', pattern(252, [-0.003, 0.005, -0.001, 0.004, -0.002, 0.003, -0.004, 0.006])),
])
assert.equal(mature.available, true)
assert.equal(mature.status, 'MATURE')
assert.equal(mature.commonReturns, 252)
assert.equal(mature.matureReturns, 252)

const flat = calculateAllocationDiagnostics([
  makeSeries('FLAT_A', new Array(60).fill(0)),
  makeSeries('FLAT_B', new Array(60).fill(0)),
])
assert.equal(flat.available, true)
assert.equal(flat.status, 'PREVIEW')
assert.notEqual(flat.equalWeight, null)
assert.equal(flat.equalWeight!.available, true)
close(flat.equalWeight!.annualizedVolatility, 0)
assert.equal(flat.equalWeight!.weights.every(row => row.annualizedVolatility === 0), true)
assert.equal(flat.minimumVariance?.available, false)
assert.equal(flat.minimumVariance?.converged, false)
assert.equal(flat.equalRiskContribution?.available, false)
assert.equal(flat.equalRiskContribution?.converged, false)

const duplicate = calculateAllocationDiagnostics([
  makeSeries('DUP', pattern(60, [0.01, -0.005])),
  makeSeries('DUP', pattern(60, [-0.004, 0.006])),
])
assert.equal(duplicate.available, false)
assert.equal(duplicate.commonReturns, 0)
assert.equal(duplicate.assetCount, 2)

const eleven = Array.from({ length: 11 }, (_, index) => makeSeries(
  `S${index + 1}`,
  pattern(60, [0.002 + index * 0.00005, -0.001 - index * 0.00002, 0.0015, -0.0008]),
))
const capped = calculateAllocationDiagnostics(eleven)
assert.equal(capped.assetCount, 10)
assert.equal(capped.commonReturns, 60)
assert.equal(capped.available, true)
assert.equal(capped.equalWeight?.weights.length, 10)
assertLongOnly(capped.equalWeight!)

console.log('allocation diagnostics regression: ok')
