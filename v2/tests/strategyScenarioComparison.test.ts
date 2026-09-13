import assert from 'node:assert/strict'
import {
  acceptStrategyScenarioInputs,
  isValidStrategyScenarioConfig,
  STRATEGY_SCENARIO_MAX_COUNT,
} from '../src/features/analytics/strategyScenarioPolicy.ts'

const strategy = (name: string, equity: number, bond: number) => ({
  version: '1.0',
  name,
  targets: [
    { key: 'equity', target: equity },
    { key: 'bond', target: bond },
  ],
  absoluteTolerance: 0.05,
  relativeTolerance: 0.20,
})

assert.equal(isValidStrategyScenarioConfig(strategy('50/50', 0.5, 0.5)), true)
assert.equal(isValidStrategyScenarioConfig(strategy('60/40', 0.6, 0.4)), true)
assert.equal(isValidStrategyScenarioConfig(strategy('invalid 100/0', 1, 0)), false)
assert.equal(isValidStrategyScenarioConfig(strategy('invalid total', 0.6, 0.5)), false)
assert.equal(isValidStrategyScenarioConfig({
  ...strategy('duplicate class', 0.5, 0.5),
  targets: [
    { key: 'equity', target: 0.5 },
    { key: 'equity', target: 0.5 },
  ],
}), false)
assert.equal(isValidStrategyScenarioConfig({
  ...strategy('negative tolerance', 0.5, 0.5),
  absoluteTolerance: -0.01,
}), false)

const accepted = acceptStrategyScenarioInputs([
  { id: ' balanced ', strategy: strategy('50/50', 0.5, 0.5) },
  { id: 'equity-tilt', strategy: strategy('60/40', 0.6, 0.4) },
])
assert.deepEqual(accepted.map(row => row.id), ['balanced', 'equity-tilt'])

const failClosed = acceptStrategyScenarioInputs([
  { id: 'invalid', strategy: strategy('invalid 100/0', 1, 0) },
  { id: 'valid', strategy: strategy('50/50', 0.5, 0.5) },
])
assert.deepEqual(failClosed.map(row => row.id), ['valid'])

const duplicateIds = acceptStrategyScenarioInputs([
  { id: 'same', strategy: strategy('50/50', 0.5, 0.5) },
  { id: 'same', strategy: strategy('60/40', 0.6, 0.4) },
])
assert.deepEqual(duplicateIds.map(row => row.id), ['same'])

const capped = acceptStrategyScenarioInputs([
  { id: 'a', strategy: strategy('50/50', 0.5, 0.5) },
  { id: 'b', strategy: strategy('55/45', 0.55, 0.45) },
  { id: 'c', strategy: strategy('60/40', 0.6, 0.4) },
  { id: 'd', strategy: strategy('65/35', 0.65, 0.35) },
  { id: 'e', strategy: strategy('70/30', 0.7, 0.3) },
])
assert.equal(STRATEGY_SCENARIO_MAX_COUNT, 4)
assert.equal(capped.length, STRATEGY_SCENARIO_MAX_COUNT)
assert.deepEqual(capped.map(row => row.id), ['a', 'b', 'c', 'd'])

// Invalid or duplicate rows before the cap must not consume slots that belong
// to later valid user-authored scenarios.
const validCap = acceptStrategyScenarioInputs([
  { id: 'bad', strategy: strategy('invalid total', 0.7, 0.4) },
  { id: 'a', strategy: strategy('50/50', 0.5, 0.5) },
  { id: 'a', strategy: strategy('55/45 duplicate id', 0.55, 0.45) },
  { id: 'b', strategy: strategy('55/45', 0.55, 0.45) },
  { id: 'c', strategy: strategy('60/40', 0.6, 0.4) },
  { id: 'd', strategy: strategy('65/35', 0.65, 0.35) },
  { id: 'e', strategy: strategy('70/30', 0.7, 0.3) },
])
assert.equal(validCap.length, STRATEGY_SCENARIO_MAX_COUNT)
assert.deepEqual(validCap.map(row => row.id), ['a', 'b', 'c', 'd'])

console.log('strategy scenario policy regression: ok')
