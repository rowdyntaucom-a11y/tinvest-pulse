import assert from 'node:assert/strict'
import {
  ACCESS_POLICY_VERSION,
  BASE_POSITION_LIMIT,
  canUseCapability,
  evaluatePositionLimit,
  gateFullPortfolioMetric,
  getAccessPolicy,
} from '../src/lib/accessPolicy.ts'

assert.equal(ACCESS_POLICY_VERSION, '1.0')
assert.equal(BASE_POSITION_LIMIT, 10)

const base = getAccessPolicy('BASE')
assert.equal(base.plan, 'BASE')
assert.equal(base.positionLimit, 10)
assert.equal(base.capabilities.has('portfolio.current'), true)
assert.equal(base.capabilities.has('analytics.basicReturn'), true)
assert.equal(base.capabilities.has('income.fact'), true)
assert.equal(base.capabilities.has('analytics.advancedRisk'), false)
assert.equal(base.capabilities.has('income.taxTools'), false)
assert.equal(base.capabilities.has('terminal.indicators'), false)

const pro = getAccessPolicy('PRO')
assert.equal(pro.plan, 'PRO')
assert.equal(pro.positionLimit, null)
assert.equal(canUseCapability('PRO', 'analytics.advancedRisk'), true)
assert.equal(canUseCapability('PRO', 'income.taxTools'), true)
assert.equal(canUseCapability('PRO', 'terminal.screeners'), true)

const baseSmall = evaluatePositionLimit('BASE', 7)
assert.deepEqual(baseSmall, {
  plan: 'BASE', totalPositions: 7, includedPositions: 7, excludedPositions: 0, limit: 10, fullCoverage: true,
})

const baseLarge = evaluatePositionLimit('BASE', 16)
assert.deepEqual(baseLarge, {
  plan: 'BASE', totalPositions: 16, includedPositions: 10, excludedPositions: 6, limit: 10, fullCoverage: false,
})

const proLarge = evaluatePositionLimit('PRO', 250)
assert.deepEqual(proLarge, {
  plan: 'PRO', totalPositions: 250, includedPositions: 250, excludedPositions: 0, limit: null, fullCoverage: true,
})

assert.deepEqual(evaluatePositionLimit('BASE', Number.NaN), {
  plan: 'BASE', totalPositions: 0, includedPositions: 0, excludedPositions: 0, limit: 10, fullCoverage: true,
})

assert.deepEqual(gateFullPortfolioMetric('BASE', 16), {
  available: false,
  reason: 'PLAN_POSITION_LIMIT',
  includedPositions: 10,
  totalPositions: 16,
})

assert.deepEqual(gateFullPortfolioMetric('BASE', 10), {
  available: true,
  reason: 'OK',
  includedPositions: 10,
  totalPositions: 10,
})

console.log('access policy regression: ok')
