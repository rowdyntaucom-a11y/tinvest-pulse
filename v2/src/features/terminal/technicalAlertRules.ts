import type { TechnicalSnapshot } from './technicalIndicators'

export const TECHNICAL_ALERT_RULES_VERSION = '1.0' as const

export const TECHNICAL_ALERT_INDICATORS = [
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
] as const

export type TechnicalAlertIndicator = typeof TECHNICAL_ALERT_INDICATORS[number]
export type TechnicalAlertComparator = 'GT' | 'GTE' | 'LT' | 'LTE'

export type UserAuthoredTechnicalAlertRule = {
  id: string
  indicator: TechnicalAlertIndicator
  comparator: TechnicalAlertComparator
  threshold: number
}

export type TechnicalAlertEvaluationStatus =
  | 'TRIGGERED'
  | 'CLEAR'
  | 'DATA_UNAVAILABLE'
  | 'INTEGRITY_BLOCKED'
  | 'INVALID_RULE'
  | 'INVALID_SNAPSHOT'

export type TechnicalAlertEvaluation = {
  rulesVersion: typeof TECHNICAL_ALERT_RULES_VERSION
  ruleId: string | null
  indicator: string | null
  comparator: string | null
  threshold: number | null
  actualValue: number | null
  status: TechnicalAlertEvaluationStatus
  snapshotCalcVersion: string | null
  sampleTo: string | null
}

const INDICATORS = new Set<string>(TECHNICAL_ALERT_INDICATORS)
const COMPARATORS = new Set<string>(['GT', 'GTE', 'LT', 'LTE'])

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function text(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function snapshotProvenance(snapshot: TechnicalSnapshot) {
  return {
    snapshotCalcVersion: text(snapshot?.calcVersion),
    sampleTo: text(snapshot?.sampleTo),
  }
}

function invalidRuleEvaluation(snapshot: TechnicalSnapshot, rule: unknown): TechnicalAlertEvaluation {
  const candidate = rule && typeof rule === 'object' ? rule as Record<string, unknown> : {}
  return {
    rulesVersion: TECHNICAL_ALERT_RULES_VERSION,
    ruleId: text(candidate.id),
    indicator: text(candidate.indicator),
    comparator: text(candidate.comparator),
    threshold: finite(candidate.threshold) ? candidate.threshold : null,
    actualValue: null,
    status: 'INVALID_RULE',
    ...snapshotProvenance(snapshot),
  }
}

function compare(actual: number, comparator: TechnicalAlertComparator, threshold: number): boolean {
  if (comparator === 'GT') return actual > threshold
  if (comparator === 'GTE') return actual >= threshold
  if (comparator === 'LT') return actual < threshold
  return actual <= threshold
}

export function evaluateTechnicalAlertRule(
  snapshot: TechnicalSnapshot,
  rule: UserAuthoredTechnicalAlertRule,
): TechnicalAlertEvaluation {
  const candidate = rule as unknown as Record<string, unknown>
  const ruleId = text(candidate?.id)
  const indicator = text(candidate?.indicator)
  const comparator = text(candidate?.comparator)
  const threshold = candidate?.threshold

  if (
    ruleId == null
    || ruleId.trim().length === 0
    || ruleId.length > 128
    || indicator == null
    || !INDICATORS.has(indicator)
    || comparator == null
    || !COMPARATORS.has(comparator)
    || !finite(threshold)
  ) {
    return invalidRuleEvaluation(snapshot, rule)
  }

  const provenance = snapshotProvenance(snapshot)
  if (snapshot?.integrity === 'CONFLICT') {
    return {
      rulesVersion: TECHNICAL_ALERT_RULES_VERSION,
      ruleId,
      indicator,
      comparator,
      threshold,
      actualValue: null,
      status: 'INTEGRITY_BLOCKED',
      ...provenance,
    }
  }

  if (snapshot?.integrity !== 'OK') {
    return {
      rulesVersion: TECHNICAL_ALERT_RULES_VERSION,
      ruleId,
      indicator,
      comparator,
      threshold,
      actualValue: null,
      status: 'INVALID_SNAPSHOT',
      ...provenance,
    }
  }

  const actual = snapshot[indicator as TechnicalAlertIndicator]
  if (actual == null) {
    return {
      rulesVersion: TECHNICAL_ALERT_RULES_VERSION,
      ruleId,
      indicator,
      comparator,
      threshold,
      actualValue: null,
      status: 'DATA_UNAVAILABLE',
      ...provenance,
    }
  }

  if (!finite(actual)) {
    return {
      rulesVersion: TECHNICAL_ALERT_RULES_VERSION,
      ruleId,
      indicator,
      comparator,
      threshold,
      actualValue: null,
      status: 'INVALID_SNAPSHOT',
      ...provenance,
    }
  }

  return {
    rulesVersion: TECHNICAL_ALERT_RULES_VERSION,
    ruleId,
    indicator,
    comparator,
    threshold,
    actualValue: actual,
    status: compare(actual, comparator as TechnicalAlertComparator, threshold) ? 'TRIGGERED' : 'CLEAR',
    ...provenance,
  }
}

export function evaluateTechnicalAlertRules(
  snapshot: TechnicalSnapshot,
  rules: readonly UserAuthoredTechnicalAlertRule[],
): TechnicalAlertEvaluation[] {
  return rules.map(rule => evaluateTechnicalAlertRule(snapshot, rule))
}
