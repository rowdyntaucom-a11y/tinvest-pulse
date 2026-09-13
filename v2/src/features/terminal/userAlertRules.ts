import { TECHNICAL_INDICATORS_VERSION, type TechnicalSnapshot } from './technicalIndicators'

export const USER_ALERT_RULES_VERSION = '1.4' as const

export type AlertMetric =
  | 'sma20'
  | 'ema20'
  | 'rsi14'
  | 'atr14'
  | 'macd12_26'
  | 'macdSignal9'
  | 'macdHistogram'
  | 'bollingerMiddle20'
  | 'bollingerUpper20'
  | 'bollingerLower20'
  | 'stochasticK14'
  | 'stochasticD3'

export type AlertComparator = 'ABOVE' | 'BELOW' | 'CROSSES_ABOVE' | 'CROSSES_BELOW'

export type UserAlertRule = {
  id: string
  metric: AlertMetric
  comparator: AlertComparator
  threshold: number
}

export type AlertEvaluationStatus = 'MATCH' | 'NO_MATCH' | 'INSUFFICIENT_DATA' | 'INVALID_RULE'

export type AlertEvaluation = {
  version: typeof USER_ALERT_RULES_VERSION
  ruleId: string
  status: AlertEvaluationStatus
  matched: boolean
  currentValue: number | null
  previousValue: number | null
  threshold: number | null
  reason: string
}

const METRICS: AlertMetric[] = [
  'sma20',
  'ema20',
  'rsi14',
  'atr14',
  'macd12_26',
  'macdSignal9',
  'macdHistogram',
  'bollingerMiddle20',
  'bollingerUpper20',
  'bollingerLower20',
  'stochasticK14',
  'stochasticD3',
]

const COMPARATORS: AlertComparator[] = ['ABOVE', 'BELOW', 'CROSSES_ABOVE', 'CROSSES_BELOW']

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function nonNegativeInteger(value: unknown): value is number {
  return finite(value) && value >= 0 && Number.isInteger(value)
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function validMetricDomain(metric: AlertMetric, value: unknown): value is number {
  if (!finite(value)) return false

  if (metric === 'rsi14' || metric === 'stochasticK14' || metric === 'stochasticD3') {
    return value >= 0 && value <= 100
  }

  if (metric === 'atr14') return value >= 0

  if (
    metric === 'sma20'
    || metric === 'ema20'
    || metric === 'bollingerMiddle20'
    || metric === 'bollingerUpper20'
  ) {
    return value > 0
  }

  // Bollinger lower band can legitimately be zero or negative when the
  // trailing dispersion is large relative to its positive-price mean.
  // MACD line, signal and histogram are signed differences by definition.
  return true
}

function validThreshold(metric: AlertMetric, threshold: number): boolean {
  return validMetricDomain(metric, threshold)
}

function validRule(rule: UserAlertRule): boolean {
  return typeof rule.id === 'string'
    && rule.id.trim().length > 0
    && METRICS.includes(rule.metric)
    && COMPARATORS.includes(rule.comparator)
    && validThreshold(rule.metric, rule.threshold)
}

function cleanSnapshotProvenance(snapshot: TechnicalSnapshot | null | undefined): snapshot is TechnicalSnapshot {
  if (!snapshot || snapshot.integrity !== 'OK') return false
  if (snapshot.calcVersion !== TECHNICAL_INDICATORS_VERSION) return false
  if (!nonNegativeInteger(snapshot.inputRows)
    || !nonNegativeInteger(snapshot.invalidRowsDiscarded)
    || !nonNegativeInteger(snapshot.observations)
    || !nonNegativeInteger(snapshot.duplicateRowsCollapsed)
    || !nonNegativeInteger(snapshot.conflictingDates)) return false
  if (snapshot.invalidRowsDiscarded !== 0 || snapshot.conflictingDates !== 0) return false
  if (snapshot.inputRows !== snapshot.observations + snapshot.duplicateRowsCollapsed) return false
  if (snapshot.observations <= 0) return false
  if (!validDate(snapshot.sampleFrom) || !validDate(snapshot.sampleTo)) return false
  return snapshot.sampleFrom <= snapshot.sampleTo
}

function metricValue(snapshot: TechnicalSnapshot | null | undefined, metric: AlertMetric): number | null {
  if (!cleanSnapshotProvenance(snapshot)) return null
  const value = snapshot[metric]
  return validMetricDomain(metric, value) ? value : null
}

function validCrossingSequence(
  current: TechnicalSnapshot | null | undefined,
  previous: TechnicalSnapshot | null | undefined,
): boolean {
  if (!cleanSnapshotProvenance(current) || !cleanSnapshotProvenance(previous)) return false
  return previous.sampleTo! < current.sampleTo!
}

export function evaluateUserAlertRule(
  rule: UserAlertRule,
  current: TechnicalSnapshot | null | undefined,
  previous?: TechnicalSnapshot | null,
): AlertEvaluation {
  if (!validRule(rule)) {
    return {
      version: USER_ALERT_RULES_VERSION,
      ruleId: typeof rule.id === 'string' ? rule.id : '',
      status: 'INVALID_RULE',
      matched: false,
      currentValue: null,
      previousValue: null,
      threshold: finite(rule.threshold) ? rule.threshold : null,
      reason: 'Правило или порог метрики не прошли валидацию и не вычислялись.',
    }
  }

  const currentValue = metricValue(current, rule.metric)
  const previousValue = metricValue(previous, rule.metric)

  if (currentValue == null) {
    return {
      version: USER_ALERT_RULES_VERSION,
      ruleId: rule.id,
      status: 'INSUFFICIENT_DATA',
      matched: false,
      currentValue: null,
      previousValue,
      threshold: rule.threshold,
      reason: 'Текущее значение метрики недоступно, вне допустимой области или история не прошла строгую проверку качества.',
    }
  }

  const crossing = rule.comparator === 'CROSSES_ABOVE' || rule.comparator === 'CROSSES_BELOW'
  if (crossing && previousValue == null) {
    return {
      version: USER_ALERT_RULES_VERSION,
      ruleId: rule.id,
      status: 'INSUFFICIENT_DATA',
      matched: false,
      currentValue,
      previousValue: null,
      threshold: rule.threshold,
      reason: 'Для проверки пересечения нужно предыдущее чистое валидное значение той же метрики.',
    }
  }

  if (crossing && !validCrossingSequence(current, previous)) {
    return {
      version: USER_ALERT_RULES_VERSION,
      ruleId: rule.id,
      status: 'INSUFFICIENT_DATA',
      matched: false,
      currentValue,
      previousValue,
      threshold: rule.threshold,
      reason: 'Пересечение не вычислялось: нужны чистые снимки текущей версии в строгом временном порядке.',
    }
  }

  const matched = rule.comparator === 'ABOVE'
    ? currentValue > rule.threshold
    : rule.comparator === 'BELOW'
      ? currentValue < rule.threshold
      : rule.comparator === 'CROSSES_ABOVE'
        ? (previousValue as number) <= rule.threshold && currentValue > rule.threshold
        : (previousValue as number) >= rule.threshold && currentValue < rule.threshold

  return {
    version: USER_ALERT_RULES_VERSION,
    ruleId: rule.id,
    status: matched ? 'MATCH' : 'NO_MATCH',
    matched,
    currentValue,
    previousValue,
    threshold: rule.threshold,
    reason: matched
      ? 'Условие, заданное пользователем, выполнено.'
      : 'Условие, заданное пользователем, не выполнено.',
  }
}
