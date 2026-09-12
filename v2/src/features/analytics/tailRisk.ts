import type { AnalyticsHistoryPoint } from './metrics'

export const TAIL_RISK_CALC_VERSION = '1.1' as const

export type TailRiskResult = {
  calcVersion: typeof TAIL_RISK_CALC_VERSION
  available: boolean
  status: 'insufficient_history' | 'preview' | 'mature'
  method: 'historical_daily_twr_var_cvar_v1'
  confidence: 0.95
  returns: number
  minimumReturns: number
  matureReturns: number
  var95Loss: number | null
  cvar95Loss: number | null
  worstDay: number | null
  downsideFrequency: number | null
  tailObservations: number
  note: string
}

const MIN_RETURNS = 126
const MATURE_RETURNS = 252

function portfolioReturns(history: AnalyticsHistoryPoint[]) {
  const index = history
    .map(point => ({ date: point.date, value: point.portfolio }))
    .filter((point): point is { date: string; value: number } => typeof point.value === 'number' && Number.isFinite(point.value) && point.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  const returns: number[] = []
  for (let i = 1; i < index.length; i += 1) {
    const prior = index[i - 1].value
    const current = index[i].value
    const value = current / prior - 1
    // Historical tail risk must retain every finite observed TWR return.
    // Data-quality anomalies belong in the data-quality layer, not in a silent
    // magnitude filter that could remove the very losses VaR/CVaR must measure.
    if (Number.isFinite(value)) returns.push(value)
  }
  return returns
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return null
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return sorted[lower]
  const weight = position - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

export function calculateTailRisk(history: AnalyticsHistoryPoint[]): TailRiskResult {
  const returns = portfolioReturns(history)
  const base = {
    calcVersion: TAIL_RISK_CALC_VERSION,
    method: 'historical_daily_twr_var_cvar_v1' as const,
    confidence: 0.95 as const,
    returns: returns.length,
    minimumReturns: MIN_RETURNS,
    matureReturns: MATURE_RETURNS,
  }

  if (returns.length < MIN_RETURNS) {
    return {
      ...base,
      available: false,
      status: 'insufficient_history',
      var95Loss: null,
      cvar95Loss: null,
      worstDay: returns.length ? Math.min(...returns) : null,
      downsideFrequency: returns.length ? returns.filter(value => value < 0).length / returns.length : null,
      tailObservations: 0,
      note: `Для исторических VaR/CVaR 95% QVANIX ждёт минимум ${MIN_RETURNS} дневных TWR-доходностей. Сейчас ${returns.length}.`,
    }
  }

  const sorted = [...returns].sort((a, b) => a - b)
  const q05 = quantile(sorted, 0.05)!
  const tail = sorted.filter(value => value <= q05)
  const tailMean = tail.reduce((sum, value) => sum + value, 0) / Math.max(1, tail.length)
  const mature = returns.length >= MATURE_RETURNS

  return {
    ...base,
    available: true,
    status: mature ? 'mature' : 'preview',
    var95Loss: Math.max(0, -q05),
    cvar95Loss: Math.max(0, -tailMean),
    worstDay: Math.min(...returns),
    downsideFrequency: returns.filter(value => value < 0).length / returns.length,
    tailObservations: tail.length,
    note: mature
      ? `Исторический однодневный VaR/CVaR 95% по фактическим дневным TWR-доходностям; в хвосте ${tail.length} наблюдений.`
      : `Предварительная оценка: ${returns.length} дневных TWR-доходностей и ${tail.length} наблюдений в худшем 5%-хвосте. Для зрелой оценки нужно ${MATURE_RETURNS}.`,
  }
}
