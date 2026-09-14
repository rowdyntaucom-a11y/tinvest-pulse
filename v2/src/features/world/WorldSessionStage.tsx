import { useEffect, useMemo, useState } from 'react'
import {
  createEmptyWorldChronicle,
  mergeWorldChronicleEntries,
  type WorldChronicleDocument,
} from '../dna/worldChronicle'
import type { WorldEvent, WorldState } from '../dna/worldState'
import { buildFirstSunriseWorldEvent } from './worldLifecycleEvents'
import { WorldStage } from './WorldStage'

export const WORLD_SESSION_STAGE_VERSION = '0.1' as const

function mergeSessionEvents(base: WorldEvent[], chronicle: WorldChronicleDocument): WorldEvent[] {
  const merged: WorldEvent[] = []
  const seen = new Set<string>()

  for (const event of [...base, ...chronicle.entries]) {
    const id = String(event.id || '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    merged.push({
      id,
      kind: String(event.kind || '').trim(),
      occurredAt: event.occurredAt,
      intensity: 'intensity' in event && typeof event.intensity === 'number' ? event.intensity : null,
      title: event.title ?? null,
    })
  }

  return merged
}

/**
 * Session-only lifecycle composition around the canonical Chronicle.
 *
 * This component deliberately does not persist Chronicle to localStorage or invent a
 * second permanent history owner. It observes the already-resolved WorldState phase,
 * records an idempotent first-sunrise semantic event for the current app session, and
 * passes one merged renderer-ready state into Pixi.
 */
export function WorldSessionStage({ state }: { state: WorldState }) {
  const [chronicle, setChronicle] = useState<WorldChronicleDocument>(() => createEmptyWorldChronicle())

  useEffect(() => {
    if (state.timePhase !== 'dawn') return
    const observedAt = new Date().toISOString()

    setChronicle(current => {
      const candidate = buildFirstSunriseWorldEvent(current, {
        timePhase: state.timePhase,
        observedAt,
      })
      if (!candidate) return current
      return mergeWorldChronicleEntries(current, [candidate], observedAt).document
    })
  }, [state.timePhase])

  const rendererState = useMemo<WorldState>(() => ({
    ...state,
    events: mergeSessionEvents(state.events, chronicle),
  }), [state, chronicle])

  return (
    <div
      data-world-session-stage={WORLD_SESSION_STAGE_VERSION}
      data-world-session-chronicle={chronicle.entries.length}
    >
      <WorldStage state={rendererState} />
    </div>
  )
}
