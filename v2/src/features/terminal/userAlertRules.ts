import type { TechnicalSnapshot } from './technicalIndicators'

export const USER_ALERT_RULES_VERSION = '1.3' as const
export const USER_SCREENER_VERSION = '0.1' as const

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

export type UserScreenerMode = 'ALL' | 'ANY'

export type UserScreener = {
  id: string
  mode: UserScreenerMode
  rules: UserAlertRule[]
}

export type UserScreenerStatus = 'MATCH' | 'NO_MATCH' | 'INSUFFICIENT_DATA' | 'INVALID_CONFIG'

export type UserScreenerEvaluation = {
  version: typeof USER_SCREENER_VERSION
  screenerId: string
  mode: UserScreenerMode | null
  status: UserScreenerStatus
  matched: boolean
  matchedRules: number
  evaluatedRules: number
  rules: AlertEvaluation[]
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
const SCREENER_MODES: UserScreenerMode[] = ['ALL', 'ANY']
const MAX_SCREENER_RULES = 8

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
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

function metricValue(snapshot: TechnicalSnapshot | null | undefined, metric: AlertMetric): number | null {
  if (!snapshot || snapshot.integrity !== 'OK') return null
  const value = snapshot[metric]
  return validMetricDomain(metric, value) ? value : null
}

function validCrossingSequence(
  current: TechnicalSnapshot | null | undefined,
  previous: TechnicalSnapshot | null | undefined,
): boolean {
  if (!current || !previous) return false
  if (current.integrity !== 'OK' || previous.integrity !== 'OK') return false
  if (current.calcVersion !== previous.calcVersion) return false
  if (!validDate(current.sampleTo) || !validDate(previous.sampleTo)) return false
  return previous.sampleTo < current.sampleTo
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
      reason: 'Текущее значение метрики недоступно, вне допустимой области или входные данные имеют конфликт.',
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
      reason: 'Для проверки пересечения нужно предыдущее валидное значение той же метрики.',
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
      reason: 'Пересечение не вычислялось: нужен более ранний снимок той же версии расчёта.',
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

function validScreener(config: UserScreener): boolean {
  if (typeof config.id !== 'string' || !config.id.trim()) return false
  if (!SCREENER_MODES.includes(config.mode)) return false
  if (!Array.isArray(config.rules) || config.rules.length === 0 || config.rules.length > MAX_SCREENER_RULES) return false

  const ids = new Set<string>()
  for (const rule of config.rules) {
    if (!validRule(rule)) return false
    const id = rule.id.trim()
    if (ids.has(id)) return false
    ids.add(id)
  }
  return true
}

/**
 * Evaluates only conditions explicitly authored by the user. It does not rank assets,
 * generate recommendations, infer a strategy, or create buy/sell instructions.
 *
 * Fail-closed semantics:
 * - malformed config => INVALID_CONFIG;
 * - ALL: any known false rule is enough for NO_MATCH; otherwise missing data propagates;
 * - ANY: any known true rule is enough for MATCH; otherwise missing data propagates.
 */
export function evaluateUserScreener(
  config: UserScreener,
  current: TechnicalSnapshot | null | undefined,
  previous?: TechnicalSnapshot | null,
): UserScreenerEvaluation {
  if (!validScreener(config)) {
    return {
      version: USER_SCREENER_VERSION,
      screenerId: typeof config.id === 'string' ? config.id : '',
      mode: SCREENER_MODES.includes(config.mode) ? config.mode : null,
      status: 'INVALID_CONFIG',
      matched: false,
      matchedRules: 0,
      evaluatedRules: 0,
      rules: [],
      reason: 'Набор условий не прошёл валидацию и не вычислялся.',
    }
  }

  const rules = config.rules.map(rule => evaluateUserAlertRule(rule, current, previous))
  if (rules.some(rule => rule.status === 'INVALID_RULE')) {
    return {
      version: USER_SCREENER_VERSION,
      screenerId: config.id,
      mode: config.mode,
      status: 'INVALID_CONFIG',
      matched: false,
      matchedRules: 0,
      evaluatedRules: 0,
      rules: [],
      reason: 'Набор условий содержит невалидное правило.',
    }
  }

  const matchedRules = rules.filter(rule => rule.status === 'MATCH').length
  const hasMissing = rules.some(rule => rule.status === 'INSUFFICIENT_DATA')
  const hasNoMatch = rules.some(rule => rule.status === 'NO_MATCH')

  const status: UserScreenerStatus = config.mode === 'ALL'
    ? hasNoMatch
      ? 'NO_MATCH'
      : hasMissing
        ? 'INSUFFICIENT_DATA'
        : 'MATCH'
    : matchedRules > 0
      ? 'MATCH'
      : hasMissing
        ? 'INSUFFICIENT_DATA'
        : 'NO_MATCH'

  return {
    version: USER_SCREENER_VERSION,
    screenerId: config.id,
    mode: config.mode,
    status,
    matched: status === 'MATCH',
    matchedRules,
    evaluatedRules: rules.length,
    rules,
    reason: status === 'MATCH'
      ? 'Пользовательский набор условий выполнен.'
      : status === 'NO_MATCH'
        ? 'Пользовательский набор условий не выполнен.'
        : 'Для однозначной проверки пользовательского набора условий недостаточно данных.',
  }
}
