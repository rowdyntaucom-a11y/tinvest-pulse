import type { PayoutEvent, PayoutObservation } from '../../lib/payoutsApi'

export const INCOME_HISTORY_CALC_VERSION = '1.1' as const

export type RealizedIncomeKind = 'COUPON' | 'DIVIDEND' | 'OTHER'

export type IncomeHistoryMonth = {
  key: string
  totalNet: number
  couponsNet: number
  dividendsNet: number
  otherNet: number
  eventCount: number
  observed: boolean
  complete: boolean
  partial: boolean
}

export type IncomeHistoryYear = {
  year: number
  totalNet: number
  couponsNet: number
  dividendsNet: number
  otherNet: number
  eventCount: number
  monthsCovered: number
  payoutMonths: number
  partialMonths: number
}

export type IncomeObservationSummary = {
  available: boolean
  from: string | null
  to: string | null
  completeMonths: number
  partialMonths: number
  basis: string | null
}

export type IncomeSourceConcentration = {
  totalNet: number
  hhi: number | null
  effectiveSources: number | null
  topSourceShare: number | null
  sourceCount: number
}

export type IncomeStability = {
  available: boolean
  status: 'insufficient' | 'preview' | 'mature'
  observedMonths: number
  payoutMonths: number
  zeroIncomeMonths: number
  averageMonthlyNet: number | null
  largestMonthNet: number | null
  largestMonthShare: number | null
  coefficientOfVariation: number | null
  note: string
}

export type IncomeGoalProgress = {
  targetAnnualNet: number
  realizedAnnualNet: number | null
  progress: number | null
  comparableMonths: number
  available: boolean
  note: string
}

const finiteNonNegative = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

const realizedKind = (event: PayoutEvent): RealizedIncomeKind => {
  const kind = String(event.kind || '').trim().toUpperCase()
  if (kind === 'COUPON') return 'COUPON'
  if (kind === 'DIVIDEND') return 'DIVIDEND'
  return 'OTHER'
}

