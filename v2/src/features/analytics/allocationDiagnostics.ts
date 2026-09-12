import type { RiskSeries } from './riskMatrix'
import { buildReturnIntervalMap, commonReturnIntervalKeys } from './returnIntervals'

export const ALLOCATION_DIAGNOSTICS_CALC_VERSION = '1.2' as const

export type AllocationWeight = {
  key: string
  label: string
  weight: number
  annualizedVolatility: number
  riskContribution: number | null
}

export type AllocationScenario = {
  method: 'EQUAL_WEIGHT' | 'MIN_VARIANCE_LONG_ONLY' | 'EQUAL_RISK_CONTRIBUTION'
  available: boolean
  converged: boolean
  annualizedVolatility: number | null
  weights: AllocationWeight[]
  iterations: number
  note: string
}

export type AllocationDiagnosticsResult = {
  version: typeof ALLOCATION_DIAGNOSTICS_CALC_VERSION
  available: boolean
  status: 'INSUFFICIENT_HISTORY' | 'PREVIEW' | 'MATURE'
  commonReturns: number
  minimumReturns: number
  matureReturns: number
  assetCount: number
  from: string | null
  to: string | null
  equalWeight: AllocationScenario | null
  minimumVariance: AllocationScenario | null
  equalRiskContribution: AllocationScenario | null
  note: string
}

const MIN_COMMON_RETURNS = 60
const MATURE_COMMON_RETURNS = 252
const TRADING_DAYS = 252
const MAX_ASSETS = 10
const EPS = 1e-12

function alignSeries(series: RiskSeries[]) {
  const normalized = series
    .filter(item => item?.key && item?.label && Array.isArray(item.points))
    .slice(0, MAX_ASSETS)
  const unique = new Set(normalized.map(item => item.key))
  if (unique.size !== normalized.length || normalized.length < 2) {
    return {
      series: normalized,
      intervalKeys: [] as string[],
      rows: [] as number[][],
      from: null as string | null,
      to: null as string | null,
    }
  }

  const maps = normalized.map(item => buildReturnIntervalMap(item.points))
  const intervalKeys = commonReturnIntervalKeys(maps)
  const rows = intervalKeys.map(key => maps.map(map => map.get(key)!.value))
  const first = intervalKeys[0] ? maps[0].get(intervalKeys[0]) : null
  const last = intervalKeys.at(-1) ? maps[0].get(intervalKeys.at(-1)!) : null
  return {
    series: normalized,
    intervalKeys,
    rows,
    from: first?.from ?? null,
    to: last?.to ?? null,
  }
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function covarianceMatrix(rows: number[][]) {
  if (rows.length < 2 || !rows[0]?.length) return null
  const n = rows[0].length
  const means = new Array<number>(n).fill(0).map((_, column) => mean(rows.map(row => row[column])))
  const matrix = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  for (let i = 0; i < n; i += 1) {
    for (let j = i; j < n; j += 1) {
      let sum = 0
      for (const row of rows) sum += (row[i] - means[i]) * (row[j] - means[j])
      const value = sum / (rows.length - 1)
      matrix[i][j] = value
      matrix[j][i] = value
    }
  }
  return matrix
}

function matVec(matrix: number[][], vector: number[]) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0))
}

function variance(matrix: number[][], weights: number[]) {
  const marginal = matVec(matrix, weights)
  return weights.reduce((sum, weight, index) => sum + weight * marginal[index], 0)
}

function annualizedVolatility(matrix: number[][], weights: number[]) {
  const value = variance(matrix, weights)
  if (!Number.isFinite(value) || value < -EPS) return null
  return Math.sqrt(Math.max(0, value) * TRADING_DAYS)
}

