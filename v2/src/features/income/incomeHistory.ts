import type { PayoutEvent } from '../../lib/payoutsApi'

export type RealizedIncomeKind = 'COUPON' | 'DIVIDEND' | 'OTHER'

export type IncomeHistoryMonth = {
  key: string
  totalNet: number
  couponsNet: number
  dividendsNet: number
  otherNet: number
  eventCount: number
}

export type IncomeHistoryYear = {
  year: number
  totalNet: number
  couponsNet: number
  dividendsNet: number
  otherNet: number
  eventCount: number
  monthsCovered: number
}

export type IncomeSourceConcentration = {
  totalNet: number
  hhi: number | null
  effectiveSources: number | null
  topSourceShare: number | null
  sourceCount: number
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

export function buildRealizedIncomeHistory(events: PayoutEvent[]) {
  const monthMap = new Map<string, IncomeHistoryMonth>()

  for (const event of events) {
    if (String(event.status || '').toUpperCase() !== 'FACT') continue
    const date = eventDate(event)
    if (!date) continue
    const net = finiteNonNegative(event.net)
    if (!(net > 0)) continue

    const key = date.slice(0, 7)
    const row = monthMap.get(key) ?? {
      key,
      totalNet: 0,
      couponsNet: 0,
      dividendsNet: 0,
      otherNet: 0,
      eventCount: 0,
    }

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
    }
    row.totalNet += month.totalNet
    row.couponsNet += month.couponsNet
    row.dividendsNet += month.dividendsNet
    row.otherNet += month.otherNet
    row.eventCount += month.eventCount
    row.monthsCovered += 1
    yearMap.set(year, row)
  }

  return { months, years: [...yearMap.values()].sort((a, b) => a.year - b.year) }
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
      comparableMonths: 0,
      available: false,
      note: 'Goal unavailable until the user provides a positive annual net-income target.',
    }
  }

  const completeYears = history.years.filter(year => year.monthsCovered === 12)
  const latestComplete = completeYears.at(-1) ?? null
  if (!latestComplete) {
    const comparableMonths = history.months.length
    return {
      targetAnnualNet: target,
      realizedAnnualNet: null,
      progress: null,
      comparableMonths,
      available: false,
      note: 'Goal progress is withheld until 12 realized calendar months are available; short history is not annualized.',
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
