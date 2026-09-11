export type PayoutKind = 'COUPON' | 'DIVIDEND' | 'INCOME'

export type PayoutEvent = {
  kind: PayoutKind | string
  ticker: string
  name: string
  figi?: string | null
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
  integrity: {
    complete: boolean
    minimumCoverage: number
  }
  stale: boolean
  warning: string | null
  note: string | null
}

const emptyCalendar = (): PayoutCalendar => ({
  available: false,
  generatedAt: null,
  period: { from: null, to: null },
  basis: null,
  displayBasis: null,
  actual: { year: null, items: [], totalNet: 0, count: 0 },
  forecast: { gross: 0, tax: 0, net: 0, count: 0 },
  next: null,
  months: [],
  events: [],
  coverage: { eligibleAssets: 0, scheduledEvents: 0, resolvedAssets: 0, coverageRatio: 0, errors: [] },
  integrity: { complete: false, minimumCoverage: .95 },
  stale: false,
  warning: null,
  note: null,
})

const n = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function loadPayoutCalendar(): Promise<PayoutCalendar> {
  try {
    const response = await fetch('/api/payouts', { cache: 'no-store' })
    if (!response.ok) return emptyCalendar()
    const raw = await response.json() as Record<string, any>
    const actual = raw.actual ?? {}
    const forecast = raw.forecast ?? {}
    const coverage = raw.coverage ?? {}
    const integrity = raw.integrity ?? {}
    return {
      available: raw.available !== false,
      version: raw.version ? String(raw.version) : undefined,
      generatedAt: raw.generatedAt ? String(raw.generatedAt) : null,
      period: {
        from: raw.period?.from ? String(raw.period.from) : null,
        to: raw.period?.to ? String(raw.period.to) : null,
      },
      basis: raw.basis ? String(raw.basis) : null,
      displayBasis: raw.displayBasis ? String(raw.displayBasis) : null,
      actual: {
        year: actual.year == null ? null : n(actual.year),
        items: Array.isArray(actual.items) ? actual.items : [],
        totalNet: n(actual.totalNet),
        count: n(actual.count),
      },
      forecast: {
        gross: n(forecast.gross),
        tax: n(forecast.tax),
        net: n(forecast.net),
        count: n(forecast.count),
      },
      next: raw.next ?? null,
      months: Array.isArray(raw.months) ? raw.months : [],
      events: Array.isArray(raw.events) ? raw.events : [],
      coverage: {
        eligibleAssets: n(coverage.eligibleAssets),
        scheduledEvents: n(coverage.scheduledEvents),
        resolvedAssets: n(coverage.resolvedAssets),
        coverageRatio: n(coverage.coverageRatio),
        errors: Array.isArray(coverage.errors) ? coverage.errors : [],
      },
      integrity: {
        complete: Boolean(integrity.complete),
        minimumCoverage: n(integrity.minimumCoverage) || .95,
      },
      stale: Boolean(raw.stale),
      warning: raw.warning ? String(raw.warning) : null,
      note: raw.note ? String(raw.note) : null,
    }
  } catch {
    return emptyCalendar()
  }
}
