export type StressAssetClass = 'equity' | 'bond' | 'fund' | 'currency' | 'cash' | 'other'

export type HistoricalStressShock = {
  assetClass: StressAssetClass
  returnShock: number
  sourceLabel: string
  sourceUrl: string
  sourceDate: string
}

export type HistoricalStressScenario = {
  schemaVersion: '1.0'
  id: string
  label: string
  eventStart: string
  eventEnd: string
  methodology: 'historical-observed-return'
  shocks: HistoricalStressShock[]
}

export type StressExposure = {
  assetClass: StressAssetClass
  weight: number
}

export type StressScenarioValidation = {
  valid: boolean
  errors: string[]
}

export type StressScenarioResult = {
  scenarioId: string
  available: boolean
  coverage: number
  coveredImpact: number | null
  portfolioImpact: number | null
  uncoveredAssetClasses: StressAssetClass[]
  note: string
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const SCENARIO_ID_RE = /^[a-z0-9][a-z0-9._-]{2,79}$/

const finite = (value: number) => Number.isFinite(value)
const clampWeight = (value: number) => Math.max(0, value)

export function validateHistoricalStressScenario(scenario: HistoricalStressScenario): StressScenarioValidation {
  const errors: string[] = []

  if (scenario.schemaVersion !== '1.0') errors.push('unsupported schemaVersion')
  if (!SCENARIO_ID_RE.test(scenario.id)) errors.push('invalid scenario id')
  if (!scenario.label.trim()) errors.push('scenario label is required')
  if (scenario.methodology !== 'historical-observed-return') errors.push('unsupported methodology')
  if (!ISO_DATE_RE.test(scenario.eventStart) || !ISO_DATE_RE.test(scenario.eventEnd)) errors.push('event dates must be YYYY-MM-DD')
  if (scenario.eventStart > scenario.eventEnd) errors.push('eventStart must not be after eventEnd')
  if (!scenario.shocks.length) errors.push('at least one sourced shock is required')

  const seenClasses = new Set<StressAssetClass>()
  for (const shock of scenario.shocks) {
    if (seenClasses.has(shock.assetClass)) errors.push(`duplicate asset class shock: ${shock.assetClass}`)
    seenClasses.add(shock.assetClass)

    if (!finite(shock.returnShock) || shock.returnShock <= -1) {
      errors.push(`invalid return shock for ${shock.assetClass}`)
    }
    if (!shock.sourceLabel.trim()) errors.push(`missing source label for ${shock.assetClass}`)
    if (!/^https:\/\//i.test(shock.sourceUrl)) errors.push(`sourceUrl must be HTTPS for ${shock.assetClass}`)
    if (!ISO_DATE_RE.test(shock.sourceDate)) errors.push(`invalid source date for ${shock.assetClass}`)
  }

  return { valid: errors.length === 0, errors }
}

export function evaluateHistoricalStressScenario(
  exposures: StressExposure[],
  scenario: HistoricalStressScenario,
): StressScenarioResult {
  const validation = validateHistoricalStressScenario(scenario)
  if (!validation.valid) {
    return {
      scenarioId: scenario.id,
      available: false,
      coverage: 0,
      coveredImpact: null,
      portfolioImpact: null,
      uncoveredAssetClasses: [],
      note: `Scenario rejected: ${validation.errors.join('; ')}`,
    }
  }

  const positiveExposures = exposures
    .filter(item => finite(item.weight) && item.weight > 0)
    .map(item => ({ assetClass: item.assetClass, weight: clampWeight(item.weight) }))

  const totalWeight = positiveExposures.reduce((sum, item) => sum + item.weight, 0)
  if (!(totalWeight > 0)) {
    return {
      scenarioId: scenario.id,
      available: false,
      coverage: 0,
      coveredImpact: null,
      portfolioImpact: null,
      uncoveredAssetClasses: [],
      note: 'Scenario unavailable: portfolio asset-class exposures are missing.',
    }
  }

  const shockByClass = new Map(scenario.shocks.map(shock => [shock.assetClass, shock.returnShock]))
  let coveredWeight = 0
  let weightedImpact = 0
  const uncovered = new Set<StressAssetClass>()

  for (const exposure of positiveExposures) {
    const normalizedWeight = exposure.weight / totalWeight
    const shock = shockByClass.get(exposure.assetClass)
    if (shock == null) {
      uncovered.add(exposure.assetClass)
      continue
    }
    coveredWeight += normalizedWeight
    weightedImpact += normalizedWeight * shock
  }

  const coverage = Math.min(1, Math.max(0, coveredWeight))
  const fullyCovered = coverage >= 1 - 1e-9

  return {
    scenarioId: scenario.id,
    available: fullyCovered,
    coverage,
    coveredImpact: coveredWeight > 0 ? weightedImpact : null,
    portfolioImpact: fullyCovered ? weightedImpact : null,
    uncoveredAssetClasses: [...uncovered].sort(),
    note: fullyCovered
      ? 'Historical stress scenario, not a forecast. Result applies sourced historical class shocks to current asset-class weights.'
      : 'Partial coverage only. Whole-portfolio impact is withheld until every positive asset-class exposure has a sourced shock.',
  }
}

export function createHistoricalStressScenario(input: HistoricalStressScenario): HistoricalStressScenario {
  const validation = validateHistoricalStressScenario(input)
  if (!validation.valid) throw new Error(`Invalid historical stress scenario: ${validation.errors.join('; ')}`)

  return {
    ...input,
    shocks: input.shocks
      .map(shock => ({ ...shock }))
      .sort((a, b) => a.assetClass.localeCompare(b.assetClass)),
  }
}
