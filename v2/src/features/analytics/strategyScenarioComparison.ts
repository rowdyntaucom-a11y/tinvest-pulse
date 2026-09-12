import type { PositionSnapshot } from '../../lib/portfolioApi'
import { calculateAllocationDrift, type DriftResult, type StrategyConfig } from './drift'
import { calculateRebalanceScenario } from './rebalanceScenarios'

export type StrategyScenarioInput = {
  id: string
  strategy: StrategyConfig
}

export type StrategyScenarioComparisonRow = {
  id: string
  name: string
  available: boolean
  targetEquity: number | null
  targetBond: number | null
  maxAbsoluteDrift: number | null
  unassignedWeight: number
  withinTolerance: boolean
  rebalanceTurnoverValue: number | null
  rebalanceTurnoverRatio: number | null
  reason: string | null
}

export type StrategyScenarioComparison = {
  available: boolean
  rows: StrategyScenarioComparisonRow[]
  reason: string | null
  note: string
}

const EPSILON = 1e-8
const MAX_SCENARIOS = 4

function validStrategy(strategy: StrategyConfig) {
  if (!strategy || strategy.version !== '1.0' || !strategy.targets.length) return false
  const keys = new Set<string>()
  let total = 0
  for (const target of strategy.targets) {
    if (target.key !== 'equity' && target.key !== 'bond') return false
    if (keys.has(target.key)) return false
    keys.add(target.key)
    if (!Number.isFinite(target.target) || target.target <= 0) return false
    total += target.target
  }
  if (Math.abs(total - 1) > EPSILON) return false
  return Number.isFinite(strategy.absoluteTolerance)
    && strategy.absoluteTolerance >= 0
    && Number.isFinite(strategy.relativeTolerance)
    && strategy.relativeTolerance >= 0
}

function targetFor(drift: DriftResult, key: 'equity' | 'bond') {
  const target = drift.strategy.targets.find(row => row.key === key)?.target
  return typeof target === 'number' && Number.isFinite(target) ? target : null
}

function turnover(drift: DriftResult) {
  const scenario = calculateRebalanceScenario(drift, 'REBALANCE_EXISTING')
  if (!scenario.available || !scenario.exactTargetPossible || !scenario.assignedValueAfter) {
    return { value: null, ratio: null }
  }

  // With existing capital only, class increases and decreases must offset.
  // Half of gross absolute target deltas is therefore the capital that must
  // cross between the supported strategy classes. This is a class-level
  // diagnostic, not an instrument order list and excludes unassigned assets.
  const gross = scenario.rows.reduce((sum, row) => sum + Math.abs(row.deltaValue), 0)
  const value = gross / 2
  return {
    value,
    ratio: scenario.assignedValueAfter > 0 ? value / scenario.assignedValueAfter : null,
  }
}

/**
 * Compares explicitly supplied equity/bond strategy scenarios against the same
 * current portfolio snapshot. QVANIX does not generate candidate strategies,
 * rank them as "best", or attach expected returns. Invalid weights fail closed
 * rather than being normalized silently.
 */
export function compareStrategyScenarios(
  positions: PositionSnapshot[],
  inputs: StrategyScenarioInput[],
): StrategyScenarioComparison {
  const uniqueIds = new Set<string>()
  const accepted: StrategyScenarioInput[] = []

  for (const input of inputs.slice(0, MAX_SCENARIOS)) {
    const id = String(input?.id || '').trim()
    if (!id || uniqueIds.has(id) || !validStrategy(input.strategy)) continue
    uniqueIds.add(id)
    accepted.push({ ...input, id })
  }

  if (accepted.length < 2) {
    return {
      available: false,
      rows: [],
      reason: 'At least two valid, uniquely identified user-supplied strategy scenarios are required.',
      note: 'QVANIX does not invent or normalize comparison strategies.',
    }
  }

  const rows = accepted.map(input => {
    const drift = calculateAllocationDrift(positions, input.strategy)
    const movement = drift.available ? turnover(drift) : { value: null, ratio: null }
    return {
      id: input.id,
      name: input.strategy.name,
      available: drift.available,
      targetEquity: targetFor(drift, 'equity'),
      targetBond: targetFor(drift, 'bond'),
      maxAbsoluteDrift: drift.maxAbsoluteDrift,
      unassignedWeight: drift.unassignedWeight,
      withinTolerance: drift.withinTolerance,
      rebalanceTurnoverValue: movement.value,
      rebalanceTurnoverRatio: movement.ratio,
      reason: drift.available ? null : 'Current portfolio does not contain enough positive strategy-sleeve value for this comparison.',
    }
  })

  return {
    available: rows.some(row => row.available),
    rows,
    reason: rows.some(row => row.available) ? null : 'No supplied scenario can be evaluated from the current strategy sleeve.',
    note: 'Side-by-side deterministic diagnostics only. No scenario is recommended, ranked by expected return, or converted into personalized buy/sell instructions.',
  }
}
