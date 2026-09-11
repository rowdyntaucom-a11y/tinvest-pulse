import type { HistoryPoint, PositionSummary } from '../../lib/portfolioApi'

export const ANALYTICS_METHOD = 'pulse-health-v1.0'
export const TRADING_DAYS = 252

type Component = {
  key: 'diversification' | 'drawdown' | 'volatility' | 'assetClasses' | 'sharpe'
  label: string
  points: number | null
  maxPoints: number
  note: string
}

export type PortfolioAnalytics = {
  method: string
  sampleDays: number
  sampleQuality: 'insufficient' | 'early' | 'normal'
  maxDrawdown: number | null
  volatilityAnnual: number | null
  sharpe: number | null
  sortino: number | null
  hhi: number | null
  effectivePositions: number | null
  assetClassCount: number
  riskFreeRatePct: number | null
  healthScore: number | null
  healthCoverage: number
  components: Component[]
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const norm = (value: number, min: number, max: number) => clamp((value - min) / (max - min))

function stdev(values: number[]) {
  if (values.length < 2) return null
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(Math.max(0, variance))
}

function portfolioSeries(history: HistoryPoint[]) {
  return history
    .filter(point => finite(point.portfolio) && (point.portfolio as number) > 0)
    .map(point => ({ date: point.date, value: point.portfolio as number }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function dailyReturns(history: HistoryPoint[]) {
  const series = portfolioSeries(history)
  const result: number[] = []
  for (let index = 1; index < series.length; index += 1) {
    const previous = series[index - 1].value
    const current = series[index].value
    const value = current / previous - 1
    if (finite(value) && value > -0.95 && value < 5) result.push(value)
  }
  return result
}

function calcMaxDrawdown(history: HistoryPoint[]) {
  const series = portfolioSeries(history)
  if (series.length < 2) return null
  let peak = series[0].value
  let maxDrawdown = 0
  for (const point of series) {
    peak = Math.max(peak, point.value)
    if (peak <= 0) continue
    const drawdown = (peak - point.value) / peak
    maxDrawdown = Math.max(maxDrawdown, drawdown)
  }
  return maxDrawdown
}

function currentWeights(positions: PositionSummary[]) {
  const positive = positions.filter(position => finite(position.currentValue) && position.currentValue > 0)
  const total = positive.reduce((sum, position) => sum + position.currentValue, 0)
  if (total <= 0) return []
  return positive.map(position => position.currentValue / total)
}

function normaliseAssetClass(type: string) {
  const value = type.trim().toLowerCase()
  if (!value) return 'other'
  if (value.includes('bond')) return 'bond'
  if (value.includes('share') || value.includes('stock')) return 'share'
  if (value.includes('etf') || value.includes('fund')) return 'fund'
  if (value.includes('future')) return 'future'
  if (value.includes('currency')) return 'currency'
  return value
}

export function calculatePortfolioAnalytics(
  history: HistoryPoint[],
  positions: PositionSummary[],
  riskFreeRatePct: number | null,
): PortfolioAnalytics {
  const returns = dailyReturns(history)
  const sigmaDaily = stdev(returns)
  const volatilityAnnual = sigmaDaily == null ? null : sigmaDaily * Math.sqrt(TRADING_DAYS)
  const maxDrawdown = calcMaxDrawdown(history)

  const weights = currentWeights(positions)
  const hhi = weights.length ? weights.reduce((sum, weight) => sum + weight ** 2, 0) : null
  const effectivePositions = hhi && hhi > 0 ? 1 / hhi : null
  const assetClassCount = new Set(
    positions.filter(position => position.currentValue > 0).map(position => normaliseAssetClass(position.instrumentType)),
  ).size

  const rfAnnual = finite(riskFreeRatePct) ? Math.max(-0.99, riskFreeRatePct / 100) : null
  const rfDaily = rfAnnual == null ? null : (1 + rfAnnual) ** (1 / TRADING_DAYS) - 1
  const meanDaily = returns.length ? returns.reduce((sum, value) => sum + value, 0) / returns.length : null

  let sharpe: number | null = null
  let sortino: number | null = null
  if (meanDaily != null && rfDaily != null && sigmaDaily != null && sigmaDaily > 0) {
    sharpe = ((meanDaily - rfDaily) / sigmaDaily) * Math.sqrt(TRADING_DAYS)

    const downsideVariance = returns.reduce((sum, value) => {
      const shortfall = Math.min(0, value - rfDaily)
      return sum + shortfall ** 2
    }, 0) / Math.max(1, returns.length)
    const downsideDeviation = Math.sqrt(downsideVariance)
    if (downsideDeviation > 0) sortino = ((meanDaily - rfDaily) / downsideDeviation) * Math.sqrt(TRADING_DAYS)
  }

  const components: Component[] = [
    {
      key: 'diversification',
      label: 'Диверсификация',
      points: effectivePositions == null ? null : 25 * norm(effectivePositions, 1, 20),
      maxPoints: 25,
      note: effectivePositions == null ? 'Нет весов позиций' : `Эквивалент ${effectivePositions.toFixed(1)} равных позиций`,
    },
    {
      key: 'drawdown',
      label: 'Просадка',
      points: maxDrawdown == null ? null : 20 * (1 - norm(maxDrawdown, 0, 0.5)),
      maxPoints: 20,
      note: maxDrawdown == null ? 'Нужна история' : `Max DD ${(maxDrawdown * 100).toFixed(1)}%`,
    },
    {
      key: 'volatility',
      label: 'Волатильность',
      points: volatilityAnnual == null ? null : 20 * (1 - norm(volatilityAnnual, 0, 0.4)),
      maxPoints: 20,
      note: volatilityAnnual == null ? 'Нужна история' : `σ ${(volatilityAnnual * 100).toFixed(1)}% годовых`,
    },
    {
      key: 'assetClasses',
      label: 'Классы активов',
      points: assetClassCount ? 15 * norm(assetClassCount, 1, 5) : null,
      maxPoints: 15,
      note: assetClassCount ? `${assetClassCount} классов` : 'Нет классификации',
    },
    {
      key: 'sharpe',
      label: 'Sharpe',
      points: sharpe == null ? null : 20 * norm(sharpe, -1, 3),
      maxPoints: 20,
      note: sharpe == null ? 'Нужна история и ставка ЦБ' : `Sharpe ${sharpe.toFixed(2)}`,
    },
  ]

  const available = components.filter(component => component.points != null)
  const healthCoverage = available.reduce((sum, component) => sum + component.maxPoints, 0)
  const healthScore = healthCoverage === 100
    ? Math.round(available.reduce((sum, component) => sum + (component.points ?? 0), 0))
    : null

  const sampleDays = returns.length
  const sampleQuality = sampleDays < 20 ? 'insufficient' : sampleDays < 60 ? 'early' : 'normal'

  return {
    method: ANALYTICS_METHOD,
    sampleDays,
    sampleQuality,
    maxDrawdown,
    volatilityAnnual,
    sharpe,
    sortino,
    hhi,
    effectivePositions,
    assetClassCount,
    riskFreeRatePct: finite(riskFreeRatePct) ? riskFreeRatePct : null,
    healthScore,
    healthCoverage,
    components,
  }
}
