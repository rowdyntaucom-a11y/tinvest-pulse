import { normalizeTransactionMarkers, type TransactionMarker } from './transactionMarkers'

export type TransactionMarkerPayload = {
  available: boolean
  markers: TransactionMarker[]
  accepted: number
  rejected: number
  duplicates: number
  source: string | null
  asOf: string | null
}

const EMPTY: TransactionMarkerPayload = {
  available: false,
  markers: [],
  accepted: 0,
  rejected: 0,
  duplicates: 0,
  source: null,
  asOf: null,
}

const CLIENT_TTL_MS = 15 * 60_000
let cache: { expiresAt: number; value: TransactionMarkerPayload } | null = null

export async function loadTransactionMarkers(): Promise<TransactionMarkerPayload> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) return cache.value

  try {
    const response = await fetch('/api/transaction-markers', { cache: 'no-store' })
    if (!response.ok) return EMPTY
    const raw = await response.json() as Record<string, unknown>
    const rows = Array.isArray(raw.markers) ? raw.markers : []
    const normalized = normalizeTransactionMarkers(rows)
    const value: TransactionMarkerPayload = {
      available: raw.available === true,
      markers: normalized.markers,
      accepted: normalized.accepted,
      rejected: normalized.rejected,
      duplicates: normalized.duplicates,
      source: typeof raw.source === 'string' ? raw.source : null,
      asOf: typeof raw.asOf === 'string' ? raw.asOf : null,
    }
    cache = { expiresAt: now + CLIENT_TTL_MS, value }
    return value
  } catch {
    return EMPTY
  }
}
