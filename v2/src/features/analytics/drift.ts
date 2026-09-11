import type { PositionSnapshot } from '../../lib/portfolioApi'

export type StrategyAssetKey = 'equity' | 'bond'

export type StrategyTarget = {
  key: StrategyAssetKey
  label: string
  target: number
}

export type StrategyConfig = {
  version: '1.0'
  name: string
  targets: StrategyTarget[]
  absoluteTolerance: number
  relativeTolerance: number
}

export type DriftRow = StrategyTarget & {
  actual: number
  delta: number
  relativeDelta: number | null
  currentValue: number
  outsideTolerance: boolean
}

export type DriftResult = {
  available: boolean
  strategy: StrategyConfig
  rows: DriftRow[]
  unassignedWeight: number
  maxAbsoluteDrift: number | null
  withinTolerance: boolean
}

export const PERSONAL_STRATEGY_V1: StrategyConfig = {
  version: '1.0',
  name: '50% акции / 50% облигации',
  targets: [
    { key: 'equity', label: 'Акции', target: 0.50 },
    { key: 'bond', label: 'Облигации', target: 0.50 },
  ],
  absoluteTolerance: 0.05,
  relativeTolerance: 0.20,
}

function classify(position: PositionSnapshot): StrategyAssetKey | null {
  const type = String(position.instrumentType || '').trim().toLowerCase()
  const ticker = String(position.ticker || '').trim().toUpperCase()
  const name = String(position.name || '').trim().toLowerCase()

  if (type.includes('bond') || /^SU\d/.test(ticker) || /^RU000A/.test(ticker) || /офз|облигац/.test(name)) return 'bond'
  if (type.includes('share') || type.includes('stock') || type === 'equity') return 'equity'
  return null
}

export function calculateAllocationDrift(
  positions: PositionSnapshot[],
  strategy: StrategyConfig = PERSONAL_STRATEGY_V1,
): DriftResult {
  const valid = positions.filter(position => Number.isFinite(position.currentValue) && position.currentValue > 0)
  const total = valid.reduce((sum, position) => sum + position.currentValue, 0)
  const sums = new Map<StrategyAssetKey, number>()
  let assignedValue = 0

  for (const position of valid) {
    const key = classify(position)
    if (!key) continue
    sums.set(key, (sums.get(key) || 0) + position.currentValue)
    assignedValue += position.currentValue
  }

  const rows = strategy.targets.map(target => {
    const currentValue = sums.get(target.key) || 0
    const actual = total > 0 ? currentValue / total : 0
    const delta = actual - target.target
    const relativeDelta = target.target > 0 ? delta / target.target : null
    const outsideTolerance =
      Math.abs(delta) >= strategy.absoluteTolerance ||
      (relativeDelta != null && Math.abs(relativeDelta) >= strategy.relativeTolerance)

    return {
      ...target,
      actual,
      delta,
      relativeDelta,
      currentValue,
      outsideTolerance,
    }
  })

  const unassignedWeight = total > 0 ? Math.max(0, (total - assignedValue) / total) : 0
  const maxAbsoluteDrift = rows.length ? Math.max(...rows.map(row => Math.abs(row.delta))) : null
  const available = total > 0 && rows.some(row => row.currentValue > 0)
  const withinTolerance = available && rows.every(row => !row.outsideTolerance) && unassignedWeight < strategy.absoluteTolerance

  return {
    available,
    strategy,
    rows,
    unassignedWeight,
    maxAbsoluteDrift,
    withinTolerance,
  }
}
