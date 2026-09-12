import type { IncomeHistoryMonth } from './incomeHistory'

export const INCOME_COMPARABLES_CALC_VERSION = '1.1' as const

export type IncomeComparableKind = 'COUPON' | 'DIVIDEND' | 'OTHER' | 'TOTAL'

export type IncomeComparablePeriod = {
  calcVersion: typeof INCOME_COMPARABLES_CALC_VERSION
  available: boolean
  status: 'INSUFFICIENT' | 'PREVIEW' | 'MATURE'
  currentYear: number | null
  previousYear: number | null
  monthCount: number
  months: number[]
  currentNet: number | null
  previousNet: number | null
  changeNet: number | null
  changeRatio: number | null
  currentCouponsNet: number | null
  previousCouponsNet: number | null
  currentDividendsNet: number | null
  previousDividendsNet: number | null
  note: string
}

type ComparableBucket = {
  totalNet: number
  couponsNet: number
  dividendsNet: number
}

const parseMonthKey = (key: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(key || ''))
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null
  return { year, month }
}

const finiteNonNegative = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

const addMonth = (bucket: ComparableBucket, month: IncomeHistoryMonth) => {
  bucket.totalNet += finiteNonNegative(month.totalNet)
  bucket.couponsNet += finiteNonNegative(month.couponsNet)
  bucket.dividendsNet += finiteNonNegative(month.dividendsNet)
}

const emptyResult = (note: string, currentYear: number | null = null): IncomeComparablePeriod => ({
  calcVersion: INCOME_COMPARABLES_CALC_VERSION,
  available: false,
  status: 'INSUFFICIENT',
  currentYear,
  previousYear: currentYear == null ? null : currentYear - 1,
  monthCount: 0,
  months: [],
  currentNet: null,
  previousNet: null,
  changeNet: null,
  changeRatio: null,
  currentCouponsNet: null,
  previousCouponsNet: null,
  currentDividendsNet: null,
  previousDividendsNet: null,
  note,
})

/**
 * Compare realized passive income for the latest observed year against the exact
 * same complete calendar months of the preceding year.
 *
 * Partial/unobserved months are never treated as zero. The comparison stays
 * unavailable until at least three exact month pairs exist. Twelve matched
 * months is the only MATURE state. No annualization or forecast is applied.
 */
export function calculateIncomeComparablePeriod(months: IncomeHistoryMonth[]): IncomeComparablePeriod {
  const complete = months
    .filter(month => month.complete)
    .map(month => ({ month, parsed: parseMonthKey(month.key) }))
    .filter((item): item is { month: IncomeHistoryMonth; parsed: { year: number; month: number } } => item.parsed !== null)
    .sort((a, b) => a.month.key.localeCompare(b.month.key))

  const latest = complete.at(-1)
  if (!latest) return emptyResult('Comparable income is unavailable until complete observed calendar months exist.')

  const currentYear = latest.parsed.year
  const seen = new Set<string>()
  for (const item of complete) {
    if (seen.has(item.month.key)) {
      return emptyResult('Comparable income is unavailable because duplicate complete calendar months were supplied.', currentYear)
    }
    seen.add(item.month.key)
  }

  const previousYear = currentYear - 1
  const byYearMonth = new Map<string, IncomeHistoryMonth>()
  for (const item of complete) byYearMonth.set(`${item.parsed.year}-${String(item.parsed.month).padStart(2, '0')}`, item.month)

  const pairedMonths: number[] = []
  for (let month = 1; month <= 12; month += 1) {
    const suffix = String(month).padStart(2, '0')
    if (byYearMonth.has(`${currentYear}-${suffix}`) && byYearMonth.has(`${previousYear}-${suffix}`)) pairedMonths.push(month)
  }

  if (pairedMonths.length < 3) {
    return {
      ...emptyResult('Comparable income is withheld until at least 3 exact complete month pairs exist; short history is not annualized.', currentYear),
      monthCount: pairedMonths.length,
      months: pairedMonths,
    }
  }

  const current: ComparableBucket = { totalNet: 0, couponsNet: 0, dividendsNet: 0 }
  const previous: ComparableBucket = { totalNet: 0, couponsNet: 0, dividendsNet: 0 }

  for (const month of pairedMonths) {
    const suffix = String(month).padStart(2, '0')
    const currentMonth = byYearMonth.get(`${currentYear}-${suffix}`)
    const previousMonth = byYearMonth.get(`${previousYear}-${suffix}`)
    if (!currentMonth || !previousMonth) continue
    addMonth(current, currentMonth)
    addMonth(previous, previousMonth)
  }

  const changeNet = current.totalNet - previous.totalNet
  const changeRatio = previous.totalNet > 0 ? changeNet / previous.totalNet : null
  const status = pairedMonths.length === 12 ? 'MATURE' : 'PREVIEW'

  return {
    calcVersion: INCOME_COMPARABLES_CALC_VERSION,
    available: true,
    status,
    currentYear,
    previousYear,
    monthCount: pairedMonths.length,
    months: pairedMonths,
    currentNet: current.totalNet,
    previousNet: previous.totalNet,
    changeNet,
    changeRatio,
    currentCouponsNet: current.couponsNet,
    previousCouponsNet: previous.couponsNet,
    currentDividendsNet: current.dividendsNet,
    previousDividendsNet: previous.dividendsNet,
    note: status === 'MATURE'
      ? `Realized net income compares all 12 complete calendar months of ${currentYear} with the same months of ${previousYear}.`
      : `Preview compares only the same ${pairedMonths.length} complete calendar months of ${currentYear} and ${previousYear}; no annualization or forecast is applied.`,
  }
}
