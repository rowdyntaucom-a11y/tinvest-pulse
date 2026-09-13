import {
  evaluateUserAlertRule,
  type AlertEvaluation,
  type UserAlertRule,
} from './userAlertRules'
import type { TechnicalSnapshot } from './technicalIndicators'

export const USER_SCREENER_VERSION = '0.1' as const
export const MAX_USER_SCREENER_RULES = 8

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

const MODES: UserScreenerMode[] = ['ALL', 'ANY']

function validRuleThroughAlertBoundary(rule: UserAlertRule): boolean {
  return evaluateUserAlertRule(rule, null).status !== 'INVALID_RULE'
}

function validConfig(config: UserScreener): boolean {
  if (typeof config.id !== 'string' || !config.id.trim()) return false
  if (!MODES.includes(config.mode)) return false
  if (!Array.isArray(config.rules) || config.rules.length === 0 || config.rules.length > MAX_USER_SCREENER_RULES) return false

  const ids = new Set<string>()
  for (const rule of config.rules) {
    if (!validRuleThroughAlertBoundary(rule)) return false
    const id = rule.id.trim()
    if (ids.has(id)) return false
    ids.add(id)
  }
  return true
}

/**
 * Evaluates only conditions explicitly authored by the user.
 *
 * The screener deliberately delegates every rule to the current alert-rule boundary, so metric
 * domains, technical-indicator version gates, OHLCV provenance checks and crossing chronology
 * cannot drift into a second implementation here.
 *
 * It does not rank assets, generate candidates, infer a strategy, recommend trades or execute
 * orders. ALL/ANY only aggregate the user's own deterministic conditions.
 */
export function evaluateUserScreener(
  config: UserScreener,
  current: TechnicalSnapshot | null | undefined,
  previous?: TechnicalSnapshot | null,
): UserScreenerEvaluation {
  if (!validConfig(config)) {
    return {
      version: USER_SCREENER_VERSION,
      screenerId: typeof config.id === 'string' ? config.id : '',
      mode: MODES.includes(config.mode) ? config.mode : null,
      status: 'INVALID_CONFIG',
      matched: false,
      matchedRules: 0,
      evaluatedRules: 0,
      rules: [],
      reason: 'Набор пользовательских условий не прошёл валидацию и не вычислялся.',
    }
  }

  const rules = config.rules.map(rule => evaluateUserAlertRule(rule, current, previous))
  const matchedRules = rules.filter(rule => rule.status === 'MATCH').length
  const hasMissing = rules.some(rule => rule.status === 'INSUFFICIENT_DATA')
  const hasNoMatch = rules.some(rule => rule.status === 'NO_MATCH')
  const hasInvalid = rules.some(rule => rule.status === 'INVALID_RULE')

  if (hasInvalid) {
    return {
      version: USER_SCREENER_VERSION,
      screenerId: config.id,
      mode: config.mode,
      status: 'INVALID_CONFIG',
      matched: false,
      matchedRules: 0,
      evaluatedRules: 0,
      rules: [],
      reason: 'После валидации обнаружено невалидное правило; набор не вычислялся.',
    }
  }

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
        : 'Для однозначной проверки пользовательского набора условий недостаточно чистых данных.',
  }
}
