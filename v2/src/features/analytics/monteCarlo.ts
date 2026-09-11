import type { AnalyticsHistoryPoint } from './metrics'

export type MonteCarloPercentiles = {
  p10: number
  median: number
  p90: number
}

export type MonteCarloResult = {
  available: boolean
  status: 'insufficient_history' | 'preview' | 'mature'
  method: 'historical_daily_return_bootstrap_v1'
  historyReturns: number
  minimumReturns: number
  matureReturns: number
  horizonTradingDays: number
  simulations: number
  terminalReturn: MonteCarloPercentiles | null
  terminalValue: MonteCarloPercentiles | null
  note: string
}

const MIN_BOOTSTRAP_RETURNS = 60
const MATURE_BOOTSTRAP_RETURNS = 252
const DEFAULT_HORIZON_DAYS = 252
const DEFAULT_SIMULATIONS = 2000

function validIndex(history: AnalyticsHistoryPoint[]) {
  return history
    .map(point => ({ date: point.date, value: point.portfolio }))
    .filter((point): point is { date: string; value: number } => typeof point.value === 'number' && Number.isFinite(point.value) && point.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

function dailyReturns(history: AnalyticsHistoryPoint[]) {
  const index = validIndex(history)
  const values: number[] = []
  for (let i = 1; i < index.length; i += 1) {
    const prior = index[i - 1].value
    const current = index[i].value
    if (prior <= 0 || current <= 0) continue
    const value = current / prior - 1
    if (Number.isFinite(value) && value > -0.5 && value < 0.5) values.push(value)
  }
  return values
}

function hashSeed(values: number[], horizon: number, simulations: number) {
  let hash = 2166136261 >>> 0
  const source = `${values.map(value => value.toFixed(8)).join('|')}|${horizon}|${simulations}`
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  return hash || 0x9e3779b9
}

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function percentile(sorted: number[], q: number) {
  if (!sorted.length) return 0
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return sorted[lower]
  const weight = position - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

export function calculateMonteCarlo(
  history: AnalyticsHistoryPoint[],
  currentPortfolioValue: number,
  horizonTradingDays = DEFAULT_HORIZON_DAYS,
  simulations = DEFAULT_SIMULATIONS,
): MonteCarloResult {
  const returns = dailyReturns(history)
  const base = {
    method: 'historical_daily_return_bootstrap_v1' as const,
    historyReturns: returns.length,
    minimumReturns: MIN_BOOTSTRAP_RETURNS,
    matureReturns: MATURE_BOOTSTRAP_RETURNS,
    horizonTradingDays,
    simulations,
  }

  if (returns.length < MIN_BOOTSTRAP_RETURNS || !Number.isFinite(currentPortfolioValue) || currentPortfolioValue <= 0) {
    return {
      ...base,
      available: false,
      status: 'insufficient_history',
      terminalReturn: null,
      terminalValue: null,
      note: `Нужно минимум ${MIN_BOOTSTRAP_RETURNS} дневных доходностей TWR. Сейчас доступно ${returns.length}. QVANIX не строит прогноз из слишком короткой выборки.`,
    }
  }

  const rng = mulberry32(hashSeed(returns, horizonTradingDays, simulations))
  const terminalFactors = new Array<number>(simulations)

  for (let path = 0; path < simulations; path += 1) {
    let factor = 1
    for (let day = 0; day < horizonTradingDays; day += 1) {
      const sampleIndex = Math.min(returns.length - 1, Math.floor(rng() * returns.length))
      factor *= 1 + returns[sampleIndex]
    }
    terminalFactors[path] = factor
  }

  terminalFactors.sort((a, b) => a - b)
  const factors: MonteCarloPercentiles = {
    p10: percentile(terminalFactors, 0.10),
    median: percentile(terminalFactors, 0.50),
    p90: percentile(terminalFactors, 0.90),
  }

  const terminalReturn: MonteCarloPercentiles = {
    p10: factors.p10 - 1,
    median: factors.median - 1,
    p90: factors.p90 - 1,
  }
  const terminalValue: MonteCarloPercentiles = {
    p10: currentPortfolioValue * factors.p10,
    median: currentPortfolioValue * factors.median,
    p90: currentPortfolioValue * factors.p90,
  }
  const mature = returns.length >= MATURE_BOOTSTRAP_RETURNS

  return {
    ...base,
    available: true,
    status: mature ? 'mature' : 'preview',
    terminalReturn,
    terminalValue,
    note: mature
      ? 'Bootstrap случайно пересобирает 12 месяцев из фактических дневных TWR-доходностей. Будущие пополнения и снятия не моделируются.'
      : `Предварительная модель: ${returns.length} дневных доходностей. Для зрелой оценки QVANIX ждёт не менее ${MATURE_BOOTSTRAP_RETURNS}. Будущие пополнения и снятия не моделируются.`,
  }
}
