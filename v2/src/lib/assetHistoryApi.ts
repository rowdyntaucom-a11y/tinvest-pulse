export const ASSET_HISTORY_NORMALIZATION_VERSION = '1.1' as const

export type AssetHistoryPoint = {
  date: string
  value: number
}

export type AssetHistorySeries = {
  key: string
  label: string
  instrumentId: string | null
  points: AssetHistoryPoint[]
  integrity: 'VALID' | 'CONFLICT'
  duplicateRowsCollapsed: number
  conflictingDates: number
}

export type AssetHistoryPayload = {
  normalizationVersion: typeof ASSET_HISTORY_NORMALIZATION_VERSION
  version: string | null
  available: boolean
  from: string | null
  to: string | null
  requested: number
  availableSeries: number
  source: string | null
  series: AssetHistorySeries[]
}

const emptyPayload = (): AssetHistoryPayload => ({
  normalizationVersion: ASSET_HISTORY_NORMALIZATION_VERSION,
  version: null,
  available: false,
  from: null,
  to: null,
  requested: 0,
  availableSeries: 0,
  source: null,
  series: [],
})

const text = (value: unknown) => {
  if (value == null) return null
  const parsed = String(value).trim()
  return parsed || null
}

const finiteNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.')
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const nonNegativeInteger = (value: unknown) => {
  const parsed = finiteNumber(value)
  return parsed != null && parsed >= 0 && Number.isInteger(parsed) ? parsed : 0
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

type NormalizedPoints = {
  points: AssetHistoryPoint[]
  integrity: 'VALID' | 'CONFLICT'
  duplicateRowsCollapsed: number
  conflictingDates: number
}

function normalizePoints(value: unknown): NormalizedPoints {
  if (!Array.isArray(value)) {
    return {
      points: [],
      integrity: 'VALID',
      duplicateRowsCollapsed: 0,
      conflictingDates: 0,
    }
  }

  const byDate = new Map<string, number>()
  const conflictingDates = new Set<string>()
  let duplicateRowsCollapsed = 0

  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const date = dateOnly(row.date)
    const price = finiteNumber(row.value)
    if (!date || price == null || price <= 0) continue

    const existing = byDate.get(date)
    if (existing == null) {
      byDate.set(date, price)
      continue
    }

    if (existing === price) duplicateRowsCollapsed += 1
    else conflictingDates.add(date)
  }

  if (conflictingDates.size > 0) {
    return {
      points: [],
      integrity: 'CONFLICT',
      duplicateRowsCollapsed,
      conflictingDates: conflictingDates.size,
    }
  }

  return {
    points: [...byDate.entries()]
      .map(([date, price]) => ({ date, value: price }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    integrity: 'VALID',
    duplicateRowsCollapsed,
    conflictingDates: 0,
  }
}

function normalizeSeries(value: unknown): AssetHistorySeries | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const instrumentId = text(row.instrumentId)
  const key = text(row.key) || instrumentId
  if (!key) return null
  const label = text(row.label) || key
  const normalized = normalizePoints(row.points)

  return {
    key,
    label,
    instrumentId,
    points: normalized.points,
    integrity: normalized.integrity,
    duplicateRowsCollapsed: normalized.duplicateRowsCollapsed,
    conflictingDates: normalized.conflictingDates,
  }
}

function normalizeSeriesList(value: unknown) {
  if (!Array.isArray(value)) return []
  const rows = value.map(normalizeSeries).filter((row): row is AssetHistorySeries => row != null)
  const counts = new Map<string, number>()
  for (const row of rows) counts.set(row.key, (counts.get(row.key) ?? 0) + 1)
  return rows.filter(row => counts.get(row.key) === 1)
}

export async function loadAssetHistory(signal?: AbortSignal): Promise<AssetHistoryPayload> {
  try {
    const response = await fetch('/api/asset-history', { cache: 'no-store', signal })
    if (!response.ok) return emptyPayload()
    const raw = await response.json() as Record<string, unknown>
    if (raw.available !== true) return emptyPayload()

    const series = normalizeSeriesList(raw.series)
    const usableSeries = series.filter(row => row.integrity === 'VALID' && row.points.length >= 2).length
    if (usableSeries === 0) return emptyPayload()

    return {
      normalizationVersion: ASSET_HISTORY_NORMALIZATION_VERSION,
      version: text(raw.version),
      available: true,
      from: dateOnly(raw.from),
      to: dateOnly(raw.to),
      requested: Math.max(nonNegativeInteger(raw.requested), series.length),
      availableSeries: usableSeries,
      source: text(raw.source),
      series,
    }
  } catch {
    return emptyPayload()
  }
}
