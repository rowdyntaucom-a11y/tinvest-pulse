import type { PayoutEvent } from '../../lib/payoutsApi'

export type IncomeCalendarVisualMonth = {
  key: string
  label: string
  year: number
  month: number
  count: number
  gross: number
  grossAvailable: boolean
  intensity: number
  intensityBasis: 'gross' | 'count' | 'empty'
}

function dateOnly(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const day = value.trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  const ms = Date.parse(`${day}T00:00:00.000Z`)
  if (!Number.isFinite(ms)) return null
  return new Date(ms).toISOString().slice(0, 10) === day ? day : null
}

function monthKeyFromDate(value: unknown): string | null {
  const day = dateOnly(value)
  return day ? day.slice(0, 7) : null
}

function finiteNonNegative(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function isForecastEvent(event: PayoutEvent) {
  return String(event.status || '').toUpperCase() !== 'FACT'
}

function addMonths(year: number, month: number, offset: number) {
  const absolute = year * 12 + month + offset
  const nextYear = Math.floor(absolute / 12)
  const nextMonth = ((absolute % 12) + 12) % 12
  return { year: nextYear, month: nextMonth }
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('ru-RU', { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month, 1)))
    .replace('.', '')
    .toUpperCase()
}

export function buildIncomeCalendarVisual(
  events: PayoutEvent[],
  windowStart: string | null | undefined,
  monthCount = 12,
): IncomeCalendarVisualMonth[] {
  const start = dateOnly(windowStart)
  if (!start || !Number.isInteger(monthCount) || monthCount <= 0 || monthCount > 24) return []

  const startYear = Number(start.slice(0, 4))
  const startMonth = Number(start.slice(5, 7)) - 1
  const buckets = new Map<string, { count: number; gross: number; grossAvailable: boolean }>()

  for (const event of events) {
    if (!isForecastEvent(event)) continue
    const key = monthKeyFromDate(event.date)
    if (!key) continue
    const state = buckets.get(key) ?? { count: 0, gross: 0, grossAvailable: false }
    state.count += 1
    const gross = finiteNonNegative(event.gross)
    if (gross != null) {
      state.gross += gross
      state.grossAvailable = true
    }
    buckets.set(key, state)
  }

  const rows: IncomeCalendarVisualMonth[] = Array.from({ length: monthCount }, (_, index) => {
    const { year, month } = addMonths(startYear, startMonth, index)
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const state = buckets.get(key) ?? { count: 0, gross: 0, grossAvailable: false }
    return {
      key,
      label: monthLabel(year, month),
      year,
      month: month + 1,
      count: state.count,
      gross: state.gross,
      grossAvailable: state.grossAvailable,
      intensity: 0,
      intensityBasis: state.count > 0 ? (state.grossAvailable ? 'gross' : 'count') : 'empty',
    }
  })

  const maxGross = Math.max(0, ...rows.filter(row => row.grossAvailable).map(row => row.gross))
  const maxCount = Math.max(0, ...rows.map(row => row.count))

  return rows.map(row => {
    if (row.count <= 0) return row
    if (row.grossAvailable && maxGross > 0) {
      return { ...row, intensity: Math.min(1, Math.max(0.2, row.gross / maxGross)), intensityBasis: 'gross' }
    }
    if (maxCount > 0) {
      return { ...row, intensity: Math.min(1, Math.max(0.2, row.count / maxCount)), intensityBasis: 'count' }
    }
    return row
  })
}

export function filterIncomeCalendarEvents(events: PayoutEvent[], monthKey: string | null): PayoutEvent[] {
  const forecast = events.filter(isForecastEvent)
  if (!monthKey) return forecast
  return forecast.filter(event => monthKeyFromDate(event.date) === monthKey)
}
