import { readWorldChronicle } from '../dna/worldChronicle'
import type { WorldEvent } from '../dna/worldState'
import {
  buildFirstSunriseEventPolicy,
  type WorldLifecycleObservation,
} from './worldLifecycleEventPolicy'

export {
  WORLD_FIRST_SUNRISE_EVENT_ID,
  WORLD_FIRST_SUNRISE_EVENT_KIND,
  WORLD_LIFECYCLE_EVENT_POLICY_VERSION,
} from './worldLifecycleEventPolicy'
export type { WorldLifecycleObservation } from './worldLifecycleEventPolicy'

/**
 * Production adapter over the canonical Chronicle. It emits at most one
 * semantic candidate; Chronicle merge/persistence remains owned by Chronicle.
 */
export function buildFirstSunriseWorldEvent(
  chronicleInput: unknown,
  observation: WorldLifecycleObservation,
): WorldEvent | null {
  const chronicle = readWorldChronicle(chronicleInput)
  return buildFirstSunriseEventPolicy(
    chronicle.entries.map(entry => entry.id),
    observation,
  )
}
