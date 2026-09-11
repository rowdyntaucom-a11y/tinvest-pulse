import type { XpEvent, XpEventKind } from './xpEngine'

export type XpRuleConfig = {
  ruleVersion: string
  contributionHabitXp: number
  planAdherenceXp: number
  healthMilestoneXp: number
  performancePeriodXp: number
  passiveIncomeGrowthXp: number
}

export type PeriodRuleInput = {
  periodKey: string
  occurredAt: string
  qualifies: boolean
  sourceRef?: string | null
  note?: string | null
}

function cleanPositiveXp(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.round(value * 100) / 100
}

function safeIso(value: string) {
  const timestamp = Date.parse(String(value || ''))
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function stableEvent(
  kind: XpEventKind,
  namespace: string,
  input: PeriodRuleInput,
  awardedXp: number,
  ruleVersion: string,
): XpEvent | null {
  if (!input.qualifies) return null
  const periodKey = String(input.periodKey || '').trim()
  const occurredAt = safeIso(input.occurredAt)
  const xp = cleanPositiveXp(awardedXp)
  const version = String(ruleVersion || '').trim()
  if (!periodKey || !occurredAt || xp <= 0 || !version) return null

  return {
    id: `${namespace}:${periodKey}:${version}`,
    kind,
    occurredAt,
    awardedXp: xp,
    ruleVersion: version,
    sourceRef: input.sourceRef ?? null,
    note: input.note ?? null,
  }
}

/**
 * At most one event can exist for the same month + rule version because the event id is stable.
 * Deposit amount is intentionally absent from the input so large deposits cannot earn more XP.
 */
export function contributionHabitEvent(input: PeriodRuleInput, config: XpRuleConfig) {
  return stableEvent('CONTRIBUTION_HABIT', 'contribution-month', input, config.contributionHabitXp, config.ruleVersion)
}

/** Plan adherence rewards staying within the user's configured strategy band, never a buy/sell action. */
export function planAdherenceEvent(input: PeriodRuleInput, config: XpRuleConfig) {
  return stableEvent('PLAN_ADHERENCE', 'plan-period', input, config.planAdherenceXp, config.ruleVersion)
}

export function healthMilestoneEvent(input: PeriodRuleInput, config: XpRuleConfig) {
  return stableEvent('HEALTH_MILESTONE', 'health-milestone', input, config.healthMilestoneXp, config.ruleVersion)
}

export function performancePeriodEvent(input: PeriodRuleInput, config: XpRuleConfig) {
  return stableEvent('PERFORMANCE_PERIOD', 'performance-period', input, config.performancePeriodXp, config.ruleVersion)
}

export function passiveIncomeGrowthEvent(input: PeriodRuleInput, config: XpRuleConfig) {
  return stableEvent('PASSIVE_INCOME_GROWTH', 'income-growth-period', input, config.passiveIncomeGrowthXp, config.ruleVersion)
}

/**
 * Deliberately no default XP values here. Product weights stay explicit and versioned instead of
 * being hidden in the engine. A caller must supply a reviewed config before awards can be emitted.
 */
