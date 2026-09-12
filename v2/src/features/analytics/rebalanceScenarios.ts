import type { DriftResult, StrategyAssetKey } from './drift'

export const REBALANCE_SCENARIO_CALC_VERSION = '1.0' as const

export type RebalanceScenarioMode = 'REBALANCE_EXISTING' | 'ADD_CAPITAL' | 'WITHDRAW_CAPITAL'

export type RebalanceScenarioRow = {
  key: StrategyAssetKey
  label: string
  targetWeight: number
  currentValue: number
  targetValue: number
  deltaValue: number
  direction: 'INCREASE' | 'DECREASE' | 'NONE'
}

export type RebalanceScenarioResult = {
  calcVersion: typeof REBALANCE_SCENARIO_CALC_VERSION
  available: boolean
  mode: RebalanceScenarioMode
  requestedFlow: number
  assignedValueBefore: number
  assignedValueAfter: number | null
  unassignedWeight: number
  exactTargetPossible: boolean
  minimumFlowForExactTarget: number | null
  rows: RebalanceScenarioRow[]
  reason: string | null
  note: string
}

const EPSILON = 1e-8
const VALID_MODES = new Set<RebalanceScenarioMode>(['REBALANCE_EXISTING', 'ADD_CAPITAL', 'WITHDRAW_CAPITAL'])

function finitePositive(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function validStrategy(drift: DriftResult) {
  if (!drift.strategy.targets.length) return false
  const sum = drift.strategy.targets.reduce((total, target) => total + target.target, 0)
  const uniqueKeys = new Set(drift.strategy.targets.map(target => target.key))
  return uniqueKeys.size === drift.strategy.targets.length
    && drift.strategy.targets.every(target => Number.isFinite(target.target) && target.target > 0)
    && Math.abs(sum - 1) <= EPSILON
}

function direction(delta: number): RebalanceScenarioRow['direction'] {
  if (Math.abs(delta) <= EPSILON) return 'NONE'
  return delta > 0 ? 'INCREASE' : 'DECREASE'
}

function minimumAddForExact(rows: DriftResult['rows'], assignedValue: number) {
  let requiredFinalValue = assignedValue
  for (const row of rows) {
    if (!(row.target > 0)) continue
    requiredFinalValue = Math.max(requiredFinalValue, row.currentValue / row.target)
  }
  return Math.max(0, requiredFinalValue - assignedValue)
}

function minimumWithdrawForExact(rows: DriftResult['rows'], assignedValue: number) {
  let maximumFinalValue = assignedValue
  for (const row of rows) {
    if (!(row.target > 0)) continue
    maximumFinalValue = Math.min(maximumFinalValue, row.currentValue / row.target)
  }
  return Math.max(0, assignedValue - maximumFinalValue)
}

/**
 * Deterministic class-level rebalancing diagnostics.
 *
 * The calculation operates only on the strategy-assigned sleeve represented by
 * DriftResult rows. Assets outside that sleeve are left untouched and their
 * weight is surfaced separately. ADD_CAPITAL never assumes sales;
 * WITHDRAW_CAPITAL never assumes purchases. If the user-supplied flow is too
 * small to reach the target using only the requested direction, the scenario
 * stays diagnostic and reports that the exact target is not reachable.
 */
export function calculateRebalanceScenario(
  drift: DriftResult,
  mode: RebalanceScenarioMode,
  flowAmount = 0,
): RebalanceScenarioResult {
  const assignedValueBefore = drift.rows.reduce((sum, row) => {
    const value = Number(row.currentValue)
    return sum + (Number.isFinite(value) && value > 0 ? value : 0)
  }, 0)

  const base = {
    calcVersion: REBALANCE_SCENARIO_CALC_VERSION,
    mode,
    requestedFlow: 0,
    assignedValueBefore,
    assignedValueAfter: null,
    unassignedWeight: drift.unassignedWeight,
    exactTargetPossible: false,
    minimumFlowForExactTarget: null,
    rows: [] as RebalanceScenarioRow[],
  }

  if (!VALID_MODES.has(mode)) {
    return {
      available: false,
      ...base,
      reason: 'Unknown rebalancing scenario mode.',
      note: 'Unsupported modes fail closed and do not produce target deltas.',
    }
  }

  if (!drift.available || assignedValueBefore <= 0) {
    return {
      available: false,
      ...base,
      reason: 'Strategy sleeve is unavailable until positive assigned asset values exist.',
      note: 'No scenario is produced from missing or zero strategy-sleeve data.',
    }
  }

  if (!validStrategy(drift)) {
    return {
      available: false,
      ...base,
      reason: 'Strategy targets must be unique positive finite weights summing to 100%.',
      note: 'Invalid or duplicate target weights are not normalized silently.',
    }
  }

  const requestedFlow = mode === 'REBALANCE_EXISTING' ? 0 : finitePositive(flowAmount)
  if (mode !== 'REBALANCE_EXISTING' && requestedFlow == null) {
    return {
      available: false,
      ...base,
      reason: 'A positive user-supplied flow amount is required for this scenario.',
      note: 'QVANIX does not invent contribution or withdrawal amounts.',
    }
  }

  if (mode === 'WITHDRAW_CAPITAL' && requestedFlow! >= assignedValueBefore) {
    return {
      available: false,
      ...base,
      requestedFlow: requestedFlow!,
      reason: 'Withdrawal scenario must leave a positive strategy sleeve.',
      note: 'Full liquidation is outside this deterministic rebalancing diagnostic.',
    }
  }

  const assignedValueAfter = mode === 'ADD_CAPITAL'
    ? assignedValueBefore + requestedFlow!
    : mode === 'WITHDRAW_CAPITAL'
      ? assignedValueBefore - requestedFlow!
      : assignedValueBefore

  const minimumFlowForExactTarget = mode === 'ADD_CAPITAL'
    ? minimumAddForExact(drift.rows, assignedValueBefore)
    : mode === 'WITHDRAW_CAPITAL'
      ? minimumWithdrawForExact(drift.rows, assignedValueBefore)
      : 0

  const rows = drift.rows.map(row => {
    const targetValue = assignedValueAfter * row.target
    const deltaValue = targetValue - row.currentValue
    return {
      key: row.key,
      label: row.label,
      targetWeight: row.target,
      currentValue: row.currentValue,
      targetValue,
      deltaValue,
      direction: direction(deltaValue),
    }
  })

  const exactTargetPossible = mode === 'REBALANCE_EXISTING'
    ? true
    : mode === 'ADD_CAPITAL'
      ? rows.every(row => row.deltaValue >= -EPSILON)
      : rows.every(row => row.deltaValue <= EPSILON)

  const reason = exactTargetPossible
    ? null
    : mode === 'ADD_CAPITAL'
      ? `Exact target requires at least ${minimumFlowForExactTarget.toFixed(2)} of added capital if no existing class is reduced.`
      : `Exact target requires at least ${minimumFlowForExactTarget.toFixed(2)} of withdrawal if no class is increased.`

  return {
    available: true,
    mode,
    requestedFlow: requestedFlow ?? 0,
    assignedValueBefore,
    assignedValueAfter,
    unassignedWeight: drift.unassignedWeight,
    exactTargetPossible,
    minimumFlowForExactTarget,
    rows,
    reason,
    note: 'Class-level scenario only. Unassigned assets are unchanged. Values are deterministic target deltas, not personalized buy/sell recommendations.',
  }
}
