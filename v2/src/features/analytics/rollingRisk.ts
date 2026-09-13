import type { AnalyticsHistoryPoint } from './metrics'

export type RollingWindowResult = {
  tradingDays: number
  available: boolean
  portfolioReturn: number | null
  benchmarkReturn: number | null
  excessReturn: number | null
  volatility: number | null
  maxDrawdown: number | null
  worstDay: number | null
  pairedBenchmarkReturns: number
}

export type RollingRiskIntegrityState = 'OK' | 'PORTFOLIO_CONFLICT' | 'BENCHMARK_CONFLICT' | 'BOTH_CONFLICT'

export type RollingRiskResult = {
  version: '1.1'
  availableReturns: number
  sampleFrom: string | null
  sampleTo: string | null
  duplicateRowsCollapsed: number
  portfolioConflictingDates: number
  benchmarkConflictingDates: number
  integrityState: RollingRiskIntegrityState
  windows: RollingWindowResult[]
  activeWindow: RollingWindowResult | null
  note: string
}

const WINDOWS = [20, 60, 120, 252] as const

function sampleStdev(values: number[]) {
  if (values.length < 2) return null
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(Math.max(0, variance))
}

function maxDrawdown(values: number[]) {
  if (values.length < 2) return null
  let peak = values[0]
  let worst = 0
  for (const value of values) {
    peak = Math.max(peak, value)
    if (peak > 0) worst = Math.max(worst, (peak - value) / peak)
  }
  return worst
}

type NormalizedPoint = {
  date: string
  portfolio: number
  imoex: number | null
}

type NormalizedHistory = {
  points: NormalizedPoint[]
  duplicateRowsCollapsed: number
  portfolioConflictingDates: number
  benchmarkConflictingDates: number
  integrityState: RollingRiskIntegrityState
}

function normalizeHistory(history: AnalyticsHistoryPoint[]): NormalizedHistory {
  const grouped = new Map<string, AnalyticsHistoryPoint[]>()

  for (const point of history) {
    const date = String(point.date || '').trim()
    if (!date || typeof point.portfolio !== 'number' || !Number.isFinite(point.portfolio) || point.portfolio <= 0) continue
    const rows = grouped.get(date) ?? []
    rows.push(point)
    grouped.set(date, rows)
  }

  let duplicateRowsCollapsed = 0
  let portfolioConflictingDates = 0
  let benchmarkConflictingDates = 0
  const points: NormalizedPoint[] = []

  for (const [date, rows] of grouped.entries()) {
    duplicateRowsCollapsed += Math.max(0, rows.length - 1)

    const portfolioValues = [...new Set(rows.map(row => row.portfolio as number))]
    const benchmarkValues = [...new Set(rows
      .map(row => row.imoex)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0))]

    const portfolioConflict = portfolioValues.length !== 1
    const benchmarkConflict = benchmarkValues.length > 1
    if (portfolioConflict) portfolioConflictingDates += 1
    if (benchmarkConflict) benchmarkConflictingDates += 1
    if (portfolioConflict) continue

    points.push({
      date,
      portfolio: portfolioValues[0],
      imoex: benchmarkConflict ? null : benchmarkValues.length === 1 ? benchmarkValues[0] : null,
    })
  }

  points.sort((a, b) => a.date.localeCompare(b.date))

  const integrityState: RollingRiskIntegrityState = portfolioConflictingDates > 0
    ? benchmarkConflictingDates > 0 ? 'BOTH_CONFLICT' : 'PORTFOLIO_CONFLICT'
    : benchmarkConflictingDates > 0 ? 'BENCHMARK_CONFLICT' : 'OK'

  return {
    points,
    duplicateRowsCollapsed,
    portfolioConflictingDates,
    benchmarkConflictingDates,
    integrityState,
  }
}

function unavailableWindow(tradingDays: number): RollingWindowResult {
  return {
    tradingDays,
    available: false,
    portfolioReturn: null,
    benchmarkReturn: null,
    excessReturn: null,
    volatility: null,
    maxDrawdown: null,
    worstDay: null,
    pairedBenchmarkReturns: 0,
  }
}

export function calculateRollingRisk(history: AnalyticsHistoryPoint[]): RollingRiskResult {
  const normalized = normalizeHistory(history)
  const points = normalized.points
  const portfolioConflict = normalized.portfolioConflictingDates > 0

  if (portfolioConflict) {
    return {
      version: '1.1',
      availableReturns: 0,
      sampleFrom: null,
      sampleTo: null,
      duplicateRowsCollapsed: normalized.duplicateRowsCollapsed,
      portfolioConflictingDates: normalized.portfolioConflictingDates,
      benchmarkConflictingDates: normalized.benchmarkConflictingDates,
      integrityState: normalized.integrityState,
      windows: WINDOWS.map(unavailableWindow),
      activeWindow: null,
      note: 'Rolling-метрики недоступны: в TWR-истории есть разные значения на одну и ту же дату.',
    }
  }

  const windows = WINDOWS.map(tradingDays => {
    if (points.length < tradingDays + 1) return unavailableWindow(tradingDays)

    const slice = points.slice(-(tradingDays + 1))
    const values = slice.map(point => point.portfolio)
    const returns = values.slice(1).map((value, index) => value / values[index] - 1).filter(Number.isFinite)
    const stdev = sampleStdev(returns)
    const portfolioReturn = values.at(-1)! / values[0] - 1

    let pairedBenchmarkReturns = 0
    for (let index = 1; index < slice.length; index += 1) {
      const prior = slice[index - 1].imoex
      const current = slice[index].imoex
      if (prior != null && current != null && prior > 0 && current > 0) pairedBenchmarkReturns += 1
    }

    const fullBenchmarkCoverage = pairedBenchmarkReturns === tradingDays
    const benchmarkReturn = fullBenchmarkCoverage
      ? slice.at(-1)!.imoex! / slice[0].imoex! - 1
      : null

    return {
      tradingDays,
      available: true,
      portfolioReturn,
      benchmarkReturn,
      excessReturn: benchmarkReturn == null ? null : portfolioReturn - benchmarkReturn,
      volatility: stdev == null ? null : stdev * Math.sqrt(252),
      maxDrawdown: maxDrawdown(values),
      worstDay: returns.length ? Math.min(...returns) : null,
      pairedBenchmarkReturns,
    }
  })

  const activeWindow = [...windows].reverse().find(window => window.available) ?? null
  const availableReturns = Math.max(0, points.length - 1)
  const sampleFrom = points[0]?.date ?? null
  const sampleTo = points.at(-1)?.date ?? null

  return {
    version: '1.1',
    availableReturns,
    sampleFrom,
    sampleTo,
    duplicateRowsCollapsed: normalized.duplicateRowsCollapsed,
    portfolioConflictingDates: normalized.portfolioConflictingDates,
    benchmarkConflictingDates: normalized.benchmarkConflictingDates,
    integrityState: normalized.integrityState,
    windows,
    activeWindow,
    note: activeWindow
      ? `Автоматически выбран самый длинный доступный стандартный горизонт: ${activeWindow.tradingDays} торговых дней.`
      : `Для первого rolling-окна нужно минимум 21 значение TWR (20 дневных доходностей). Сейчас доступно ${points.length}.`,
  }
}
