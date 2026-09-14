export const ACCESS_POLICY_VERSION = '1.0' as const
export const BASE_POSITION_LIMIT = 10 as const

export type ProductPlan = 'BASE' | 'PRO'

export type ProductCapability =
  | 'portfolio.current'
  | 'portfolio.structure'
  | 'portfolio.fullCoverage'
  | 'analytics.basicReturn'
  | 'analytics.healthBasic'
  | 'analytics.fullPerformance'
  | 'analytics.advancedRisk'
  | 'analytics.monteCarlo'
  | 'analytics.driftScenarios'
  | 'analytics.bondsAdvanced'
  | 'income.fact'
  | 'income.calendarPreview'
  | 'income.sourcesAdvanced'
  | 'income.taxTools'
  | 'terminal.indicators'
  | 'terminal.alerts'
  | 'terminal.screeners'
  | 'dna.basic'
  | 'dna.richWorld'
  | 'reports.advanced'

export type AccessPolicy = {
  version: typeof ACCESS_POLICY_VERSION
  plan: ProductPlan
  positionLimit: number | null
  capabilities: ReadonlySet<ProductCapability>
}

const BASE_CAPABILITIES = new Set<ProductCapability>([
  'portfolio.current',
  'portfolio.structure',
  'analytics.basicReturn',
  'analytics.healthBasic',
  'income.fact',
  'income.calendarPreview',
  'dna.basic',
])

const PRO_CAPABILITIES = new Set<ProductCapability>([
  ...BASE_CAPABILITIES,
  'portfolio.fullCoverage',
  'analytics.fullPerformance',
  'analytics.advancedRisk',
  'analytics.monteCarlo',
  'analytics.driftScenarios',
  'analytics.bondsAdvanced',
  'income.sourcesAdvanced',
  'income.taxTools',
  'terminal.indicators',
  'terminal.alerts',
  'terminal.screeners',
  'dna.richWorld',
  'reports.advanced',
])

export function getAccessPolicy(plan: ProductPlan): AccessPolicy {
  if (plan === 'PRO') {
    return {
      version: ACCESS_POLICY_VERSION,
      plan,
      positionLimit: null,
      capabilities: new Set(PRO_CAPABILITIES),
    }
  }

  return {
    version: ACCESS_POLICY_VERSION,
    plan: 'BASE',
    positionLimit: BASE_POSITION_LIMIT,
    capabilities: new Set(BASE_CAPABILITIES),
  }
}

export function canUseCapability(plan: ProductPlan, capability: ProductCapability) {
  return getAccessPolicy(plan).capabilities.has(capability)
}

export type PositionLimitState = {
  plan: ProductPlan
  totalPositions: number
  includedPositions: number
  excludedPositions: number
  limit: number | null
  fullCoverage: boolean
}

export function evaluatePositionLimit(plan: ProductPlan, totalPositions: number): PositionLimitState {
  const safeTotal = Number.isFinite(totalPositions) && totalPositions > 0 ? Math.floor(totalPositions) : 0
  const policy = getAccessPolicy(plan)
  const includedPositions = policy.positionLimit == null ? safeTotal : Math.min(safeTotal, policy.positionLimit)

  return {
    plan: policy.plan,
    totalPositions: safeTotal,
    includedPositions,
    excludedPositions: Math.max(0, safeTotal - includedPositions),
    limit: policy.positionLimit,
    fullCoverage: includedPositions === safeTotal,
  }
}

export type FullPortfolioMetricGate = {
  available: boolean
  reason: 'OK' | 'PLAN_POSITION_LIMIT'
  includedPositions: number
  totalPositions: number
}

export function gateFullPortfolioMetric(plan: ProductPlan, totalPositions: number): FullPortfolioMetricGate {
  const coverage = evaluatePositionLimit(plan, totalPositions)
  return {
    available: coverage.fullCoverage,
    reason: coverage.fullCoverage ? 'OK' : 'PLAN_POSITION_LIMIT',
    includedPositions: coverage.includedPositions,
    totalPositions: coverage.totalPositions,
  }
}
