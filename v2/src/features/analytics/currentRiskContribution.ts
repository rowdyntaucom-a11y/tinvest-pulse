import type { RiskSeries } from './riskMatrix'

export const CURRENT_RISK_CONTRIBUTION_CALC_VERSION = '1.4' as const

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
  integrity: 'VALID' | 'CONFLICT'
  duplicateRowsCollapsed: number
  conflictingDates: number
  commonReturns: number
  sampleFrom: string | null
  sampleTo: string | null
  minimumReturns: number
  matureReturns: number
  assetCount: number
  coveredValue: number
  totalPortfolioValue: number
  coverageRatio: number | null
  annualizedVolatility: number | null
  diversificationRatio: number | null
  capitalHhi: number | null
  effectiveCapitalCount: number | null
  riskMagnitudeHhi: number | null
  effectiveRiskContributorCount: number | null
  topAbsoluteRiskShare: number | null
  rows: CurrentRiskContributionRow[]
  topAbsoluteContributor: CurrentRiskContributionRow | null
  reason: string | null
  note: string
}

const MIN_COMMON_RETURNS = 60
const MATURE_COMMON_RETURNS = 252
const TRADING_DAYS = 252
const EPS = 1e-12
const INTERVAL_SEPARATOR = '\u0000'

type SeriesIntervals = {
  returns: Map<string, number>
  duplicateRowsCollapsed: number
  conflictingDates: number
  integrity: 'VALID' | 'CONFLICT'
}