function projectSimplex(values: number[]) {
  const sorted = [...values].sort((a, b) => b - a)
  let cumulative = 0
  let rho = -1
  for (let i = 0; i < sorted.length; i += 1) {
    cumulative += sorted[i]
    const theta = (cumulative - 1) / (i + 1)
    if (sorted[i] - theta > 0) rho = i
  }
  if (rho < 0) return new Array(values.length).fill(1 / values.length)
  const theta = (sorted.slice(0, rho + 1).reduce((sum, value) => sum + value, 0) - 1) / (rho + 1)
  return values.map(value => Math.max(0, value - theta))
}

function maxAbsDifference(a: number[], b: number[]) {
  let worst = 0
  for (let i = 0; i < a.length; i += 1) worst = Math.max(worst, Math.abs(a[i] - b[i]))
  return worst
}

function minimumVarianceWeights(matrix: number[][]) {
  const n = matrix.length
  let weights = new Array<number>(n).fill(1 / n)
  const rowNorm = Math.max(...matrix.map(row => row.reduce((sum, value) => sum + Math.abs(value), 0)))
  if (!Number.isFinite(rowNorm) || rowNorm <= EPS) return { weights, converged: false, iterations: 0 }
  const step = 1 / (2 * rowNorm)
  const maxIterations = 5000

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const gradient = matVec(matrix, weights).map(value => 2 * value)
    const next = projectSimplex(weights.map((weight, index) => weight - step * gradient[index]))
    const delta = maxAbsDifference(weights, next)
    weights = next
    if (delta < 1e-10) return { weights, converged: true, iterations: iteration }
  }
  return { weights, converged: false, iterations: maxIterations }
}

function riskContributionShares(matrix: number[][], weights: number[]) {
  const marginal = matVec(matrix, weights)
  const portfolioVariance = weights.reduce((sum, weight, index) => sum + weight * marginal[index], 0)
  if (!Number.isFinite(portfolioVariance) || portfolioVariance <= EPS) return null
  const shares = weights.map((weight, index) => weight * marginal[index] / portfolioVariance)
  return shares.every(Number.isFinite) ? shares : null
}

function equalRiskContributionWeights(matrix: number[][]) {
  const n = matrix.length
  const target = 1 / n
  let x = new Array<number>(n).fill(1 / Math.sqrt(n))
  const maxIterations = 10000

  if (matrix.some((row, index) => !Number.isFinite(row[index]) || row[index] <= EPS)) {
    return { weights: new Array<number>(n).fill(1 / n), converged: false, iterations: 0 }
  }

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    for (let i = 0; i < n; i += 1) {
      let cross = 0
      for (let j = 0; j < n; j += 1) if (j !== i) cross += matrix[i][j] * x[j]
      const diagonal = matrix[i][i]
      const discriminant = cross * cross + 4 * diagonal * target
      if (!Number.isFinite(discriminant) || discriminant < 0) {
        return { weights: new Array<number>(n).fill(1 / n), converged: false, iterations: iteration }
      }
      const next = (-cross + Math.sqrt(discriminant)) / (2 * diagonal)
      if (!Number.isFinite(next) || next <= 0) {
        return { weights: new Array<number>(n).fill(1 / n), converged: false, iterations: iteration }
      }
      x[i] = next
    }

    const total = x.reduce((sum, value) => sum + value, 0)
    if (!Number.isFinite(total) || total <= 0) break
    const weights = x.map(value => value / total)
    const contributions = riskContributionShares(matrix, weights)
    if (!contributions) break
    const maxDeviation = Math.max(...contributions.map(value => Math.abs(value - target)))
    if (maxDeviation < 1e-6) return { weights, converged: true, iterations: iteration }
  }

  const total = x.reduce((sum, value) => sum + value, 0)
  return {
    weights: total > 0 ? x.map(value => value / total) : new Array<number>(n).fill(1 / n),
    converged: false,
    iterations: maxIterations,
  }
}

