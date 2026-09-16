import type { QualityInputs } from './xpEngine'

export type WorldQualityEligibility = {
  twr: boolean
  health: boolean
}

/**
 * Living World may stay navigable while broker data is unavailable, but financial quality
 * signals must remain fail-closed. Persistent XP/progression is intentionally separate.
 */
export function resolveWorldQualityInputs(
  values: Pick<QualityInputs, 'twr' | 'healthScore'>,
  eligibility: WorldQualityEligibility,
): QualityInputs {
  return {
    twr: eligibility.twr ? values.twr : null,
    healthScore: eligibility.health ? values.healthScore : null,
    contributionStreakMonths: null,
    passiveIncomeGrowth: null,
  }
}
