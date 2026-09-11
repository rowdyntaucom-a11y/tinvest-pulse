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

export type RollingRiskResult = {
  version: '1.0'
  availableReturns: number
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

export function calculateRollingRisk(history: AnalyticsHistoryPoint[]): RollingRiskResult {
  const points = history
    .filter(point => typeof point.portfolio === 'number' && Number.isFinite(point.portfolio) && point.portfolio! > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  const windows = WINDOWS.map(tradingDays => {
    if (points.length < tradingDays + 1) {
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

    const slice = points.slice(-(tradingDays + 1))
    const values = slice.map(point => point.portfolio as number)
    const returns = values.slice(1).map((value, index) => value / values[index] - 1).filter(Number.isFinite)
    const stdev = sampleStdev(returns)
    const portfolioReturn = values.at(-1)! / values[0] - 1

    const benchmarkPairs = slice
      .filter((point): point is AnalyticsHistoryPoint & { imoex: number } => typeof point.imoex === 'number' && Number.isFinite(point.imoex) && point.imoex > 0)
    let benchmarkReturn: number | null = null
    let pairedBenchmarkReturns = 0
    if (benchmarkPairs.length >= tradingDays + 1) {
      const benchmarkValues = benchmarkPairs.slice(-(tradingDays + 1)).map(point => point.imoex)
      benchmarkReturn = benchmarkValues.at(-1)! / benchmarkValues[0] - 1
      pairedBenchmarkReturns = tradingDays
    }

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

  return {
    version: '1.0',
    availableReturns,
    windows,
    activeWindow,
    note: activeWindow
      ? `Автоматически выбран самый длинный доступный стандартный горизонт: ${activeWindow.tradingDays} торговых дней.`
      : `Для первого rolling-окна нужно минимум 21 значение TWR (20 дневных доходностей). Сейчас доступно ${points.length}.`,
  }
}
