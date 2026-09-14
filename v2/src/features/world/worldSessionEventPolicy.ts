export const WORLD_SESSION_EVENT_POLICY_VERSION = '0.1' as const

export type WorldSessionEventInput = {
  id?: unknown
  kind?: unknown
  occurredAt?: unknown
  intensity?: unknown
  title?: unknown
}

export type WorldSessionEvent = {
  id: string
  kind: string
  occurredAt: string
  intensity: number | null
  title: string | null
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function normalizeEvent(value: WorldSessionEventInput): WorldSessionEvent | null {
  const id = typeof value?.id === 'string' ? value.id.trim() : ''
  const kind = typeof value?.kind === 'string' ? value.kind.trim() : ''
  const timestamp = Date.parse(String(value?.occurredAt ?? ''))
  if (!id || !kind || !Number.isFinite(timestamp)) return null

  const title = value.title == null ? null : String(value.title).trim() || null
  const intensity = typeof value.intensity === 'number' && Number.isFinite(value.intensity)
    ? clamp01(value.intensity)
    : null

  return {
    id,
    kind,
    occurredAt: new Date(timestamp).toISOString(),
    intensity,
    title,
  }
}

/**
 * Merges already-resolved runtime events with canonical Chronicle entries for one
 * renderer snapshot. Base/runtime events have ID precedence; Chronicle cannot
 * rewrite them. Invalid rows fail closed and output order is deterministic.
 */
export function mergeWorldSessionEvents(
  baseEvents: readonly WorldSessionEventInput[],
  chronicleEvents: readonly WorldSessionEventInput[],
): WorldSessionEvent[] {
  const seen = new Set<string>()
  const merged: WorldSessionEvent[] = []

  for (const candidate of [...baseEvents, ...chronicleEvents]) {
    const event = normalizeEvent(candidate)
    if (!event || seen.has(event.id)) continue
    seen.add(event.id)
    merged.push(event)
  }

  return merged.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id))
}
