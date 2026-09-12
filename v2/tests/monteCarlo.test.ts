import assert from 'node:assert/strict'
import { calculateMonteCarlo, MONTE_CARLO_CALC_VERSION } from '../src/features/analytics/monteCarlo.ts'

const close = (actual: number, expected: number, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

function historyFromReturns(returns: number[]) {
  let value = 100
  const rows = [{ date: '2025-01-01', portfolio: value, imoex: null }]
  for (let index = 0; index < returns.length; index += 1) {
    value *= 1 + returns[index]
    const date = new Date(Date.UTC(2025, 0, 2 + index)).toISOString().slice(0, 10)
    rows.push({ date, portfolio: value, imoex: null })
  }
  return rows
}

const sampleReturns = Array.from({ length: 252 }, (_, index) => {
  if (index % 7 === 0) return -0.012
  if (index % 5 === 0) return 0.009
  return 0.002
})

const short = calculateMonteCarlo(historyFromReturns(sampleReturns.slice(0, 59)), 100_000, 20, 40, 5)
assert.equal(short.calcVersion, MONTE_CARLO_CALC_VERSION)
assert.equal(short.calcVersion, '2.0')
assert.equal(short.method, 'historical_block_bootstrap_v2')
assert.equal(short.available, false)
assert.equal(short.status, 'insufficient_history')
assert.equal(short.historyReturns, 59)
assert.equal(short.minimumReturns, 60)
assert.equal(short.terminalReturn, null)
assert.equal(short.terminalValue, null)

const previewInput = historyFromReturns(sampleReturns.slice(0, 60))
const previewA = calculateMonteCarlo(previewInput, 100_000, 20, 80, 5)
const previewB = calculateMonteCarlo(previewInput, 100_000, 20, 80, 5)
assert.equal(previewA.available, true)
assert.equal(previewA.status, 'preview')
assert.equal(previewA.historyReturns, 60)
assert.equal(previewA.excludedReturns, 0)
assert.equal(previewA.horizonTradingDays, 20)
assert.equal(previewA.simulations, 80)
assert.equal(previewA.blockTradingDays, 5)
assert.deepEqual(previewA.terminalReturn, previewB.terminalReturn)
assert.deepEqual(previewA.terminalValue, previewB.terminalValue)
assert.notEqual(previewA.terminalReturn, null)
assert.notEqual(previewA.terminalValue, null)

for (const key of ['p10', 'median', 'p90'] as const) {
  close(
    previewA.terminalValue![key],
    100_000 * (1 + previewA.terminalReturn![key]),
    1e-6,
  )
}
assert.ok(previewA.terminalReturn!.p10 <= previewA.terminalReturn!.median)
assert.ok(previewA.terminalReturn!.median <= previewA.terminalReturn!.p90)

const mature = calculateMonteCarlo(historyFromReturns(sampleReturns), 100_000, 10, 20, 5)
assert.equal(mature.available, true)
assert.equal(mature.status, 'mature')
assert.equal(mature.historyReturns, 252)
assert.equal(mature.matureReturns, 252)

const excluded = calculateMonteCarlo(
  historyFromReturns([-0.60, ...sampleReturns.slice(0, 59)]),
  100_000,
  20,
  40,
  5,
)
assert.equal(excluded.excludedReturns, 1)
assert.equal(excluded.historyReturns, 59)
assert.equal(excluded.available, false)
assert.match(excluded.note, /Исключено экстремальных наблюдений: 1/)

const clamped = calculateMonteCarlo(previewInput, 100_000, 0, 0, 100)
assert.equal(clamped.available, true)
assert.equal(clamped.horizonTradingDays, 1)
assert.equal(clamped.simulations, 1)
assert.equal(clamped.blockTradingDays, 20)

const defaults = calculateMonteCarlo(previewInput, 100_000, Number.NaN, Number.NaN, Number.NaN)
assert.equal(defaults.horizonTradingDays, 252)
assert.equal(defaults.simulations, 2000)
assert.equal(defaults.blockTradingDays, 5)

const invalidCapital = calculateMonteCarlo(previewInput, 0, 20, 40, 5)
assert.equal(invalidCapital.available, false)
assert.equal(invalidCapital.terminalReturn, null)
assert.equal(invalidCapital.terminalValue, null)

console.log('monte carlo regression: ok')
