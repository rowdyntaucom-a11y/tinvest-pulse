import type { AnalyticsHistoryPoint } from './metrics'

export const MONTE_CARLO_CALC_VERSION = '2.1' as const

export type MonteCarloPercentiles = {
  p10: number
  median: number
  p90: number
}

export type MonteCarloResult = {
  calcVersion: typeof MONTE_CARLO_CALC_VERSION
  available: boolean
  status: 'insufficient_history' | 'preview' | 'mature'
  method: 'historical_block_bootstrap_v2'
  historyReturns: number
  excludedReturns: number
  duplicateRowsCollapsed: number
  conflictingDates: number
  sampleFrom: string | null
  sampleTo: string | null
  minimumReturns: number
  matureReturns: number
  blockTradingDays: number
  horizonTradingDays: number
  simulations: number
  terminalReturn: MonteCarloPercentiles | null
  terminalValue: MonteCarloPercentiles | null
  note: string
}

const MIN_BOOTSTRAP_RETURNS = 60
const MATURE_BOOTSTRAP_RETURNS = 252
const DEFAULT_BLOCK_DAYS = 5
const DEFAULT_HORIZON_DAYS = 252
const DEFAULT_SIMULATIONS = 2000

function normalizedIndex(history: AnalyticsHistoryPoint[]) {
  const candidates = history
    .map(point => ({ date: point.date, value: point.portfolio }))
    .filter((point): point is { date: string; value: number } => Boolean(point.date) && typeof point.value === 'number' && Number.isFinite(point.value) && point.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  const byDate = new Map<string, number>()
  const conflicts = new Set<string>()
  let duplicateRowsCollapsed = 0

  for (const point of candidates) {
    const existing = byDate.get(point.date)
    if (existing == null) {
      byDate.set(point.date, point.value)
      continue
    }
    if (existing === point.value) {
      duplicateRowsCollapsed += 1
      continue
    }
    conflicts.add(point.date)
  }

  if (conflicts.size) {
    return {
      index: [] as Array<{ date: string; value: number }>,
      duplicateRowsCollapsed,
      conflictingDates: conflicts.size,
    }
  }

  return {
    index: [...byDate.entries()].map(([date, value]) => ({ date, value })),
    duplicateRowsCollapsed,
    conflictingDates: 0,
  }
}

function dailyReturns(history: AnalyticsHistoryPoint[]) {
  const normalized = normalizedIndex(history)
  const index = normalized.index
  const values: number[] = []
  let excludedReturns = 0

  for (let i = 1; i < index.length; i += 1) {
    const prior = index[i - 1].value
    const current = index[i].value
    if (prior <= 0 || current <= 0) continue
    const value = current / prior - 1
    if (!Number.isFinite(value)) continue
    // Monte Carlo v2 deliberately excludes extreme one-day observations from
    // the bootstrap sample. Unlike historical tail risk, this is an explicit
    // model rule and the exclusion count is surfaced in every result.
    if (value <= -0.5 || value >= 0.5) {
      excludedReturns += 1
      continue
    }
    values.push(value)
  }

  return {
    values,
    excludedReturns,
    duplicateRowsCollapsed: normalized.duplicateRowsCollapsed,
    conflictingDates: normalized.conflictingDates,
    sampleFrom: index[0]?.date ?? null,
    sampleTo: index.at(-1)?.date ?? null,
  }
}

function hashSeed(values: number[], horizon: number, simulations: number, blockDays: number) {
  let hash = 2166136261 >>> 0
  const source = `${values.map(value => value.toFixed(8)).join('|')}|${horizon}|${simulations}|${blockDays}`
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

function positiveInteger(value: number, fallback: number, max: number) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.min(max, Math.floor(value)))
}

