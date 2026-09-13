import type { TechnicalSnapshot } from './technicalIndicators'
import {
  evaluateUserAlertRule,
  type AlertEvaluation,
  type UserAlertRule,
} from './userAlertRules'

export const USER_SCREENER_VERSION = '1.0' as const
export const MAX_USER_SCREENER_RULES = 8 as const

export type UserScreenerMode = 'ALL' | 'ANY'

export type UserScreenerConfig = {
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
  matchedRuleIds: string[]
  rules: AlertEvaluation[]
  reason: string
}

const MODES: UserScreenerMode[] = ['ALL', 'ANY']

function invalidResult(config: UserScreenerConfig, reason: string): UserScreenerEvaluation {
  return {
    version: USER_SCREENER_VERSION,
    screenerId: typeof config.id === 'string' ? config.id : '',
    mode: MODES.includes(config.mode) ? config.mode : null,
    status: 'INVALID_CONFIG',
    matched: false,
    matchedRules: 0,
    evaluatedRules: 0,
    matchedRuleIds: [],
    rules: [],
    reason,
  }
}

function validContainer(config: UserScreenerConfig): boolean {
  if (typeof config.id !== 'string' || !config.id.trim()) return false
  if (!MODES.includes(config.mode)) return false
  if (!Array.isArray(config.rules) || config.rules.length === 0 || config.rules.length > MAX_USER_SCREENER_RULES) return false

  const ids = new Set<string>()
  for (const rule of config.rules) {
    if (!rule || typeof rule.id !== 'string' || !rule.id.trim()) return false
    const id = rule.id.trim()
    if (ids.has(id)) return false
    ids.add(id)
  }

  return true
}

/**
 * Evaluates only conditions explicitly authored by the user.
 *
 * This boundary does not rank instruments, generate candidates, infer strategy,
 * attach expected returns, create buy/sell recommendations, or submit orders.
 * Individual rule validity and market-data provenance remain owned by the
 * reviewed user-alert boundary.
 *
 * Missing-data semantics are deliberately logical rather than optimistic:
 * - ALL resolves NO_MATCH when any known rule is false; otherwise missing data propagates.
 * - ANY resolves MATCH when any known rule is true; otherwise missing data propagates.
 * - any invalid rule invalidates the whole screener configuration.
 */
export function evaluateUserScreener(
  config: UserScreenerConfig,
  current: TechnicalSnapshot | null | undefined,
  previous?: TechnicalSnapshot | null,
): UserScreenerEvaluation {
  if (!validContainer(config)) {
    return invalidResult(config, 'Набор пользовательских условий не прошёл проверку структуры и не вычислялся.')
  }

  const rules = config.rules.map(rule => evaluateUserAlertRule(rule, current, previous))
  if (rules.some(rule => rule.status === 'INVALID_RULE')) {
    return invalidResult(config, 'Набор пользовательских условий содержит невалидное правило и не вычислялся.')
  }

  const matchedRuleIds = rules
    .filter(rule => rule.status === 'MATCH')
    .map(rule => rule.ruleId)
  const matchedRules = matchedRuleIds.length
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
    matchedRuleIds,
    rules,
    reason: status === 'MATCH'
      ? 'Пользовательский набор условий выполнен.'
      : status === 'NO_MATCH'
        ? 'Пользовательский набор условий не выполнен.'
        : 'Для однозначной проверки пользовательского набора условий недостаточно валидных данных.',
  }
}