const eventDate = (event: PayoutEvent) => {
  const raw = String(event.date || '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null
}

const validMonthKeys = (values: string[] | undefined) => new Set(
  (Array.isArray(values) ? values : [])
    .map(value => String(value || '').slice(0, 7))
    .filter(value => /^\d{4}-\d{2}$/.test(value)),
)

const emptyMonth = (key: string): IncomeHistoryMonth => ({
  key,
  totalNet: 0,
  couponsNet: 0,
  dividendsNet: 0,
  otherNet: 0,
  eventCount: 0,
  observed: false,
  complete: false,
  partial: false,
})

export function buildRealizedIncomeHistory(events: PayoutEvent[], observation?: PayoutObservation | null) {
  const observationAvailable = observation?.available === true
  const completeMonths = observationAvailable ? validMonthKeys(observation?.completeMonths) : new Set<string>()
  const partialMonths = observationAvailable ? validMonthKeys(observation?.partialMonths) : new Set<string>()
  for (const key of completeMonths) partialMonths.delete(key)

  const monthMap = new Map<string, IncomeHistoryMonth>()
  for (const key of [...completeMonths, ...partialMonths]) {
    monthMap.set(key, {
      ...emptyMonth(key),
      observed: true,
      complete: completeMonths.has(key),
      partial: partialMonths.has(key),
    })
  }

  for (const event of events) {
    if (String(event.status || '').toUpperCase() !== 'FACT') continue
    const date = eventDate(event)
    if (!date) continue
    const net = finiteNonNegative(event.net)
    if (!(net > 0)) continue

    const key = date.slice(0, 7)
    const row = monthMap.get(key) ?? emptyMonth(key)
    row.totalNet += net
    row.eventCount += 1
    const kind = realizedKind(event)
    if (kind === 'COUPON') row.couponsNet += net
    else if (kind === 'DIVIDEND') row.dividendsNet += net
    else row.otherNet += net
    monthMap.set(key, row)
  }

  const months = [...monthMap.values()].sort((a, b) => a.key.localeCompare(b.key))
  const yearMap = new Map<number, IncomeHistoryYear>()

  for (const month of months) {
    const year = Number(month.key.slice(0, 4))
    const row = yearMap.get(year) ?? {
      year,
      totalNet: 0,
      couponsNet: 0,
      dividendsNet: 0,
      otherNet: 0,
      eventCount: 0,
      monthsCovered: 0,
      payoutMonths: 0,
      partialMonths: 0,
    }
    row.totalNet += month.totalNet
    row.couponsNet += month.couponsNet
    row.dividendsNet += month.dividendsNet
    row.otherNet += month.otherNet
    row.eventCount += month.eventCount
    if (month.complete) row.monthsCovered += 1
    if (month.totalNet > 0) row.payoutMonths += 1
    if (month.partial) row.partialMonths += 1
    yearMap.set(year, row)
  }

  const observationSummary: IncomeObservationSummary = {
    available: observationAvailable,
    from: observation?.from ?? null,
    to: observation?.to ?? null,
    completeMonths: completeMonths.size,
    partialMonths: partialMonths.size,
    basis: observation?.basis ?? null,
  }

  return {
    version: INCOME_HISTORY_CALC_VERSION,
    months,
    years: [...yearMap.values()].sort((a, b) => a.year - b.year),
    observation: observationSummary,
  }
}

export function calculateIncomeSourceConcentration(events: PayoutEvent[]): IncomeSourceConcentration {
  const totals = new Map<string, number>()

  for (const event of events) {
    if (String(event.status || '').toUpperCase() !== 'FACT') continue
    const net = finiteNonNegative(event.net)
    if (!(net > 0)) continue
    const source = String(event.ticker || event.name || '').trim().toUpperCase()
    if (!source) continue
    totals.set(source, (totals.get(source) ?? 0) + net)
  }

  const values = [...totals.values()].filter(value => value > 0)
  const totalNet = values.reduce((sum, value) => sum + value, 0)
  if (!(totalNet > 0)) {
    return { totalNet: 0, hhi: null, effectiveSources: null, topSourceShare: null, sourceCount: 0 }
  }

  const shares = values.map(value => value / totalNet)
  const hhi = shares.reduce((sum, share) => sum + share * share, 0)
  return {
    totalNet,
    hhi,
    effectiveSources: hhi > 0 ? 1 / hhi : null,
    topSourceShare: Math.max(...shares),
    sourceCount: values.length,
  }
}

export function calculateIncomeStability(
  history: ReturnType<typeof buildRealizedIncomeHistory>,
): IncomeStability {
  const observed = history.months.filter(month => month.complete)
  const observedMonths = observed.length
  const payoutMonths = observed.filter(month => month.totalNet > 0).length
  const zeroIncomeMonths = observedMonths - payoutMonths

  if (observedMonths < 3) {
    return {
      available: false,
      status: 'insufficient',
      observedMonths,
      payoutMonths,
      zeroIncomeMonths,
      averageMonthlyNet: null,
      largestMonthNet: null,
      largestMonthShare: null,
      coefficientOfVariation: null,
      note: 'Stability is withheld until at least 3 complete observed calendar months are available.',
    }
  }

  const values = observed.map(month => month.totalNet)
  const total = values.reduce((sum, value) => sum + value, 0)
  const mean = total / observedMonths
  const largest = Math.max(...values)
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / observedMonths
  const standardDeviation = Math.sqrt(variance)
  const status = observedMonths >= 12 ? 'mature' : 'preview'

  return {
    available: true,
    status,
    observedMonths,
    payoutMonths,
    zeroIncomeMonths,
    averageMonthlyNet: mean,
    largestMonthNet: largest,
    largestMonthShare: total > 0 ? largest / total : null,
    coefficientOfVariation: mean > 0 ? standardDeviation / mean : null,
    note: status === 'mature'
      ? 'Stability uses complete observed calendar months only; zero-income months are included.'
      : 'Preview stability uses complete observed months only and is not annualized.',
  }
}

export function calculateIncomeGoalProgress(
  history: ReturnType<typeof buildRealizedIncomeHistory>,
  targetAnnualNet: number,
): IncomeGoalProgress {
  const target = Number(targetAnnualNet)
  if (!Number.isFinite(target) || target <= 0) {
    return {
      targetAnnualNet: 0,
      realizedAnnualNet: null,
      progress: null,
      comparableMonths: history.observation.completeMonths,
      available: false,
      note: 'Goal unavailable until the user provides a positive annual net-income target.',
    }
  }

  const completeYears = history.years.filter(year => year.monthsCovered === 12)
  const latestComplete = completeYears.at(-1) ?? null
  if (!latestComplete) {
    return {
      targetAnnualNet: target,
      realizedAnnualNet: null,
      progress: null,
      comparableMonths: history.observation.completeMonths,
      available: false,
      note: 'Goal progress is withheld until 12 complete observed calendar months are available; missing or partial months are not treated as zero and short history is not annualized.',
    }
  }

  return {
    targetAnnualNet: target,
    realizedAnnualNet: latestComplete.totalNet,
    progress: Math.max(0, latestComplete.totalNet / target),
    comparableMonths: 12,
    available: true,
    note: `Progress uses realized net passive income for complete calendar year ${latestComplete.year}; no forecast or reinvestment assumption is applied.`,
  }
}
