export type TransactionSide = 'BUY' | 'SELL'

export interface TransactionMarkerInput {
  operationId?: unknown
  date?: unknown
  type?: unknown
  figi?: unknown
  instrumentUid?: unknown
  quantity?: unknown
}

export interface TransactionMarker {
  id: string
  date: string
  side: TransactionSide
  figi: string | null
  instrumentUid: string | null
  quantity: number | null
}

export interface TransactionMarkerNormalization {
  markers: TransactionMarker[]
  accepted: number
  rejected: number
  duplicates: number
}

// Keep this allow-list intentionally narrower than the server's broad
// `type.includes('BUY'/'SELL')` history logic. History markers require exact,
// reviewed broker operation types so future API additions fail closed.
const BUY_TYPES = new Set([
  'OPERATION_TYPE_BUY',
  'OPERATION_TYPE_DELIVERY_BUY',
  'OPERATION_TYPE_PRIMARY_ORDER',
])

const SELL_TYPES = new Set([
  'OPERATION_TYPE_SELL',
  'OPERATION_TYPE_DELIVERY_SELL',
])

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : null
}

function normalizeSide(type: unknown): TransactionSide | null {
  const value = cleanString(type)?.toUpperCase() ?? null
  if (!value) return null
  if (BUY_TYPES.has(value)) return 'BUY'
  if (SELL_TYPES.has(value)) return 'SELL'
  return null
}

function normalizeDate(value: unknown): string | null {
  const raw = cleanString(value)
  if (!raw) return null
  const timestamp = Date.parse(raw)
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString()
}

function normalizeQuantity(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return null
  return numeric
}

export function normalizeTransactionMarkers(
  inputs: readonly TransactionMarkerInput[],
): TransactionMarkerNormalization {
  const markers: TransactionMarker[] = []
  const seenIds = new Set<string>()
  let rejected = 0
  let duplicates = 0

  for (const input of inputs) {
    const id = cleanString(input.operationId)
    const date = normalizeDate(input.date)
    const side = normalizeSide(input.type)
    const figi = cleanString(input.figi)
    const instrumentUid = cleanString(input.instrumentUid)

    // A history marker must be traceable to one executed broker operation,
    // one exact timestamp and one explicit instrument identity. We do not
    // synthesize IDs, infer sides from cash signs or attach a fake trade price.
    if (!id || !date || !side || (!figi && !instrumentUid)) {
      rejected += 1
      continue
    }

    if (seenIds.has(id)) {
      duplicates += 1
      continue
    }
    seenIds.add(id)

    markers.push({
      id,
      date,
      side,
      figi,
      instrumentUid,
      quantity: normalizeQuantity(input.quantity),
    })
  }

  markers.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

  return {
    markers,
    accepted: markers.length,
    rejected,
    duplicates,
  }
}

export function markerMatchesInstrument(
  marker: TransactionMarker,
  identity: { figi?: string | null; instrumentUid?: string | null },
): boolean {
  const figi = cleanString(identity.figi)
  const instrumentUid = cleanString(identity.instrumentUid)

  if (marker.instrumentUid && instrumentUid) return marker.instrumentUid === instrumentUid
  if (marker.figi && figi) return marker.figi === figi
  return false
}
