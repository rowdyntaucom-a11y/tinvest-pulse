import type { WorldEvent, WorldState } from './worldState'

export const WORLD_EVENT_QUEUE_VERSION = '0.1' as const

export type WorldEventCursorDocument = {
  version: typeof WORLD_EVENT_QUEUE_VERSION
  acknowledgedEventIds: string[]
}

export type ResolvedWorldEventQueue = {
  version: typeof WORLD_EVENT_QUEUE_VERSION
  pending: WorldEvent[]
  visibleEvents: number
  acknowledgedVisibleEvents: number
}

const cleanId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const id = value.trim()
  return id || null
}

export function emptyWorldEventCursor(): WorldEventCursorDocument {
  return {
    version: WORLD_EVENT_QUEUE_VERSION,
    acknowledgedEventIds: [],
  }
}

/**
 * Fail-closed parser for a future persisted event cursor.
 * Invalid documents cannot manufacture acknowledgement state; they fall back to an empty cursor,
 * which may replay a visible semantic event but can never hide a legitimate event silently.
 */
export function normalizeWorldEventCursor(value: unknown): WorldEventCursorDocument {
  if (!value || typeof value !== 'object') return emptyWorldEventCursor()
  const row = value as Record<string, unknown>
  if (row.version !== WORLD_EVENT_QUEUE_VERSION || !Array.isArray(row.acknowledgedEventIds)) {
    return emptyWorldEventCursor()
  }

  const unique = new Set<string>()
  for (const candidate of row.acknowledgedEventIds) {
    const id = cleanId(candidate)
    if (!id) return emptyWorldEventCursor()
    unique.add(id)
  }

  return {
    version: WORLD_EVENT_QUEUE_VERSION,
    acknowledgedEventIds: [...unique].sort((a, b) => a.localeCompare(b)),
  }
}

/**
 * Resolve semantic events that are still pending presentation.
 * WorldState already owns event validation/order; this layer only applies acknowledgement state.
 * It deliberately does not choose animations, sounds, particles, camera motion or reward amounts.
 */
export function resolveWorldEventQueue(
  state: Pick<WorldState, 'events'>,
  cursor: WorldEventCursorDocument,
): ResolvedWorldEventQueue {
  const acknowledged = new Set(cursor.acknowledgedEventIds)
  const pending = state.events.filter(event => !acknowledged.has(event.id))

  return {
    version: WORLD_EVENT_QUEUE_VERSION,
    pending,
    visibleEvents: state.events.length,
    acknowledgedVisibleEvents: state.events.length - pending.length,
  }
}

/**
 * Acknowledge only an event that is actually pending in the resolved queue.
 * Unknown/stale ids are ignored so they cannot pre-acknowledge and later hide a legitimate event.
 */
export function acknowledgeWorldEvent(
  cursor: WorldEventCursorDocument,
  queue: Pick<ResolvedWorldEventQueue, 'pending'>,
  eventId: unknown,
): WorldEventCursorDocument {
  const normalized = normalizeWorldEventCursor(cursor)
  const id = cleanId(eventId)
  if (!id) return normalized

  const pendingIds = new Set(queue.pending.map(event => event.id))
  if (!pendingIds.has(id)) return normalized

  return normalizeWorldEventCursor({
    version: WORLD_EVENT_QUEUE_VERSION,
    acknowledgedEventIds: [...normalized.acknowledgedEventIds, id],
  })
}

export function acknowledgeWorldEvents(
  cursor: WorldEventCursorDocument,
  queue: Pick<ResolvedWorldEventQueue, 'pending'>,
  eventIds: Iterable<unknown>,
): WorldEventCursorDocument {
  let next = normalizeWorldEventCursor(cursor)
  for (const eventId of eventIds) next = acknowledgeWorldEvent(next, queue, eventId)
  return next
}

export function acknowledgePendingWorldEvents(
  cursor: WorldEventCursorDocument,
  queue: Pick<ResolvedWorldEventQueue, 'pending'>,
): WorldEventCursorDocument {
  return acknowledgeWorldEvents(cursor, queue, queue.pending.map(event => event.id))
}
