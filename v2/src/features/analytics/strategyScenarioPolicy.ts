export type StrategyScenarioPolicyTarget = {
  key: string
  target: number
}

export type StrategyScenarioPolicyConfig = {
  version: string
  name: string
  targets: StrategyScenarioPolicyTarget[]
  absoluteTolerance: number
  relativeTolerance: number
}

export type StrategyScenarioPolicyInput<TStrategy extends StrategyScenarioPolicyConfig = StrategyScenarioPolicyConfig> = {
  id: string
  strategy: TStrategy
}

export const STRATEGY_SCENARIO_MAX_COUNT = 4
const EPSILON = 1e-8

export function isValidStrategyScenarioConfig(strategy: StrategyScenarioPolicyConfig | null | undefined) {
  if (!strategy || strategy.version !== '1.0' || strategy.targets.length !== 2) return false

  const keys = new Set<string>()
  let total = 0
  for (const target of strategy.targets) {
    if (target.key !== 'equity' && target.key !== 'bond') return false
    if (keys.has(target.key)) return false
    keys.add(target.key)
    if (!Number.isFinite(target.target) || target.target <= 0) return false
    total += target.target
  }

  if (!keys.has('equity') || !keys.has('bond')) return false
  if (Math.abs(total - 1) > EPSILON) return false

  return Number.isFinite(strategy.absoluteTolerance)
    && strategy.absoluteTolerance >= 0
    && Number.isFinite(strategy.relativeTolerance)
    && strategy.relativeTolerance >= 0
}

/**
 * Accepts only explicit user-supplied, uniquely identified two-class scenarios.
 * Invalid weights are never normalized. The mobile comparison cap applies to
 * accepted valid scenarios, so malformed earlier rows cannot consume capacity
 * that belongs to later valid user-authored inputs.
 */
export function acceptStrategyScenarioInputs<TStrategy extends StrategyScenarioPolicyConfig>(
  inputs: StrategyScenarioPolicyInput<TStrategy>[],
) {
  const uniqueIds = new Set<string>()
  const accepted: StrategyScenarioPolicyInput<TStrategy>[] = []

  for (const input of inputs) {
    if (accepted.length >= STRATEGY_SCENARIO_MAX_COUNT) break
    const id = String(input?.id || '').trim()
    if (!id || uniqueIds.has(id) || !isValidStrategyScenarioConfig(input.strategy)) continue
    uniqueIds.add(id)
    accepted.push({ ...input, id })
  }

  return accepted
}
