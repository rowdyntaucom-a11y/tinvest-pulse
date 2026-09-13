import type { TechnicalSnapshot } from './technicalIndicators'

export const USER_ALERT_RULES_VERSION = '1.0' as const

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

function validRule(rule: UserAlertRule): boolean {
  return typeof rule.id === 'string'
    && rule.id.trim().length > 0
    && METRICS.includes(rule.metric)
    && COMPARATORS.includes(rule.comparator)
    && finite(rule.threshold)
}

function metricValue(snapshot: TechnicalSnapshot | null | undefined, metric: AlertMetric): number | null {
  if (!snapshot || snapshot.integrity !== 'OK') return null
  const value = snapshot[metric]
  return finite(value) ? value : null
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
      reason: 'Правило не прошло валидацию и не вычислялось.',
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
      reason: 'Текущее значение метрики недоступно или входные данные имеют конфликт.',
    }
  }

  if ((rule.comparator === 'CROSSES_ABOVE' || rule.comparator === 'CROSSES_BELOW') && previousValue == null) {
    return {
      version: USER_ALERT_RULES_VERSION,
      ruleId: rule.id,
      status: 'INSUFFICIENT_DATA',
      matched: false,
      currentValue,
      previousValue: null,
      threshold: rule.threshold,
      reason: 'Для проверки пересечения нужно предыдущее валидное значение той же метрики.',
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
