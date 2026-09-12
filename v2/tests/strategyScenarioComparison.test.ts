import assert from 'node:assert/strict'
import { compareStrategyScenarios } from '../src/features/analytics/strategyScenarioComparison.ts'
import type { StrategyConfig } from '../src/features/analytics/drift.ts'

const position = (ticker: string, instrumentType: string, currentValue: number) => ({
  ticker,
  name: ticker,
  instrumentType,
  currentValue,
}) as any

const strategy = (name: string, equity: number, bond: number): StrategyConfig => ({
  version: '1.0',
  name,
  targets: [
    { key: 'equity', label: 'Equity', target: equity },
    { key: 'bond', label: 'Bond', target: bond },
  ],
  absoluteTolerance: 0.05,
  relativeTolerance: 0.20,
})

const positions = [
  position('EQ', 'share', 60),
  position('BOND', 'bond', 40),
]

const comparison = compareStrategyScenarios(positions, [
  { id: 'balanced', strategy: strategy('50/50', 0.5, 0.5) },
  { id: 'equity-tilt', strategy: strategy('60/40', 0.6, 0.4) },
])
assert.equal(comparison.available, true)
assert.equal(comparison.rows.length, 2)
assert.equal(comparison.reason, null)
assert.match(comparison.note, /not.*recommended|No scenario is recommended/i)

const balanced = comparison.rows.find(row => row.id === 'balanced')!
assert.equal(balanced.available, true)
assert.equal(balanced.targetEquity, 0.5)
assert.equal(balanced.targetBond, 0.5)
assert.ok(Math.abs((balanced.maxAbsoluteDrift ?? 0) - 0.1) < 1e-10)
assert.ok(Math.abs((balanced.rebalanceTurnoverValue ?? 0) - 10) < 1e-10)
assert.ok(Math.abs((balanced.rebalanceTurnoverRatio ?? 0) - 0.1) < 1e-10)
assert.equal(balanced.withinTolerance, false)

const equityTilt = comparison.rows.find(row => row.id === 'equity-tilt')!
assert.equal(equityTilt.available, true)
assert.ok(Math.abs(equityTilt.rebalanceTurnoverValue ?? 1) < 1e-10)
assert.ok(Math.abs(equityTilt.rebalanceTurnoverRatio ?? 1) < 1e-10)
assert.equal(equityTilt.withinTolerance, true)

const invalidOneClass = strategy('invalid 100/0', 1, 0)
const failClosed = compareStrategyScenarios(positions, [
  { id: 'invalid', strategy: invalidOneClass },
  { id: 'valid', strategy: strategy('50/50', 0.5, 0.5) },
])
assert.equal(failClosed.available, false)
assert.equal(failClosed.rows.length, 0)
assert.match(failClosed.reason ?? '', /At least two valid/)

const duplicateIds = compareStrategyScenarios(positions, [
  { id: 'same', strategy: strategy('50/50', 0.5, 0.5) },
  { id: 'same', strategy: strategy('60/40', 0.6, 0.4) },
])
assert.equal(duplicateIds.available, false)
assert.equal(duplicateIds.rows.length, 0)

const capped = compareStrategyScenarios(positions, [
  { id: 'a', strategy: strategy('50/50', 0.5, 0.5) },
  { id: 'b', strategy: strategy('55/45', 0.55, 0.45) },
  { id: 'c', strategy: strategy('60/40', 0.6, 0.4) },
  { id: 'd', strategy: strategy('65/35', 0.65, 0.35) },
  { id: 'e', strategy: strategy('70/30', 0.7, 0.3) },
])
assert.equal(capped.rows.length, 4)
assert.deepEqual(capped.rows.map(row => row.id), ['a', 'b', 'c', 'd'])

console.log('strategy scenario comparison regression: ok')
