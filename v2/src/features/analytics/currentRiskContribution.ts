import type { RiskSeries } from './riskMatrix'

export const CURRENT_RISK_CONTRIBUTION_CALC_VERSION = '1.0' as const

export type CurrentRiskSeriesInput = RiskSeries & {
  currentValue: number
}

export type CurrentRiskContributionRow = {
  key: string
  label: string
  currentValue: number
  weight: number
  annualizedVolatility: number
  riskContributionShare: number | null
}

export type CurrentRiskContributionResult = {
  calcVersion: typeof CURRENT_RISK_CONTRIBUTION_CALC_VERSION
  available: boolean
  status: 'INSUFFICIENT_HISTORY' | 'PREVIEW' | 'MATURE'
  commonReturns: number
  minimumReturns: number
  matureReturns: number
  assetCount: number
  coveredValue: number
  totalPortfolioValue: number
  coverageRatio: number | null
  annualizedVolatility: number | null
  rows: CurrentRiskContributionRow[]
  topAbsoluteContributor: CurrentRiskContributionRow | null
  reason: string | null
  note: string
}

const MIN_COMMON_RETURNS = 60
const MATURE_COMMON_RETURNS = 252
const TRADING_DAYS = 252
const EPS = 1e-12

function returnMap(series: RiskSeries) {
  const sorted = series.points
    .filter(point => point.date && Number.isFinite(point.value) && point.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  const map = new Map<string, number>()
  for (let i = 1; i < sorted.length; i += 1) {
    const prior = sorted[i - 1].value
    const current = sorted[i].value
    const value = current / prior - 1
    if (Number.isFinite(value) && value > -0.95 && value < 10) map.set(sorted[i].date, value)
  }
  return map
}

function covarianceMatrix(rows: number[][]) {
  if (rows.length < 2 || !rows[0]?.length) return null
  const n = rows[0].length
  const means = new Array<number>(n).fill(0)
  for (let column = 0; column < n; column += 1) {
    means[column] = rows.reduce((sum, row) => sum + row[column], 0) / rows.length
  }

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

export function calculateCurrentRiskContribution(
  input: CurrentRiskSeriesInput[],
  totalPortfolioValue: number,
): CurrentRiskContributionResult {
  const series = input.filter(item => item?.key && item?.label && Number.isFinite(item.currentValue) && item.currentValue > 0)
  const unique = new Set(series.map(item => item.key))
  const total = Number.isFinite(totalPortfolioValue) && totalPortfolioValue > 0 ? totalPortfolioValue : 0
  const coveredValue = series.reduce((sum, item) => sum + item.currentValue, 0)
  const coverageRatio = total > 0 ? Math.min(1, coveredValue / total) : null

  const maps = unique.size === series.length ? series.map(returnMap) : []
  const dates = maps.length
    ? [...maps[0].keys()].filter(date => maps.every(map => map.has(date))).sort((a, b) => a.localeCompare(b))
    : []
  const rows = dates.map(date => maps.map(map => map.get(date)!))
  const status: CurrentRiskContributionResult['status'] = rows.length >= MATURE_COMMON_RETURNS
    ? 'MATURE'
    : rows.length >= MIN_COMMON_RETURNS
      ? 'PREVIEW'
      : 'INSUFFICIENT_HISTORY'

  const base = {
    calcVersion: CURRENT_RISK_CONTRIBUTION_CALC_VERSION,
    status,
    commonReturns: rows.length,
    minimumReturns: MIN_COMMON_RETURNS,
    matureReturns: MATURE_COMMON_RETURNS,
    assetCount: series.length,
    coveredValue,
    totalPortfolioValue: total,
    coverageRatio,
  }

  if (series.length < 2 || unique.size !== series.length || rows.length < MIN_COMMON_RETURNS || coveredValue <= 0) {
    return {
      ...base,
      available: false,
      annualizedVolatility: null,
      rows: [],
      topAbsoluteContributor: null,
      reason: unique.size !== series.length
        ? 'Duplicate series keys make current risk contribution ambiguous.'
        : `Need at least 2 matched assets and ${MIN_COMMON_RETURNS} common daily returns.`,
      note: 'Current risk contribution is withheld until a common, uniquely identified return sample exists.',
    }
  }

  const matrix = covarianceMatrix(rows)
  if (!matrix || matrix.some(row => row.some(value => !Number.isFinite(value)))) {
    return {
      ...base,
      available: false,
      annualizedVolatility: null,
      rows: [],
      topAbsoluteContributor: null,
      reason: 'Covariance matrix contains invalid values.',
      note: 'Invalid covariance input fails closed.',
    }
  }

  const weights = series.map(item => item.currentValue / coveredValue)
  const marginal = matVec(matrix, weights)
  const portfolioVariance = weights.reduce((sum, weight, index) => sum + weight * marginal[index], 0)
  if (!Number.isFinite(portfolioVariance) || portfolioVariance <= EPS) {
    return {
      ...base,
      available: false,
      annualizedVolatility: portfolioVariance >= -EPS ? 0 : null,
      rows: [],
      topAbsoluteContributor: null,
      reason: 'Portfolio variance is zero or not positive on the common sample.',
      note: 'Risk-contribution shares are undefined when common-sample portfolio variance is zero.',
    }
  }

  const resultRows: CurrentRiskContributionRow[] = series.map((item, index) => ({
    key: item.key,
    label: item.label,
    currentValue: item.currentValue,
    weight: weights[index],
    annualizedVolatility: Math.sqrt(Math.max(0, matrix[index][index]) * TRADING_DAYS),
    riskContributionShare: weights[index] * marginal[index] / portfolioVariance,
  }))

  const topAbsoluteContributor = [...resultRows]
    .sort((a, b) => Math.abs(b.riskContributionShare ?? 0) - Math.abs(a.riskContributionShare ?? 0))[0] ?? null

  return {
    ...base,
    available: true,
    annualizedVolatility: Math.sqrt(portfolioVariance * TRADING_DAYS),
    rows: resultRows,
    topAbsoluteContributor,
    reason: null,
    note: `${status}: current market-value weights on ${rows.length} common daily returns. Signed contribution shares sum to portfolio variance; negative contribution can reflect diversification. No expected-return assumption is used.`,
  }
}
