import assert from 'node:assert/strict'
import { calculateGoalProjection } from '../src/features/goals/goalProjection.ts'

function approx(actual: number | null, expected: number, tolerance = 1e-6) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `${actual} != ${expected}`)
}

{
  const result = calculateGoalProjection({
    currentCapital: 100_000,
    targetCapitalToday: 220_000,
    horizonYears: 1,
    monthlyContribution: 10_000,
    contributionGrowthAnnualPct: 0,
    inflationAnnualPct: 0,
    priceReturnAnnualPct: 0,
    incomeYieldAnnualPct: 0,
    reinvestIncome: true,
    benchmarkReturnAnnualPct: null,
  })
  assert.equal(result.available, true)
  approx(result.finalCapital, 220_000)
  approx(result.finalTargetNominal, 220_000)
  approx(result.cumulativeContributions, 120_000)
  assert.equal(result.scenarioGoalReachedMonth, 12)
  assert.equal(result.series.length, 1)
}

{
  const base = {
    currentCapital: 100_000,
    targetCapitalToday: 1_000_000,
    horizonYears: 1,
    monthlyContribution: 0,
    contributionGrowthAnnualPct: 0,
    inflationAnnualPct: 0,
    priceReturnAnnualPct: 0,
    incomeYieldAnnualPct: 12,
    benchmarkReturnAnnualPct: null,
  }
  const reinvest = calculateGoalProjection({ ...base, reinvestIncome: true })
  const payout = calculateGoalProjection({ ...base, reinvestIncome: false })
  assert.equal(reinvest.available, true)
  assert.equal(payout.available, true)
  assert.ok((reinvest.finalCapital ?? 0) > (payout.finalCapital ?? 0))
  assert.equal(reinvest.cumulativeIncomePaidOut, 0)
  assert.ok((payout.cumulativeIncomePaidOut ?? 0) > 0)
}

{
  const result = calculateGoalProjection({
    currentCapital: 1_000_000,
    targetCapitalToday: 1_000_000,
    horizonYears: 10,
    monthlyContribution: 0,
    contributionGrowthAnnualPct: 0,
    inflationAnnualPct: 5,
    priceReturnAnnualPct: 5,
    incomeYieldAnnualPct: 0,
    reinvestIncome: true,
    benchmarkReturnAnnualPct: 7,
  })
  assert.equal(result.available, true)
  assert.ok((result.finalTargetNominal ?? 0) > 1_000_000)
  approx(result.finalRealCapital, 1_000_000, 0.1)
  assert.ok((result.finalBenchmarkCapital ?? 0) > (result.finalCapital ?? 0))
  assert.equal(result.series.length, 10)
}

{
  const invalid = calculateGoalProjection({
    currentCapital: 100_000,
    targetCapitalToday: 0,
    horizonYears: 10,
    monthlyContribution: 1_000,
    contributionGrowthAnnualPct: 0,
    inflationAnnualPct: 5,
    priceReturnAnnualPct: 7,
    incomeYieldAnnualPct: 4,
    reinvestIncome: true,
    benchmarkReturnAnnualPct: 8,
  })
  assert.equal(invalid.available, false)
  assert.equal(invalid.series.length, 0)
  assert.equal(invalid.finalCapital, null)
}

console.log('goalProjection.test.ts: ok')
