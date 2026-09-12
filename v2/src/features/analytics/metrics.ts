export const PORTFOLIO_ANALYTICS_CALC_VERSION = '1.0' as const

export type AnalyticsPosition = {
  ticker: string
  name: string
  instrumentType: string
  currentValue: number
}

export type AnalyticsHistoryPoint = {
  date: string
  portfolio: number | null
  imoex: number | null
}

export type HealthComponent = {
  key: 'diversification' | 'drawdown' | 'volatility' | 'assetClasses' | 'sharpe'
  label: string
  weight: number
  normalized: number | null
  points: number | null
  note: string
}

export type PortfolioAnalytics = {
  calcVersion: typeof PORTFOLIO_ANALYTICS_CALC_VERSION
  available: boolean
  historyDays: number
  historyPoints: number
  twr: number | null
  maxDrawdown: number | null
  volatility: number | null
  sharpe: number | null
  sortino: number | null
  hhi: number | null
  effectivePositions: number | null
  assetClassCount: number
  healthScore: number | null
  healthVersion: '1.0'
  components: HealthComponent[]
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const norm = (value: number, min: number, max: number) => clamp01((value - min) / (max - min))
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length

const sampleStdev = (values: number[]) => {
  if (values.length < 2) return null
  const avg = mean(values)
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1)
  return Math.sqrt(Math.max(0, variance))
}

