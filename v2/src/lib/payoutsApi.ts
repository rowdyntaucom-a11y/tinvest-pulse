export const PAYOUTS_NORMALIZATION_VERSION = '1.0' as const

export type PayoutKind = 'COUPON' | 'DIVIDEND' | 'INCOME'

export type PayoutEvent = {
  kind: PayoutKind | string
  ticker: string
  name: string
  figi?: string | null
  instrumentUid?: string | null
  couponNumber?: number | null
  scheduleId?: string | null
  date: string
  recordDate?: string | null
  lastBuyDate?: string | null
  quantity?: number
  perSecurity?: number
  currency?: string
  gross?: number | null
  tax?: number | null
  net?: number | null
  confidence?: 'HIGH' | 'MEDIUM' | string
  source?: string
  status?: 'FACT' | string
  days?: number
}

export type PayoutObservation = {
  available: boolean
  from: string | null
  to: string | null
  completeMonths: string[]
  partialMonths: string[]
  basis: string | null
}

export type PayoutMonth = {
  key: string
  year: number
  month: number
  gross: number
  tax: number
  net: number
  count: number
  items: PayoutEvent[]
}

export type PayoutCalendar = {
  available: boolean
  version?: string
  generatedAt: string | null
  period: { from: string | null; to: string | null }
  basis: string | null
  displayBasis: string | null
  actual: {
    year: number | null
    items: PayoutEvent[]
    totalNet: number
    count: number
    observation?: PayoutObservation
  }
  forecast: {
    gross: number
    tax: number
    net: number
    count: number
  }
  next: PayoutEvent | null
  months: PayoutMonth[]
  events: PayoutEvent[]
  coverage: {
    eligibleAssets: number
    scheduledEvents: number
    resolvedAssets: number
    coverageRatio: number
    errors: Array<{ ticker?: string; error?: string }>
  }
  identity?: {
    couponScheduleEvents: number
    couponScheduleIdentified: number
    couponScheduleCoverage: number
    basis: string | null
  }
  integrity: {
    complete: boolean
    minimumCoverage: number
  }
  stale: boolean
  warning: string | null
  note: string | null
}

const emptyObservation = (): PayoutObservation => ({
  available: false,
  from: null,
  to: null,
  completeMonths: [],
  partialMonths: [],
  basis: null,
})

const emptyCalendar = (): PayoutCalendar => ({
  available: false,
  generatedAt: null,
  period: { from: null, to: null },
  basis: null,
  displayBasis: null,
  actual: { year: null, items: [], totalNet: 0, count: 0, observation: emptyObservation() },
  forecast: { gross: 0, tax: 0, net: 0, count: 0 },
  next: null,
  months: [],
  events: [],
  coverage: { eligibleAssets: 0, scheduledEvents: 0, resolvedAssets: 0, coverageRatio: 0, errors: [] },
  identity: { couponScheduleEvents: 0, couponScheduleIdentified: 0, couponScheduleCoverage: 0, basis: null },
  integrity: { complete: false, minimumCoverage: .95 },
  stale: false,
  warning: null,
  note: null,
})

const finiteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.')
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>
    if ('units' in row) {
      const units = finiteNumber(row.units)
      const nano = row.nano == null ? 0 : finiteNumber(row.nano)
      if (units == null || nano == null) return null
      const parsed = units + nano / 1e9
      return Number.isFinite(parsed) ? parsed : null
    }
    if ('value' in row) return finiteNumber(row.value)
  }
  return null
}

const numberOrZero = (value: unknown) => finiteNumber(value) ?? 0

const nonNegativeInteger = (value: unknown) => {
  const parsed = finiteNumber(value)
  return parsed != null && parsed >= 0 && Number.isInteger(parsed) ? parsed : 0
}

const positiveIntegerOrNull = (value: unknown) => {
  const parsed = finiteNumber(value)
  return parsed != null && parsed > 0 && Number.isInteger(parsed) ? parsed : null
}

const ratio01 = (value: unknown, fallback = 0) => {
  const parsed = finiteNumber(value)
  return parsed != null && parsed >= 0 && parsed <= 1 ? parsed : fallback
}

const text = (value: unknown) => {
  if (value == null) return null
  const parsed = String(value).trim()
  return parsed || null
}

