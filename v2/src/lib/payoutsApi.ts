export type PayoutEvent = {
  kind: 'COUPON' | 'DIVIDEND' | 'INCOME' | string
  ticker: string
  name: string
  date: string
  recordDate?: string | null
  lastBuyDate?: string | null
  quantity?: number
  perSecurity?: number
  gross?: number | null
  tax?: number | null
  net?: number | null
  taxRate?: number | null
  confidence?: 'HIGH' | 'MEDIUM' | string
  source?: string
  status?: 'FACT' | string
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

export type PayoutsSnapshot = {
  available: boolean
  version: string | null
  generatedAt: string | null
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
  next: (PayoutEvent & { days?: number }) | null
  months: PayoutMonth[]
  events: PayoutEvent[]
  coverage: {
    eligibleAssets: number
    scheduledEvents: number
    resolvedAssets: number
    coverageRatio: number
    errors: Array<{ ticker?: string; error?: string }>
  }
  integrityComplete: boolean
  stale: boolean
  warning: string | null
  note: string | null
}

const num = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const str = (value: unknown): string => typeof value === 'string' ? value : ''

const normaliseEvent = (raw: unknown): PayoutEvent => {
  const row = (raw ?? {}) as Record<string, unknown>
  return {
    kind: str(row.kind) || 'INCOME',
    ticker: str(row.ticker) || str(row.name) || '—',
    name: str(row.name) || str(row.ticker) || '—',
    date: str(row.date),
    recordDate: row.recordDate == null ? null : str(row.recordDate),
    lastBuyDate: row.lastBuyDate == null ? null : str(row.lastBuyDate),
    quantity: num(row.quantity),
    perSecurity: num(row.perSecurity),
    gross: row.gross == null ? null : num(row.gross),
    tax: row.tax == null ? null : num(row.tax),
    net: row.net == null ? null : num(row.net),
    taxRate: row.taxRate == null ? null : num(row.taxRate),
    confidence: str(row.confidence),
    source: str(row.source),
    status: str(row.status),
  }
}

const emptySnapshot = (): PayoutsSnapshot => ({
  available: false,
  version: null,
  generatedAt: null,
  actual: { year: null, items: [], totalNet: 0, count: 0 },
  forecast: { gross: 0, tax: 0, net: 0, count: 0 },
  next: null,
  months: [],
  events: [],
  coverage: { eligibleAssets: 0, scheduledEvents: 0, resolvedAssets: 0, coverageRatio: 0, errors: [] },
  integrityComplete: false,
  stale: false,
  warning: null,
  note: null,
})

export async function loadPayouts(): Promise<PayoutsSnapshot> {
  try {
    const response = await fetch('/api/payouts', { cache: 'no-store' })
    const raw = await response.json() as Record<string, unknown>
    if (!response.ok || raw.available === false) {
      return { ...emptySnapshot(), warning: str(raw.error) || 'Календарь выплат временно недоступен.' }
    }

    const actualRaw = (raw.actual ?? {}) as Record<string, unknown>
    const forecastRaw = (raw.forecast ?? {}) as Record<string, unknown>
    const coverageRaw = (raw.coverage ?? {}) as Record<string, unknown>
    const integrityRaw = (raw.integrity ?? {}) as Record<string, unknown>
    const nextRaw = raw.next && typeof raw.next === 'object' ? raw.next as Record<string, unknown> : null
    const monthsRaw = Array.isArray(raw.months) ? raw.months as Record<string, unknown>[] : []
    const eventsRaw = Array.isArray(raw.events) ? raw.events : []
    const actualItemsRaw = Array.isArray(actualRaw.items) ? actualRaw.items : []

    return {
      available: true,
      version: str(raw.version) || null,
      generatedAt: str(raw.generatedAt) || null,
      actual: {
        year: actualRaw.year == null ? null : num(actualRaw.year),
        items: actualItemsRaw.map(normaliseEvent),
        totalNet: num(actualRaw.totalNet),
        count: num(actualRaw.count),
      },
      forecast: {
        gross: num(forecastRaw.gross),
        tax: num(forecastRaw.tax),
        net: num(forecastRaw.net),
        count: num(forecastRaw.count),
      },
      next: nextRaw ? { ...normaliseEvent(nextRaw), days: num(nextRaw.days) } : null,
      months: monthsRaw.map(month => ({
        key: str(month.key),
        year: num(month.year),
        month: num(month.month),
        gross: num(month.gross),
        tax: num(month.tax),
        net: num(month.net),
        count: num(month.count),
        items: Array.isArray(month.items) ? month.items.map(normaliseEvent) : [],
      })),
      events: eventsRaw.map(normaliseEvent),
      coverage: {
        eligibleAssets: num(coverageRaw.eligibleAssets),
        scheduledEvents: num(coverageRaw.scheduledEvents),
        resolvedAssets: num(coverageRaw.resolvedAssets),
        coverageRatio: num(coverageRaw.coverageRatio),
        errors: Array.isArray(coverageRaw.errors) ? coverageRaw.errors as Array<{ ticker?: string; error?: string }> : [],
      },
      integrityComplete: Boolean(integrityRaw.complete),
      stale: Boolean(raw.stale),
      warning: str(raw.warning) || null,
      note: str(raw.note) || null,
    }
  } catch {
    return { ...emptySnapshot(), warning: 'Календарь выплат временно недоступен.' }
  }
}