function returnIntervalMap(series: RiskSeries): SeriesIntervals {
  const byDate = new Map<string, number>()
  const conflictingDates = new Set<string>()
  let duplicateRowsCollapsed = 0

  for (const point of series.points) {
    if (!point.date || !Number.isFinite(point.value) || point.value <= 0) continue
    const existing = byDate.get(point.date)
    if (existing == null) {
      byDate.set(point.date, point.value)
      continue
    }
    if (Math.abs(existing - point.value) <= EPS) duplicateRowsCollapsed += 1
    else conflictingDates.add(point.date)
  }

  if (conflictingDates.size > 0) {
    return {
      returns: new Map(),
      duplicateRowsCollapsed,
      conflictingDates: conflictingDates.size,
      integrity: 'CONFLICT',
    }
  }

  const sorted = [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
  const map = new Map<string, number>()
  for (let i = 1; i < sorted.length; i += 1) {
    const prior = sorted[i - 1]
    const current = sorted[i]
    if (prior.date >= current.date) continue
    const value = current.value / prior.value - 1
    if (Number.isFinite(value) && value > -0.95 && value < 10) {
      map.set(`${prior.date}${INTERVAL_SEPARATOR}${current.date}`, value)
    }
  }

  return {
    returns: map,
    duplicateRowsCollapsed,
    conflictingDates: 0,
    integrity: 'VALID',
  }
}

function commonIntervalKeys(maps: Array<Map<string, number>>) {
  if (!maps.length) return [] as string[]
  return [...maps[0].keys()]
    .filter(key => maps.every(map => map.has(key)))
    .sort((a, b) => a.localeCompare(b))
}

function sampleBounds(intervalKeys: string[]) {
  const first = intervalKeys[0]?.split(INTERVAL_SEPARATOR)
  const last = intervalKeys.at(-1)?.split(INTERVAL_SEPARATOR)
  return {
    sampleFrom: first?.length === 2 ? first[0] : null,
    sampleTo: last?.length === 2 ? last[1] : null,
  }
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

function unavailableDepth() {
  return {
    diversificationRatio: null,
    capitalHhi: null,
    effectiveCapitalCount: null,
    riskMagnitudeHhi: null,
    effectiveRiskContributorCount: null,
    topAbsoluteRiskShare: null,
  }
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

  const intervalData = unique.size === series.length ? series.map(returnIntervalMap) : []
  const duplicateRowsCollapsed = intervalData.reduce((sum, item) => sum + item.duplicateRowsCollapsed, 0)
  const conflictingDates = intervalData.reduce((sum, item) => sum + item.conflictingDates, 0)
  const integrity: CurrentRiskContributionResult['integrity'] = conflictingDates > 0 ? 'CONFLICT' : 'VALID'
  const maps = integrity === 'VALID' ? intervalData.map(item => item.returns) : []
  const intervalKeys = maps.length ? commonIntervalKeys(maps) : []
  const rows = intervalKeys.map(key => maps.map(map => map.get(key)!))
  const bounds = sampleBounds(intervalKeys)
  const status: CurrentRiskContributionResult['status'] = rows.length >= MATURE_COMMON_RETURNS
    ? 'MATURE'
    : rows.length >= MIN_COMMON_RETURNS
      ? 'PREVIEW'
      : 'INSUFFICIENT_HISTORY'

  const base = {
    calcVersion: CURRENT_RISK_CONTRIBUTION_CALC_VERSION,
    status,
    integrity,
    duplicateRowsCollapsed,
    conflictingDates,
    commonReturns: rows.length,
    sampleFrom: bounds.sampleFrom,
    sampleTo: bounds.sampleTo,
    minimumReturns: MIN_COMMON_RETURNS,
    matureReturns: MATURE_COMMON_RETURNS,
    assetCount: series.length,
    coveredValue,
    totalPortfolioValue: total,
    coverageRatio,
  }

  if (integrity === 'CONFLICT') {
    return {
      ...base,
      available: false,
      annualizedVolatility: null,
      ...unavailableDepth(),
      rows: [],
      topAbsoluteContributor: null,
      reason: 'Conflicting same-day market-history values make the common risk sample ambiguous.',
      note: 'Current risk contribution fails closed when any included asset has conflicting prices for the same date.',
    }
  }

  if (series.length < 2 || unique.size !== series.length || rows.length < MIN_COMMON_RETURNS || coveredValue <= 0) {
    return {
      ...base,
      available: false,
      annualizedVolatility: null,
      ...unavailableDepth(),
      rows: [],
      topAbsoluteContributor: null,
      reason: unique.size !== series.length
        ? 'Duplicate series keys make current risk contribution ambiguous.'
        : `Need at least 2 matched assets and ${MIN_COMMON_RETURNS} common daily returns on identical observation intervals.`,
      note: 'Current risk contribution is withheld until a common, uniquely identified return-interval sample exists.',
    }
  }

  const matrix = covarianceMatrix(rows)
  if (!matrix || matrix.some(row => row.some(value => !Number.isFinite(value)))) {
    return {
      ...base,
      available: false,
      annualizedVolatility: null,
      ...unavailableDepth(),
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
      ...unavailableDepth(),
      rows: [],
      topAbsoluteContributor: null,
      reason: 'Portfolio variance is zero or not positive on the common sample.',
      note: 'Risk-contribution shares are undefined when common-sample portfolio variance is zero.',
    }
  }

  const annualizedPortfolioVolatility = Math.sqrt(portfolioVariance * TRADING_DAYS)
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

  const capitalHhi = weights.reduce((sum, weight) => sum + weight * weight, 0)
  const effectiveCapitalCount = capitalHhi > EPS ? 1 / capitalHhi : null

  const absoluteRisk = resultRows.map(row => Math.abs(row.riskContributionShare ?? 0))
  const absoluteRiskTotal = absoluteRisk.reduce((sum, value) => sum + value, 0)
  const normalizedAbsoluteRisk = absoluteRiskTotal > EPS
    ? absoluteRisk.map(value => value / absoluteRiskTotal)
    : []
  const riskMagnitudeHhi = normalizedAbsoluteRisk.length
    ? normalizedAbsoluteRisk.reduce((sum, share) => sum + share * share, 0)
    : null
  const effectiveRiskContributorCount = riskMagnitudeHhi != null && riskMagnitudeHhi > EPS
    ? 1 / riskMagnitudeHhi
    : null
  const topAbsoluteRiskShare = normalizedAbsoluteRisk.length
    ? Math.max(...normalizedAbsoluteRisk)
    : null

  const weightedStandaloneVolatility = resultRows.reduce(
    (sum, row) => sum + row.weight * row.annualizedVolatility,
    0,
  )
  const diversificationRatio = annualizedPortfolioVolatility > EPS
    ? weightedStandaloneVolatility / annualizedPortfolioVolatility
    : null

  return {
    ...base,
    available: true,
    annualizedVolatility: annualizedPortfolioVolatility,
    diversificationRatio,
    capitalHhi,
    effectiveCapitalCount,
    riskMagnitudeHhi,
    effectiveRiskContributorCount,
    topAbsoluteRiskShare,
    rows: resultRows,
    topAbsoluteContributor,
    reason: null,
    note: `${status}: current market-value weights on ${rows.length} common daily returns matched by identical observation intervals (${bounds.sampleFrom} → ${bounds.sampleTo}). Exact same-day duplicates collapsed: ${duplicateRowsCollapsed}. Signed contribution shares sum to portfolio variance; negative contribution can reflect diversification. Diversification ratio = weighted standalone volatility / portfolio volatility. Risk Nₑ = 1/HHI of normalized absolute contribution magnitudes. No expected-return assumption is used.`,
  }
}
