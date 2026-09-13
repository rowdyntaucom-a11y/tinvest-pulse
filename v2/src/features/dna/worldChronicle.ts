export const WORLD_CHRONICLE_VERSION = '0.1' as const

export type WorldChronicleEntry = {
  id: string
  kind: string
  occurredAt: string
  title: string | null
}

export type WorldChronicleDocument = {
  version: typeof WORLD_CHRONICLE_VERSION
  entries: WorldChronicleEntry[]
  updatedAt: string | null
}

export type WorldChronicleMergeResult = {
  document: WorldChronicleDocument
  acceptedNewEntries: number
  duplicateIncomingEntries: number
  rejectedIncomingEntries: number
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeOptionalTitle(value: unknown) {
  if (value == null) return null
  const text = cleanString(value)
  return text || null
}

function normalizeIso(value: unknown) {
  const timestamp = Date.parse(String(value ?? ''))
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

/**
 * Chronicle accepts only already-resolved semantic world events. It deliberately
 * stores no XP amount, portfolio value, animation, intensity, weather or art.
 */
export function normalizeWorldChronicleEntry(value: unknown): WorldChronicleEntry | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const id = cleanString(raw.id)
  const kind = cleanString(raw.kind)
  const occurredAt = normalizeIso(raw.occurredAt)
  if (!id || !kind || !occurredAt) return null

  return {
    id,
    kind,
    occurredAt,
    title: normalizeOptionalTitle(raw.title),
  }
}

export function createEmptyWorldChronicle(): WorldChronicleDocument {
  return {
    version: WORLD_CHRONICLE_VERSION,
    entries: [],
    updatedAt: null,
  }
}

/**
 * Invalid/corrupt document envelopes fail closed to an empty Chronicle. Within
 * a valid envelope, malformed or duplicate rows are ignored; first valid ID wins.
 */
export function readWorldChronicle(value: unknown): WorldChronicleDocument {
  if (!value || typeof value !== 'object') return createEmptyWorldChronicle()
  const raw = value as { version?: unknown; entries?: unknown; updatedAt?: unknown }
  if (raw.version !== WORLD_CHRONICLE_VERSION || !Array.isArray(raw.entries)) {
    return createEmptyWorldChronicle()
  }

  const seen = new Set<string>()
  const entries: WorldChronicleEntry[] = []
  for (const candidate of raw.entries) {
    const entry = normalizeWorldChronicleEntry(candidate)
    if (!entry || seen.has(entry.id)) continue
    seen.add(entry.id)
    entries.push(entry)
  }

  entries.sort((a, b) => {
    const timeDiff = Date.parse(a.occurredAt) - Date.parse(b.occurredAt)
    return timeDiff || a.id.localeCompare(b.id)
  })

  return {
    version: WORLD_CHRONICLE_VERSION,
    entries,
    updatedAt: normalizeIso(raw.updatedAt),
  }
}

/**
 * Idempotently appends semantic events to the Chronicle. Existing IDs always
 * win: retries or later replays cannot rewrite previously recorded history.
 */
export function mergeWorldChronicleEntries(
  stored: unknown,
  incoming: unknown[],
  persistedAt: string,
): WorldChronicleMergeResult {
  const base = readWorldChronicle(stored)
  const seen = new Set(base.entries.map(entry => entry.id))
  const entries = [...base.entries]
  let acceptedNewEntries = 0
  let duplicateIncomingEntries = 0
  let rejectedIncomingEntries = 0

  for (const candidate of Array.isArray(incoming) ? incoming : []) {
    const entry = normalizeWorldChronicleEntry(candidate)
    if (!entry) {
      rejectedIncomingEntries += 1
      continue
    }
    if (seen.has(entry.id)) {
      duplicateIncomingEntries += 1
      continue
    }
    seen.add(entry.id)
    entries.push(entry)
    acceptedNewEntries += 1
  }

  entries.sort((a, b) => {
    const timeDiff = Date.parse(a.occurredAt) - Date.parse(b.occurredAt)
    return timeDiff || a.id.localeCompare(b.id)
  })

  return {
    document: {
      version: WORLD_CHRONICLE_VERSION,
      entries,
      updatedAt: acceptedNewEntries > 0 ? normalizeIso(persistedAt) : base.updatedAt,
    },
    acceptedNewEntries,
    duplicateIncomingEntries,
    rejectedIncomingEntries,
  }
}