export function calculateMonteCarlo(
  history: AnalyticsHistoryPoint[],
  currentPortfolioValue: number,
  horizonTradingDays = DEFAULT_HORIZON_DAYS,
  simulations = DEFAULT_SIMULATIONS,
  blockTradingDays = DEFAULT_BLOCK_DAYS,
): MonteCarloResult {
  const sample = dailyReturns(history)
  const returns = sample.values
  const horizon = positiveInteger(horizonTradingDays, DEFAULT_HORIZON_DAYS, 2520)
  const paths = positiveInteger(simulations, DEFAULT_SIMULATIONS, 100_000)
  const blockDays = positiveInteger(blockTradingDays, DEFAULT_BLOCK_DAYS, 20)
  const base = {
    calcVersion: MONTE_CARLO_CALC_VERSION,
    method: 'historical_block_bootstrap_v2' as const,
    historyReturns: returns.length,
    excludedReturns: sample.excludedReturns,
    duplicateRowsCollapsed: sample.duplicateRowsCollapsed,
    conflictingDates: sample.conflictingDates,
    sampleFrom: sample.sampleFrom,
    sampleTo: sample.sampleTo,
    minimumReturns: MIN_BOOTSTRAP_RETURNS,
    matureReturns: MATURE_BOOTSTRAP_RETURNS,
    blockTradingDays: blockDays,
    horizonTradingDays: horizon,
    simulations: paths,
  }

  if (sample.conflictingDates > 0) {
    return {
      ...base,
      available: false,
      status: 'insufficient_history',
      terminalReturn: null,
      terminalValue: null,
      note: `История содержит ${sample.conflictingDates} дат(ы) с конфликтующими значениями TWR-индекса. Monte Carlo fail-closed: сценарное распределение не строится, пока одна дата не имеет единственного подтверждённого значения.`,
    }
  }

  if (returns.length < MIN_BOOTSTRAP_RETURNS || !Number.isFinite(currentPortfolioValue) || currentPortfolioValue <= 0) {
    return {
      ...base,
      available: false,
      status: 'insufficient_history',
      terminalReturn: null,
      terminalValue: null,
      note: `Нужно минимум ${MIN_BOOTSTRAP_RETURNS} валидных дневных доходностей TWR. Сейчас доступно ${returns.length}.${sample.excludedReturns ? ` Исключено экстремальных наблюдений: ${sample.excludedReturns}.` : ''}${sample.duplicateRowsCollapsed ? ` Совпадающих дублей дат свёрнуто: ${sample.duplicateRowsCollapsed}.` : ''} QVANIX не строит сценарное распределение из слишком короткой выборки.`,
    }
  }

  const rng = mulberry32(hashSeed(returns, horizon, paths, blockDays))
  const terminalFactors = new Array<number>(paths)

  for (let path = 0; path < paths; path += 1) {
    let factor = 1
    let day = 0

    while (day < horizon) {
      const blockLength = Math.min(blockDays, horizon - day, returns.length)
      const maxStart = Math.max(1, returns.length - blockLength + 1)
      const startIndex = Math.min(maxStart - 1, Math.floor(rng() * maxStart))

      for (let offset = 0; offset < blockLength; offset += 1) {
        factor *= 1 + returns[startIndex + offset]
      }
      day += blockLength
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
  const integritySuffix = [
    sample.excludedReturns ? `Исключено экстремальных дневных наблюдений: ${sample.excludedReturns}.` : '',
    sample.duplicateRowsCollapsed ? `Совпадающих дублей дат свёрнуто: ${sample.duplicateRowsCollapsed}.` : '',
    sample.sampleFrom && sample.sampleTo ? `Выборка: ${sample.sampleFrom} → ${sample.sampleTo}.` : '',
  ].filter(Boolean).join(' ')

  return {
    ...base,
    available: true,
    status: mature ? 'mature' : 'preview',
    terminalReturn,
    terminalValue,
    note: mature
      ? `Block bootstrap пересобирает ${horizon} торговых дней из непрерывных ${blockDays}-дневных блоков фактических TWR-доходностей.${integritySuffix ? ` ${integritySuffix}` : ''} Будущие пополнения и снятия не моделируются.`
      : `Предварительная модель: ${returns.length} дневных доходностей, блок ${blockDays} торговых дней. Для зрелой оценки QVANIX ждёт не менее ${MATURE_BOOTSTRAP_RETURNS}.${integritySuffix ? ` ${integritySuffix}` : ''} Будущие пополнения и снятия не моделируются.`,
  }
}
