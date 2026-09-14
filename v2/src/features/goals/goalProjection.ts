export const GOAL_PROJECTION_VERSION = '1.0' as const

export type GoalProjectionInput = {
  currentCapital: number
  targetCapitalToday: number
  horizonYears: number
  monthlyContribution: number
  contributionGrowthAnnualPct: number
  inflationAnnualPct: number
  priceReturnAnnualPct: number
  incomeYieldAnnualPct: number
  reinvestIncome: boolean
  benchmarkReturnAnnualPct?: number | null
}

export type GoalProjectionPoint = {
  month: number
  year: number
  capital: number
  targetNominal: number
  realCapital: number
  cumulativeContributions: number
  cumulativeIncomePaidOut: number
  benchmarkCapital: number | null
}

export type GoalProjectionResult = {
  version: typeof GOAL_PROJECTION_VERSION
  available: boolean
  reason: string | null
  horizonMonths: number
  scenarioGoalReachedMonth: number | null
  scenarioGoalReachedYear: number | null
  finalCapital: number | null
  finalRealCapital: number | null
  finalTargetNominal: number | null
  finalProgress: number | null
  cumulativeContributions: number | null
  cumulativeIncomePaidOut: number | null
  finalBenchmarkCapital: number | null
  series: GoalProjectionPoint[]
  note: string
}

const EMPTY_NOTE = 'Сценарий рассчитывается только из явно заданных пользователем предпосылок. Это не прогноз и не гарантия результата.'

function finite(value: number) {
  return Number.isFinite(value)
}

function validRatePct(value: number, allowLargePositive = true) {
  if (!finite(value) || value <= -100) return false
  return allowLargePositive || value <= 100
}

function monthlyRateFromAnnualPct(value: number) {
  return Math.pow(1 + value / 100, 1 / 12) - 1
}

function fail(reason: string): GoalProjectionResult {
  return {
    version: GOAL_PROJECTION_VERSION,
    available: false,
    reason,
    horizonMonths: 0,
    scenarioGoalReachedMonth: null,
    scenarioGoalReachedYear: null,
    finalCapital: null,
    finalRealCapital: null,
    finalTargetNominal: null,
    finalProgress: null,
    cumulativeContributions: null,
    cumulativeIncomePaidOut: null,
    finalBenchmarkCapital: null,
    series: [],
    note: EMPTY_NOTE,
  }
}

export function calculateGoalProjection(input: GoalProjectionInput): GoalProjectionResult {
  if (!finite(input.currentCapital) || input.currentCapital < 0) return fail('Текущий капитал должен быть неотрицательным конечным числом.')
  if (!finite(input.targetCapitalToday) || input.targetCapitalToday <= 0) return fail('Цель в сегодняшних рублях должна быть положительным конечным числом.')
  if (!Number.isInteger(input.horizonYears) || input.horizonYears < 1 || input.horizonYears > 50) return fail('Горизонт должен быть целым числом от 1 до 50 лет.')
  if (!finite(input.monthlyContribution) || input.monthlyContribution < 0) return fail('Ежемесячное пополнение должно быть неотрицательным конечным числом.')
  if (!validRatePct(input.contributionGrowthAnnualPct)) return fail('Индексация пополнений должна быть больше −100%.')
  if (!validRatePct(input.inflationAnnualPct)) return fail('Инфляция должна быть больше −100%.')
  if (!validRatePct(input.priceReturnAnnualPct)) return fail('Изменение цены должно быть больше −100%.')
  if (!validRatePct(input.incomeYieldAnnualPct, false) || input.incomeYieldAnnualPct < 0) return fail('Доходность выплат должна быть в диапазоне 0–100% годовых.')
  if (input.benchmarkReturnAnnualPct != null && !validRatePct(input.benchmarkReturnAnnualPct)) return fail('Доходность индекса должна быть больше −100% или не задана.')

  const horizonMonths = input.horizonYears * 12
  const monthlyPriceReturn = monthlyRateFromAnnualPct(input.priceReturnAnnualPct)
  const monthlyIncomeYield = monthlyRateFromAnnualPct(input.incomeYieldAnnualPct)
  const monthlyInflation = monthlyRateFromAnnualPct(input.inflationAnnualPct)
  const monthlyContributionGrowth = monthlyRateFromAnnualPct(input.contributionGrowthAnnualPct)
  const monthlyBenchmarkReturn = input.benchmarkReturnAnnualPct == null
    ? null
    : monthlyRateFromAnnualPct(input.benchmarkReturnAnnualPct)

  let capital = input.currentCapital
  let benchmarkCapital = input.benchmarkReturnAnnualPct == null ? null : input.currentCapital
  let contribution = input.monthlyContribution
  let cumulativeContributions = 0
  let cumulativeIncomePaidOut = 0
  let targetNominal = input.targetCapitalToday
  let scenarioGoalReachedMonth: number | null = capital >= targetNominal ? 0 : null
  const series: GoalProjectionPoint[] = []

  for (let month = 1; month <= horizonMonths; month += 1) {
    capital *= 1 + monthlyPriceReturn
    const income = capital * monthlyIncomeYield
    if (input.reinvestIncome) capital += income
    else cumulativeIncomePaidOut += income

    capital += contribution
    cumulativeContributions += contribution

    if (benchmarkCapital != null && monthlyBenchmarkReturn != null) {
      benchmarkCapital *= 1 + monthlyBenchmarkReturn
      benchmarkCapital += contribution
    }

    targetNominal *= 1 + monthlyInflation

    if (scenarioGoalReachedMonth == null && capital >= targetNominal) scenarioGoalReachedMonth = month

    const realCapital = capital / Math.pow(1 + monthlyInflation, month)
    if (month % 12 === 0 || month === horizonMonths) {
      series.push({
        month,
        year: month / 12,
        capital,
        targetNominal,
        realCapital,
        cumulativeContributions,
        cumulativeIncomePaidOut,
        benchmarkCapital,
      })
    }

    contribution *= 1 + monthlyContributionGrowth
  }

  const inflationFactor = Math.pow(1 + monthlyInflation, horizonMonths)
  const finalRealCapital = capital / inflationFactor
  const finalProgress = targetNominal > 0 ? capital / targetNominal : null

  return {
    version: GOAL_PROJECTION_VERSION,
    available: true,
    reason: null,
    horizonMonths,
    scenarioGoalReachedMonth,
    scenarioGoalReachedYear: scenarioGoalReachedMonth == null ? null : scenarioGoalReachedMonth / 12,
    finalCapital: capital,
    finalRealCapital,
    finalTargetNominal: targetNominal,
    finalProgress,
    cumulativeContributions,
    cumulativeIncomePaidOut,
    finalBenchmarkCapital: benchmarkCapital,
    series,
    note: EMPTY_NOTE,
  }
}
