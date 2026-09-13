import assert from 'node:assert/strict'
import {
  calculateAllocationDrift,
  DRIFT_CALC_VERSION,
  PERSONAL_STRATEGY_V1,
  type StrategyConfig,
} from '../src/features/analytics/drift.ts'
import {
  calculateRebalanceScenario,
  REBALANCE_SCENARIO_CALC_VERSION,
} from '../src/features/analytics/rebalanceScenarios.ts'

const close = (actual: number | null, expected: number, tolerance = 1e-10) => {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const position = (ticker: string, instrumentType: string, currentValue: number, name = ticker) => ({
  ticker,
  name,
  instrumentType,
  currentValue,
}) as any

const exact = calculateAllocationDrift([
  position('EQ', 'share', 50),
  position('SU26247RMFS5', 'bond', 50, 'ОФЗ 26247'),
])
assert.equal(exact.calcVersion, DRIFT_CALC_VERSION)
assert.equal(exact.calcVersion, '1.0')
assert.equal(exact.available, true)
assert.equal(exact.withinTolerance, true)
close(exact.unassignedWeight, 0)
close(exact.maxAbsoluteDrift, 0)

const inside = calculateAllocationDrift([
  position('EQ', 'share', 54),
  position('SU26247RMFS5', 'bond', 46),
])
assert.equal(inside.withinTolerance, true)
assert.equal(inside.rows.every(row => !row.outsideTolerance), true)
close(inside.maxAbsoluteDrift, 0.04)

const atAbsoluteBoundary = calculateAllocationDrift([
  position('EQ', 'share', 55),
  position('SU26247RMFS5', 'bond', 45),
])
assert.equal(atAbsoluteBoundary.withinTolerance, false)
assert.equal(atAbsoluteBoundary.rows.some(row => row.outsideTolerance), true)
close(atAbsoluteBoundary.maxAbsoluteDrift, 0.05)

const unassignedBoundary = calculateAllocationDrift([
  position('EQ', 'share', 47.5),
  position('SU26247RMFS5', 'bond', 47.5),
  position('CASHLIKE', 'fund', 5),
])
close(unassignedBoundary.unassignedWeight, 0.05)
assert.equal(unassignedBoundary.rows.every(row => !row.outsideTolerance), true)
assert.equal(unassignedBoundary.withinTolerance, false)

const relativeStrategy: StrategyConfig = {
  version: '1.0',
  name: '10/90 test',
  targets: [
    { key: 'equity', label: 'Equity', target: 0.10 },
    { key: 'bond', label: 'Bond', target: 0.90 },
  ],
  absoluteTolerance: 0.05,
  relativeTolerance: 0.20,
}
const relativeBoundary = calculateAllocationDrift([
  position('EQ', 'share', 12.1),
  position('BOND', 'bond', 87.9),
], relativeStrategy)
const relativeEquity = relativeBoundary.rows.find(row => row.key === 'equity')!
assert.ok(Math.abs(relativeEquity.delta) < relativeStrategy.absoluteTolerance)
assert.ok(Math.abs(relativeEquity.relativeDelta ?? 0) > relativeStrategy.relativeTolerance)
assert.equal(relativeEquity.outsideTolerance, true)
assert.equal(relativeBoundary.withinTolerance, false)

const invalidPositions = calculateAllocationDrift([
  position('BAD', 'share', -10),
  position('NAN', 'bond', Number.NaN),
])
assert.equal(invalidPositions.available, false)
assert.equal(invalidPositions.withinTolerance, false)
assert.equal(invalidPositions.unassignedWeight, 0)

const drift6040 = calculateAllocationDrift([
  position('EQ', 'share', 60),
  position('BOND', 'bond', 40),
])

const redistribute = calculateRebalanceScenario(drift6040, 'REBALANCE_EXISTING')
assert.equal(redistribute.calcVersion, REBALANCE_SCENARIO_CALC_VERSION)
assert.equal(redistribute.calcVersion, '1.1')
assert.equal(redistribute.available, true)
assert.equal(redistribute.exactTargetPossible, true)
close(redistribute.assignedValueBefore, 100)
close(redistribute.assignedValueAfter, 100)
close(redistribute.minimumFlowForExactTarget, 0)
const redistributeEquity = redistribute.rows.find(row => row.key === 'equity')!
const redistributeBond = redistribute.rows.find(row => row.key === 'bond')!
close(redistributeEquity.deltaValue, -10)
close(redistributeBond.deltaValue, 10)
assert.equal(redistributeEquity.direction, 'DECREASE')
assert.equal(redistributeBond.direction, 'INCREASE')

const addTooLittle = calculateRebalanceScenario(drift6040, 'ADD_CAPITAL', 10)
assert.equal(addTooLittle.available, true)
assert.equal(addTooLittle.exactTargetPossible, false)
close(addTooLittle.minimumFlowForExactTarget, 20)
close(addTooLittle.assignedValueAfter, 110)

const addExact = calculateRebalanceScenario(drift6040, 'ADD_CAPITAL', 20)
assert.equal(addExact.exactTargetPossible, true)
close(addExact.assignedValueAfter, 120)
close(addExact.rows.find(row => row.key === 'equity')!.deltaValue, 0)
close(addExact.rows.find(row => row.key === 'bond')!.deltaValue, 20)
assert.equal(addExact.rows.every(row => row.direction !== 'DECREASE'), true)

const withdrawTooLittle = calculateRebalanceScenario(drift6040, 'WITHDRAW_CAPITAL', 10)
assert.equal(withdrawTooLittle.available, true)
assert.equal(withdrawTooLittle.exactTargetPossible, false)
close(withdrawTooLittle.minimumFlowForExactTarget, 20)
close(withdrawTooLittle.assignedValueAfter, 90)

const withdrawExact = calculateRebalanceScenario(drift6040, 'WITHDRAW_CAPITAL', 20)
assert.equal(withdrawExact.exactTargetPossible, true)
close(withdrawExact.assignedValueAfter, 80)
close(withdrawExact.rows.find(row => row.key === 'equity')!.deltaValue, -20)
close(withdrawExact.rows.find(row => row.key === 'bond')!.deltaValue, 0)
assert.equal(withdrawExact.rows.every(row => row.direction !== 'INCREASE'), true)

const noInventedFlow = calculateRebalanceScenario(drift6040, 'ADD_CAPITAL', 0)
assert.equal(noInventedFlow.available, false)
assert.equal(noInventedFlow.requestedFlow, 0)

const fullWithdrawal = calculateRebalanceScenario(drift6040, 'WITHDRAW_CAPITAL', 100)
assert.equal(fullWithdrawal.available, false)
assert.equal(fullWithdrawal.requestedFlow, 100)

const unknownMode = calculateRebalanceScenario(drift6040, 'UNKNOWN' as any, 10)
assert.equal(unknownMode.available, false)
assert.match(unknownMode.reason ?? '', /Unknown/)

const duplicateStrategy: StrategyConfig = {
  ...PERSONAL_STRATEGY_V1,
  name: 'duplicate keys',
  targets: [
    { key: 'equity', label: 'Equity A', target: 0.50 },
    { key: 'equity', label: 'Equity B', target: 0.50 },
  ],
}
const duplicateDrift = calculateAllocationDrift([
  position('EQ', 'share', 50),
  position('BOND', 'bond', 50),
], duplicateStrategy)
const duplicateScenario = calculateRebalanceScenario(duplicateDrift, 'REBALANCE_EXISTING')
assert.equal(duplicateScenario.available, false)
assert.match(duplicateScenario.reason ?? '', /unique/)

const malformedNegativeValue = {
  ...drift6040,
  rows: drift6040.rows.map((row, index) => index === 0 ? { ...row, currentValue: -1 } : row),
}
const malformedNegativeScenario = calculateRebalanceScenario(malformedNegativeValue, 'REBALANCE_EXISTING')
assert.equal(malformedNegativeScenario.available, false)
assert.equal(malformedNegativeScenario.rows.length, 0)
assert.match(malformedNegativeScenario.reason ?? '', /Drift rows/)

const malformedNaNValue = {
  ...drift6040,
  rows: drift6040.rows.map((row, index) => index === 0 ? { ...row, currentValue: Number.NaN } : row),
}
const malformedNaNScenario = calculateRebalanceScenario(malformedNaNValue, 'ADD_CAPITAL', 20)
assert.equal(malformedNaNScenario.available, false)
assert.equal(malformedNaNScenario.rows.length, 0)
assert.match(malformedNaNScenario.reason ?? '', /Drift rows/)

const malformedTargetMismatch = {
  ...drift6040,
  rows: drift6040.rows.map((row, index) => index === 0 ? { ...row, target: row.target + 0.01 } : row),
}
const malformedTargetScenario = calculateRebalanceScenario(malformedTargetMismatch, 'REBALANCE_EXISTING')
assert.equal(malformedTargetScenario.available, false)
assert.equal(malformedTargetScenario.rows.length, 0)
assert.match(malformedTargetScenario.reason ?? '', /Drift rows/)

const malformedDuplicateRowKey = {
  ...drift6040,
  rows: [
    drift6040.rows[0],
    { ...drift6040.rows[1], key: drift6040.rows[0].key },
  ],
}
const malformedDuplicateRowScenario = calculateRebalanceScenario(malformedDuplicateRowKey, 'REBALANCE_EXISTING')
assert.equal(malformedDuplicateRowScenario.available, false)
assert.equal(malformedDuplicateRowScenario.rows.length, 0)
assert.match(malformedDuplicateRowScenario.reason ?? '', /Drift rows/)

const malformedUnassignedWeight = {
  ...drift6040,
  unassignedWeight: 1.25,
}
const malformedUnassignedScenario = calculateRebalanceScenario(malformedUnassignedWeight, 'REBALANCE_EXISTING')
assert.equal(malformedUnassignedScenario.available, false)
assert.equal(malformedUnassignedScenario.rows.length, 0)
assert.match(malformedUnassignedScenario.reason ?? '', /Drift rows/)

console.log('drift/rebalance regression: ok')