const dateOnly = (value: unknown) => {
  const raw = text(value)
  if (!raw) return null
  const day = raw.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  const timestamp = Date.parse(`${day}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString().slice(0, 10) === day ? day : null
}

const isoDate = (value: unknown) => {
  const raw = text(value)
  if (!raw || dateOnly(raw) == null) return null
  const timestamp = Date.parse(raw)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

const monthKey = (value: unknown) => {
  const raw = text(value)
  if (!raw) return null
  const key = raw.slice(0, 7)
  if (!/^\d{4}-\d{2}$/.test(key)) return null
  const month = Number(key.slice(5, 7))
  return month >= 1 && month <= 12 ? key : null
}

const monthKeys = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(monthKey).filter((key): key is string => key != null))].sort()
}

const optionalNumber = (value: unknown) => {
  const parsed = finiteNumber(value)
  return parsed == null ? undefined : parsed
}

const nullableNumber = (value: unknown) => finiteNumber(value)

const normalizeEvent = (value: unknown): PayoutEvent | null => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const date = isoDate(row.date)
  if (!date) return null

  const ticker = text(row.ticker)
  const name = text(row.name)
  const currency = text(row.currency)
  const confidence = text(row.confidence)
  const source = text(row.source)
  const status = text(row.status)

  return {
    kind: text(row.kind)?.toUpperCase() || '',
    ticker: ticker || name || '—',
    name: name || ticker || '—',
    figi: text(row.figi),
    instrumentUid: text(row.instrumentUid),
    couponNumber: positiveIntegerOrNull(row.couponNumber),
    scheduleId: text(row.scheduleId),
    date,
    recordDate: isoDate(row.recordDate),
    lastBuyDate: isoDate(row.lastBuyDate),
    quantity: optionalNumber(row.quantity),
    perSecurity: optionalNumber(row.perSecurity),
    currency: currency?.toUpperCase(),
    gross: nullableNumber(row.gross),
    tax: nullableNumber(row.tax),
    net: nullableNumber(row.net),
    confidence: confidence?.toUpperCase(),
    source: source || undefined,
    status: status?.toUpperCase(),
    days: optionalNumber(row.days),
  }
}

const normalizeEvents = (value: unknown) => Array.isArray(value)
  ? value.map(normalizeEvent).filter((event): event is PayoutEvent => event != null)
  : []

const normalizeMonth = (value: unknown): PayoutMonth | null => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const fromKey = monthKey(row.key)
  const year = finiteNumber(row.year)
  const month = finiteNumber(row.month)
  const fromParts = Number.isInteger(year) && Number.isInteger(month) && (month as number) >= 1 && (month as number) <= 12
    ? `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`
    : null
  const key = fromKey || fromParts
  if (!key) return null

  return {
    key,
    year: Number(key.slice(0, 4)),
    month: Number(key.slice(5, 7)),
    gross: numberOrZero(row.gross),
    tax: numberOrZero(row.tax),
    net: numberOrZero(row.net),
    count: nonNegativeInteger(row.count),
    items: normalizeEvents(row.items),
  }
}

const normalizeMonths = (value: unknown) => Array.isArray(value)
  ? value.map(normalizeMonth).filter((month): month is PayoutMonth => month != null).sort((a, b) => a.key.localeCompare(b.key))
  : []

const normalizeErrors = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const ticker = text(row.ticker)
    const error = text(row.error)
    return ticker || error ? [{ ...(ticker ? { ticker } : {}), ...(error ? { error } : {}) }] : []
  })
}

export async function loadPayoutCalendar(): Promise<PayoutCalendar> {
  try {
    const response = await fetch('/api/payouts', { cache: 'no-store' })
    if (!response.ok) return emptyCalendar()
    const raw = await response.json() as Record<string, any>
    const actual = raw.actual ?? {}
    const observation = actual.observation ?? {}
    const forecast = raw.forecast ?? {}
    const coverage = raw.coverage ?? {}
    const identity = raw.identity ?? {}
    const integrity = raw.integrity ?? {}
    const observationAvailable = observation.available === true

    return {
      available: raw.available !== false,
      version: text(raw.version) ?? undefined,
      generatedAt: isoDate(raw.generatedAt),
      period: {
        from: isoDate(raw.period?.from),
        to: isoDate(raw.period?.to),
      },
      basis: text(raw.basis),
      displayBasis: text(raw.displayBasis),
      actual: {
        year: positiveIntegerOrNull(actual.year),
        items: normalizeEvents(actual.items),
        totalNet: numberOrZero(actual.totalNet),
        count: nonNegativeInteger(actual.count),
        observation: {
          available: observationAvailable,
          from: observationAvailable ? isoDate(observation.from) : null,
          to: observationAvailable ? isoDate(observation.to) : null,
          completeMonths: observationAvailable ? monthKeys(observation.completeMonths) : [],
          partialMonths: observationAvailable ? monthKeys(observation.partialMonths) : [],
          basis: text(observation.basis),
        },
      },
      forecast: {
        gross: numberOrZero(forecast.gross),
        tax: numberOrZero(forecast.tax),
        net: numberOrZero(forecast.net),
        count: nonNegativeInteger(forecast.count),
      },
      next: normalizeEvent(raw.next),
      months: normalizeMonths(raw.months),
      events: normalizeEvents(raw.events),
      coverage: {
        eligibleAssets: nonNegativeInteger(coverage.eligibleAssets),
        scheduledEvents: nonNegativeInteger(coverage.scheduledEvents),
        resolvedAssets: nonNegativeInteger(coverage.resolvedAssets),
        coverageRatio: ratio01(coverage.coverageRatio),
        errors: normalizeErrors(coverage.errors),
      },
      identity: {
        couponScheduleEvents: nonNegativeInteger(identity.couponScheduleEvents),
        couponScheduleIdentified: nonNegativeInteger(identity.couponScheduleIdentified),
        couponScheduleCoverage: ratio01(identity.couponScheduleCoverage),
        basis: text(identity.basis),
      },
      integrity: {
        complete: integrity.complete === true,
        minimumCoverage: ratio01(integrity.minimumCoverage, .95),
      },
      stale: raw.stale === true,
      warning: text(raw.warning),
      note: text(raw.note),
    }
  } catch {
    return emptyCalendar()
  }
}
