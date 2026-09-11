import { buildXpLedger, type XpEvent, type XpEventKind, type XpLedger } from './xpEngine'

export type XpLedgerDocument = {
  version: '0.1'
  events: XpEvent[]
  updatedAt: string | null
}

export type XpLedgerMergeResult = {
  document: XpLedgerDocument
  ledger: XpLedger
  acceptedNewEvents: number
  duplicateIncomingEvents: number
  rejectedIncomingEvents: number
}

const EVENT_KINDS: ReadonlySet<XpEventKind> = new Set([
  'CONTRIBUTION_HABIT',
  'HEALTH_MILESTONE',
  'PERFORMANCE_PERIOD',
  'PASSIVE_INCOME_GROWTH',
  'PLAN_ADHERENCE',
  'ACHIEVEMENT',
])

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeOptionalString(value: unknown) {
  if (value == null) return null
  const text = cleanString(value)
  return text || null
}

function normalizeIso(value: unknown) {
  const timestamp = Date.parse(String(value ?? ''))
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

/**
 * Persistence boundary for XP events. This intentionally knows nothing about browser storage,
 * account identifiers or RUB capital. A backend/database adapter can persist the returned
 * document without changing progression math.
 */
export function normalizeXpEvent(value: unknown): XpEvent | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Partial<Record<keyof XpEvent, unknown>>
  const id = cleanString(raw.id)
  const kind = cleanString(raw.kind) as XpEventKind
  const occurredAt = normalizeIso(raw.occurredAt)
  const ruleVersion = cleanString(raw.ruleVersion)

  if (!id || !EVENT_KINDS.has(kind) || !occurredAt || !ruleVersion || !finiteNonNegative(raw.awardedXp)) {
    return null
  }

  return {
    id,
    kind,
    occurredAt,
    awardedXp: Math.round(raw.awardedXp * 100) / 100,
    ruleVersion,
    sourceRef: normalizeOptionalString(raw.sourceRef),
    note: normalizeOptionalString(raw.note),
  }
}

export function createEmptyXpLedgerDocument(): XpLedgerDocument {
  return { version: '0.1', events: [], updatedAt: null }
}

/**
 * Reads persisted data defensively. Invalid documents fail closed to an empty ledger rather than
 * manufacturing progression from partially trusted storage.
 */
export function readXpLedgerDocument(value: unknown): XpLedgerDocument {
  if (!value || typeof value !== 'object') return createEmptyXpLedgerDocument()
  const raw = value as { version?: unknown; events?: unknown; updatedAt?: unknown }
  if (raw.version !== '0.1' || !Array.isArray(raw.events)) return createEmptyXpLedgerDocument()

  const seen = new Set<string>()
  const events: XpEvent[] = []
  for (const candidate of raw.events) {
    const event = normalizeXpEvent(candidate)
    if (!event || seen.has(event.id)) continue
    seen.add(event.id)
    events.push(event)
  }

  events.sort((a, b) => {
    const timeDiff = Date.parse(a.occurredAt) - Date.parse(b.occurredAt)
    return timeDiff || a.id.localeCompare(b.id)
  })

  return {
    version: '0.1',
    events,
    updatedAt: normalizeIso(raw.updatedAt),
  }
}

/**
 * Idempotently appends new versioned events. Existing ids always win so a retry or later rule
 * replay cannot rewrite history. Invalid incoming payloads are counted and ignored.
 */
export function mergeXpLedgerEvents(
  stored: unknown,
  incoming: unknown[],
  persistedAt: string,
): XpLedgerMergeResult {
  const base = readXpLedgerDocument(stored)
  const seen = new Set(base.events.map(event => event.id))
  const events = [...base.events]
  let acceptedNewEvents = 0
  let duplicateIncomingEvents = 0
  let rejectedIncomingEvents = 0

  for (const candidate of Array.isArray(incoming) ? incoming : []) {
    const event = normalizeXpEvent(candidate)
    if (!event) {
      rejectedIncomingEvents += 1
      continue
    }
    if (seen.has(event.id)) {
      duplicateIncomingEvents += 1
      continue
    }
    seen.add(event.id)
    events.push(event)
    acceptedNewEvents += 1
  }

  events.sort((a, b) => {
    const timeDiff = Date.parse(a.occurredAt) - Date.parse(b.occurredAt)
    return timeDiff || a.id.localeCompare(b.id)
  })

  const document: XpLedgerDocument = {
    version: '0.1',
    events,
    updatedAt: acceptedNewEvents > 0 ? normalizeIso(persistedAt) : base.updatedAt,
  }

  return {
    document,
    ledger: buildXpLedger(events),
    acceptedNewEvents,
    duplicateIncomingEvents,
    rejectedIncomingEvents,
  }
}
