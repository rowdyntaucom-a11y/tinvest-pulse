import { normalizeTransactionMarkers, type TransactionMarker } from './transactionMarkers'

export type TransactionMarkerPayload = {
  available: boolean
  markers: TransactionMarker[]
  accepted: number
  rejected: number
  duplicates: number
  source: string | null
  coverageFrom: string | null
  coverageTo: string | null
}

const EMPTY: TransactionMarkerPayload = {
  available: false,
  markers: [],
  accepted: 0,
  rejected: 0,
  duplicates: 0,
  source: null,
  coverageFrom: null,
  coverageTo: null,
}

const CLIENT_TTL_MS = 5 * 60_000
let cache: { expiresAt: number; value: TransactionMarkerPayload } | null = null

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned || null
}

export async function loadTransactionMarkers(): Promise<TransactionMarkerPayload> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) return cache.value

  try {
    const response = await fetch('/api/transaction-markers', { cache: 'no-store' })
    if (!response.ok) return EMPTY
    const raw = await response.json() as Record<string, unknown>
    const rows = Array.isArray(raw.markers) ? raw.markers as Record<string, unknown>[] : []

    // The backend already filters executed operations. Re-run the client-side
    // normalizer as a second fail-closed boundary, translating the API's
    // normalized BUY/SELL side back into the reviewed operation-type contract.
    const normalized = normalizeTransactionMarkers(rows.map(row => ({
      operationId: row.id,
      date: row.date,
      type: row.side === 'BUY' ? 'OPERATION_TYPE_BUY' : row.side === 'SELL' ? 'OPERATION_TYPE_SELL' : null,
      figi: row.figi,
      instrumentUid: row.instrumentUid,
      quantity: row.quantity,
    })))

    const coverage = raw.coverage && typeof raw.coverage === 'object'
      ? raw.coverage as Record<string, unknown>
      : {}
    const value: TransactionMarkerPayload = {
      available: raw.available === true,
      markers: normalized.markers,
      accepted: normalized.accepted,
      rejected: normalized.rejected,
      duplicates: normalized.duplicates,
      source: text(raw.source),
      coverageFrom: text(coverage.from),
      coverageTo: text(coverage.to),
    }
    cache = { expiresAt: now + CLIENT_TTL_MS, value }
    return value
  } catch {
    return EMPTY
  }
}
