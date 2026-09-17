import assert from 'node:assert/strict'
import { resolveWorldQualityInputs } from '../src/features/dna/worldQualityPolicy.ts'

const unavailable = resolveWorldQualityInputs(
  { twr: 0.25, healthScore: 91 },
  { twr: false, health: false },
)
assert.equal(unavailable.twr, null)
assert.equal(unavailable.healthScore, null)
assert.equal(unavailable.contributionStreakMonths, null)
assert.equal(unavailable.passiveIncomeGrowth, null)

const trusted = resolveWorldQualityInputs(
  { twr: 0.25, healthScore: 91 },
  { twr: true, health: true },
)
assert.equal(trusted.twr, 0.25)
assert.equal(trusted.healthScore, 91)

const mixed = resolveWorldQualityInputs(
  { twr: 0.25, healthScore: 91 },
  { twr: false, health: true },
)
assert.equal(mixed.twr, null)
assert.equal(mixed.healthScore, 91)

console.log('world quality trust policy regression passed')
