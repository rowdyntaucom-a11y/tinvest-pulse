export const WORLD_LIFECYCLE_EVENT_POLICY_VERSION = '0.1' as const
export const WORLD_FIRST_SUNRISE_EVENT_ID = 'world:first-sunrise' as const
export const WORLD_FIRST_SUNRISE_EVENT_KIND = 'world:FIRST_SUNRISE' as const

export type WorldLifecycleTimePhase = 'dawn' | 'day' | 'sunset' | 'night'

export type WorldLifecycleObservation = {
  timePhase: WorldLifecycleTimePhase
  observedAt: string
}

export type WorldLifecycleEventCandidate = {
  id: typeof WORLD_FIRST_SUNRISE_EVENT_ID
  kind: typeof WORLD_FIRST_SUNRISE_EVENT_KIND
  occurredAt: string
  intensity: null
  title: 'Первый рассвет'
}

function normalizeIso(value: unknown) {
  const timestamp = Date.parse(String(value ?? ''))
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

/**
 * Produces one world-native semantic event candidate when dawn is explicitly
 * observed and the Chronicle does not already contain its stable event ID.
 *
 * Local time has no financial meaning here: no XP, wealth, return, weather,
 * recommendation, art or animation is inferred from the observation.
 */
export function buildFirstSunriseEventPolicy(
  existingEventIds: Iterable<string>,
  observation: WorldLifecycleObservation,
): WorldLifecycleEventCandidate | null {
  if (observation.timePhase !== 'dawn') return null
  const occurredAt = normalizeIso(observation.observedAt)
  if (!occurredAt) return null

  for (const id of existingEventIds) {
    if (String(id).trim() === WORLD_FIRST_SUNRISE_EVENT_ID) return null
  }

  return {
    id: WORLD_FIRST_SUNRISE_EVENT_ID,
    kind: WORLD_FIRST_SUNRISE_EVENT_KIND,
    occurredAt,
    intensity: null,
    title: 'Первый рассвет',
  }
}
