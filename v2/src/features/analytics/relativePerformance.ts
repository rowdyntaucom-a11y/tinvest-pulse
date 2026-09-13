import type { AnalyticsHistoryPoint } from './metrics'

export const RELATIVE_PERFORMANCE_CALC_VERSION = '1.2' as const

export type RelativePerformance = {
  calcVersion: typeof RELATIVE_PERFORMANCE_CALC_VERSION
  available: boolean
  status: 'invalid_history' | 'insufficient_history' | 'preview' | 'mature'
  integrity: 'OK' | 'CONFLICT'
  overlapPoints: number
  pairedReturns: number
  minimumReturns: number
  matureReturns: number
  periodDays: number
  sampleFrom: string | null
  sampleTo: string | null
  duplicateRowsCollapsed: number
  conflictingDates: number
  portfolioReturn: number | null
  benchmarkReturn: number | null
  excessReturn: number | null
  trackingError: number | null
  informationRatio: number | null
  beta: number | null
  correlation: number | null
  note: string
}

const MIN_RELATIVE_RETURNS = 60
const MATURE_RELATIVE_RETURNS = 252

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length

function sampleVariance(values: number[]) {
  if (values.length < 2) return null
  const avg = mean(values)
  return values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1)
}

function sampleCovariance(a: number[], b: number[]) {
  if (a.length !== b.length || a.length < 2) return null
  const avgA = mean(a)
  const avgB = mean(b)
  let sum = 0
  for (let i = 0; i < a.length; i += 1) sum += (a[i] - avgA) * (b[i] - avgB)
  return sum / (a.length - 1)
}

type OverlapPoint = { date: string; portfolio: number; imoex: number }

type OverlapIntegrity = {
  points: OverlapPoint[]
  duplicateRowsCollapsed: number
  conflictingDates: number
}

function overlap(history: AnalyticsHistoryPoint[]): OverlapIntegrity {
  const byDate = new Map<string, OverlapPoint>()
  const conflictDates = new Set<string>()
  let duplicateRowsCollapsed = 0

  for (const point of history) {
    if (!(typeof point.portfolio === 'number' && Number.isFinite(point.portfolio) && point.portfolio > 0
      && typeof point.imoex === 'number' && Number.isFinite(point.imoex) && point.imoex > 0)) continue

    const candidate = { date: point.date, portfolio: point.portfolio, imoex: point.imoex }
    const existing = byDate.get(candidate.date)
    if (!existing) {
      byDate.set(candidate.date, candidate)
      continue
    }

    if (existing.portfolio === candidate.portfolio && existing.imoex === candidate.imoex) {
      duplicateRowsCollapsed += 1
      continue
    }

    conflictDates.add(candidate.date)
  }

  return {
    points: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
    duplicateRowsCollapsed,
    conflictingDates: conflictDates.size,
  }
}

export function calculateRelativePerformance(history: AnalyticsHistoryPoint[]): RelativePerformance {
  const overlapResult = overlap(history)
  const points = overlapResult.points
  const hasConflict = overlapResult.conflictingDates > 0
  const portfolioReturns: number[] = []
  const benchmarkReturns: number[] = []

  if (!hasConflict) {
    for (let i = 1; i < points.length; i += 1) {
      const previous = points[i - 1]
      const current = points[i]
      const portfolioReturn = current.portfolio / previous.portfolio - 1
      const benchmarkReturn = current.imoex / previous.imoex - 1
      if (!Number.isFinite(portfolioReturn) || !Number.isFinite(benchmarkReturn)) continue
      portfolioReturns.push(portfolioReturn)
      benchmarkReturns.push(benchmarkReturn)
    }
  }

  const first = hasConflict ? null : points[0]
  const last = hasConflict ? null : points.at(-1)
  const portfolioReturn = first && last ? last.portfolio / first.portfolio - 1 : null
  const benchmarkReturn = first && last ? last.imoex / first.imoex - 1 : null
  const excessReturn = portfolioReturn != null && benchmarkReturn != null ? portfolioReturn - benchmarkReturn : null
  const firstDate = first?.date ? new Date(first.date) : null
  const lastDate = last?.date ? new Date(last.date) : null
  const periodDays = firstDate && lastDate ? Math.max(0, Math.round((lastDate.getTime() - firstDate.getTime()) / 86_400_000)) : 0

  const sufficient = !hasConflict && portfolioReturns.length >= MIN_RELATIVE_RETURNS
  let trackingError: number | null = null
  let informationRatio: number | null = null
  let beta: number | null = null
  let correlation: number | null = null

  if (sufficient) {
    const active = portfolioReturns.map((value, index) => value - benchmarkReturns[index])
    const activeVariance = sampleVariance(active)
    const benchmarkVariance = sampleVariance(benchmarkReturns)
    const portfolioVariance = sampleVariance(portfolioReturns)
    const covariance = sampleCovariance(portfolioReturns, benchmarkReturns)
    const activeStdev = activeVariance == null ? null : Math.sqrt(Math.max(0, activeVariance))

    if (activeStdev != null) {
      trackingError = activeStdev * Math.sqrt(252)
      if (activeStdev > 0) informationRatio = (mean(active) / activeStdev) * Math.sqrt(252)
    }
    if (covariance != null && benchmarkVariance != null && benchmarkVariance > 0) beta = covariance / benchmarkVariance
    if (covariance != null && benchmarkVariance != null && benchmarkVariance > 0 && portfolioVariance != null && portfolioVariance > 0) {
      correlation = covariance / Math.sqrt(benchmarkVariance * portfolioVariance)
    }
  }

  const mature = !hasConflict && portfolioReturns.length >= MATURE_RELATIVE_RETURNS
  const available = !hasConflict && points.length >= 2

  return {
    calcVersion: RELATIVE_PERFORMANCE_CALC_VERSION,
    available,
    status: hasConflict ? 'invalid_history' : sufficient ? (mature ? 'mature' : 'preview') : 'insufficient_history',
    integrity: hasConflict ? 'CONFLICT' : 'OK',
    overlapPoints: points.length,
    pairedReturns: portfolioReturns.length,
    minimumReturns: MIN_RELATIVE_RETURNS,
    matureReturns: MATURE_RELATIVE_RETURNS,
    periodDays,
    sampleFrom: first?.date ?? null,
    sampleTo: last?.date ?? null,
    duplicateRowsCollapsed: overlapResult.duplicateRowsCollapsed,
    conflictingDates: overlapResult.conflictingDates,
    portfolioReturn,
    benchmarkReturn,
    excessReturn,
    trackingError,
    informationRatio,
    beta,
    correlation,
    note: hasConflict
      ? `История неоднозначна: ${overlapResult.conflictingDates} дат содержат разные значения TWR/IMOEX. Относительные метрики скрыты до устранения конфликта.`
      : !available
        ? 'Для сравнения нужны совпадающие точки TWR портфеля и IMOEX.'
        : sufficient
          ? mature
            ? `Относительные коэффициенты рассчитаны по ${portfolioReturns.length} парным дневным доходностям.`
            : `Предварительная выборка: ${portfolioReturns.length} парных дневных доходностей. Для зрелой оценки QVANIX ждёт ${MATURE_RELATIVE_RETURNS}.`
          : `Периодную доходность сравнивать можно, но Tracking Error / Information Ratio / Beta / корреляция скрыты до ${MIN_RELATIVE_RETURNS} парных дневных доходностей. Сейчас ${portfolioReturns.length}.`,
  }
}