function validIndex(points: AnalyticsHistoryPoint[]) {
  return points
    .map(point => ({ date: point.date, value: point.portfolio }))
    .filter((point): point is { date: string; value: number } => typeof point.value === 'number' && Number.isFinite(point.value) && point.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

function dailyReturns(index: Array<{ date: string; value: number }>) {
  const returns: number[] = []
  for (let i = 1; i < index.length; i += 1) {
    const prior = index[i - 1].value
    const current = index[i].value
    if (prior > 0 && current > 0) returns.push(current / prior - 1)
  }
  return returns.filter(Number.isFinite)
}

function maxDrawdown(index: Array<{ date: string; value: number }>) {
  if (index.length < 2) return null
  let peak = index[0].value
  let worst = 0
  for (const point of index) {
    peak = Math.max(peak, point.value)
    if (peak <= 0) continue
    const drawdown = (peak - point.value) / peak
    worst = Math.max(worst, drawdown)
  }
  return worst
}

function concentration(positions: AnalyticsPosition[]) {
  const values = positions.map(position => Math.max(0, position.currentValue)).filter(value => value > 0)
  const total = values.reduce((sum, value) => sum + value, 0)
  if (total <= 0 || !values.length) return { hhi: null, effectivePositions: null }
  const hhi = values.reduce((sum, value) => {
    const weight = value / total
    return sum + weight * weight
  }, 0)
  return { hhi, effectivePositions: hhi > 0 ? 1 / hhi : null }
}

function cleanInstrumentType(value: string) {
  const type = String(value || '').trim().toLowerCase()
  if (!type) return 'unknown'
  if (type.includes('bond')) return 'bond'
  if (type.includes('share') || type.includes('stock')) return 'share'
  if (type.includes('etf') || type.includes('fund')) return 'fund'
  if (type.includes('currency')) return 'currency'
  if (type.includes('future')) return 'future'
  return type
}

export function calculatePortfolioAnalytics(
  history: AnalyticsHistoryPoint[],
  positions: AnalyticsPosition[],
  riskFreeAnnualPct: number | null,
): PortfolioAnalytics {
  const index = validIndex(history)
  const returns = dailyReturns(index)
  const firstDate = index[0]?.date ? new Date(index[0].date) : null
  const lastDate = index.at(-1)?.date ? new Date(index.at(-1)!.date) : null
  const historyDays = firstDate && lastDate ? Math.max(0, Math.round((lastDate.getTime() - firstDate.getTime()) / 86_400_000)) : 0

  const twr = index.length >= 2 ? index.at(-1)!.value / index[0].value - 1 : null
  const drawdown = maxDrawdown(index)
  const stdevDaily = sampleStdev(returns)
  const volatility = stdevDaily == null ? null : stdevDaily * Math.sqrt(252)

  const riskFreeAnnual = riskFreeAnnualPct != null && Number.isFinite(riskFreeAnnualPct) ? riskFreeAnnualPct / 100 : null
  const riskFreeDaily = riskFreeAnnual == null ? null : (1 + riskFreeAnnual) ** (1 / 252) - 1
  const avgDaily = returns.length ? mean(returns) : null

  let sharpe: number | null = null
  if (avgDaily != null && riskFreeDaily != null && stdevDaily != null && stdevDaily > 0) {
    sharpe = ((avgDaily - riskFreeDaily) / stdevDaily) * Math.sqrt(252)
  }

  let sortino: number | null = null
  if (avgDaily != null && riskFreeDaily != null && returns.length) {
    const downsideVariance = mean(returns.map(value => Math.min(0, value - riskFreeDaily) ** 2))
    const downsideAnnual = Math.sqrt(downsideVariance) * Math.sqrt(252)
    const excessAnnual = (avgDaily - riskFreeDaily) * 252
    if (downsideAnnual > 0) sortino = excessAnnual / downsideAnnual
  }

  const { hhi, effectivePositions } = concentration(positions)
  const classSet = new Set(positions.filter(position => position.currentValue > 0).map(position => cleanInstrumentType(position.instrumentType)).filter(type => type !== 'unknown'))
  const assetClassCount = classSet.size

  const componentDefs: Array<HealthComponent> = [
    {
      key: 'diversification', label: 'Диверсификация', weight: 0.25,
      normalized: effectivePositions == null ? null : norm(effectivePositions, 1, 20), points: null,
      note: effectivePositions == null ? 'Недостаточно данных' : `Эквивалент ${effectivePositions.toFixed(1)} равновзвешенных позиций`,
    },
    {
      key: 'drawdown', label: 'Просадка', weight: 0.20,
      normalized: drawdown == null ? null : 1 - norm(drawdown, 0, 0.50), points: null,
      note: drawdown == null ? 'Недостаточно истории' : `Максимальная просадка ${(drawdown * 100).toFixed(1)}%`,
    },
    {
      key: 'volatility', label: 'Волатильность', weight: 0.20,
      normalized: volatility == null ? null : 1 - norm(volatility, 0, 0.40), points: null,
      note: volatility == null ? 'Недостаточно истории' : `Годовая волатильность ${(volatility * 100).toFixed(1)}%`,
    },
    {
      key: 'assetClasses', label: 'Классы активов', weight: 0.15,
      normalized: assetClassCount ? norm(assetClassCount, 1, 5) : null, points: null,
      note: assetClassCount ? `${assetClassCount} классов активов` : 'Типы активов не определены',
    },
    {
      key: 'sharpe', label: 'Sharpe', weight: 0.20,
      normalized: sharpe == null ? null : norm(sharpe, -1, 3), points: null,
      note: sharpe == null ? 'Нужны история и безрисковая ставка' : `Sharpe ${sharpe.toFixed(2)}`,
    },
  ]

  const complete = componentDefs.every(component => component.normalized != null)
  const weighted = componentDefs.reduce((sum, component) => sum + (component.normalized == null ? 0 : component.normalized * component.weight), 0)
  const healthScore = complete ? 100 * weighted : null
  const components = componentDefs.map(component => ({
    ...component,
    points: component.normalized == null ? null : component.normalized * component.weight * 100,
  }))

  return {
    calcVersion: PORTFOLIO_ANALYTICS_CALC_VERSION,
    available: index.length >= 2 || positions.length > 0,
    historyDays,
    historyPoints: index.length,
    twr,
    maxDrawdown: drawdown,
    volatility,
    sharpe,
    sortino,
    hhi,
    effectivePositions,
    assetClassCount,
    healthScore,
    healthVersion: '1.0',
    components,
  }
}