function buildScenario(
  method: AllocationScenario['method'],
  series: RiskSeries[],
  matrix: number[][],
  weights: number[],
  converged: boolean,
  iterations: number,
  note: string,
): AllocationScenario {
  const contributions = riskContributionShares(matrix, weights)
  const annualized = annualizedVolatility(matrix, weights)
  return {
    method,
    available: annualized != null && (method === 'EQUAL_WEIGHT' || converged),
    converged,
    annualizedVolatility: annualized,
    weights: series.map((item, index) => ({
      key: item.key,
      label: item.label,
      weight: weights[index],
      annualizedVolatility: Math.sqrt(Math.max(0, matrix[index][index]) * TRADING_DAYS),
      riskContribution: contributions?.[index] ?? null,
    })),
    iterations,
    note,
  }
}

export function calculateAllocationDiagnostics(series: RiskSeries[]): AllocationDiagnosticsResult {
  const aligned = alignSeries(Array.isArray(series) ? series : [])
  const base = {
    version: ALLOCATION_DIAGNOSTICS_CALC_VERSION,
    commonReturns: aligned.rows.length,
    minimumReturns: MIN_COMMON_RETURNS,
    matureReturns: MATURE_COMMON_RETURNS,
    assetCount: aligned.series.length,
    from: aligned.from,
    to: aligned.to,
  }

  if (aligned.series.length < 2 || aligned.rows.length < MIN_COMMON_RETURNS) {
    return {
      ...base,
      available: false,
      status: 'INSUFFICIENT_HISTORY',
      equalWeight: null,
      minimumVariance: null,
      equalRiskContribution: null,
      note: `Нужно минимум 2 актива и ${MIN_COMMON_RETURNS} общих дневных доходностей по одинаковым интервалам наблюдения. Сейчас активов ${aligned.series.length}, общих доходностей ${aligned.rows.length}.`,
    }
  }

  const matrix = covarianceMatrix(aligned.rows)
  if (!matrix || matrix.some(row => row.some(value => !Number.isFinite(value)))) {
    return {
      ...base,
      available: false,
      status: aligned.rows.length >= MATURE_COMMON_RETURNS ? 'MATURE' : 'PREVIEW',
      equalWeight: null,
      minimumVariance: null,
      equalRiskContribution: null,
      note: 'Ковариационная матрица не прошла проверку на конечные значения; allocation diagnostics скрыты.',
    }
  }

  const n = aligned.series.length
  const equal = new Array<number>(n).fill(1 / n)
  const minVariance = minimumVarianceWeights(matrix)
  const riskParity = equalRiskContributionWeights(matrix)
  const status = aligned.rows.length >= MATURE_COMMON_RETURNS ? 'MATURE' : 'PREVIEW'

  return {
    ...base,
    available: true,
    status,
    equalWeight: buildScenario(
      'EQUAL_WEIGHT', aligned.series, matrix, equal, true, 0,
      'Равные веса — контрольная точка, а не рекомендация.',
    ),
    minimumVariance: buildScenario(
      'MIN_VARIANCE_LONG_ONLY', aligned.series, matrix, minVariance.weights, minVariance.converged, minVariance.iterations,
      minVariance.converged
        ? 'Long-only minimum variance по выборочной ковариации общей истории; ожидаемые доходности не используются.'
        : 'Численный solver minimum variance не достиг критерия сходимости; результат не следует показывать как готовую диагностику.',
    ),
    equalRiskContribution: buildScenario(
      'EQUAL_RISK_CONTRIBUTION', aligned.series, matrix, riskParity.weights, riskParity.converged, riskParity.iterations,
      riskParity.converged
        ? 'Equal-risk-contribution распределяет доли риска по выборочной ковариации; ожидаемые доходности не используются.'
        : 'Solver equal-risk-contribution не достиг критерия сходимости; результат не следует показывать как готовую диагностику.',
    ),
    note: `${status}: расчёт использует ${aligned.rows.length} общих дневных доходностей ${aligned.series.length} активов по совпадающим интервалам наблюдения (${base.from} → ${base.to}). Это сценарная диагностика риска, не персональная рекомендация по сделкам.`,
  }
}
