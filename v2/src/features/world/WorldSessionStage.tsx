import { useEffect, useMemo, useState } from 'react'
import {
  createEmptyWorldChronicle,
  mergeWorldChronicleEntries,
  type WorldChronicleDocument,
} from '../dna/worldChronicle'
import type { WorldState } from '../dna/worldState'
import { buildFirstSunriseWorldEvent } from './worldLifecycleEvents'
import { mergeWorldSessionEvents } from './worldSessionEventPolicy'
import { WorldStage } from './WorldStage'

/**
 * Session-only lifecycle composition around the canonical Chronicle.
 *
 * This component deliberately does not persist Chronicle to localStorage or invent a
 * second permanent history owner. It observes the already-resolved WorldState phase,
 * records an idempotent first-sunrise semantic event for the current app session, and
 * passes one merged renderer-ready state into Pixi without adding a layout wrapper.
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
    events: mergeWorldSessionEvents(state.events, chronicle.entries),
  }), [state, chronicle])

  return <WorldStage state={rendererState} />
}
