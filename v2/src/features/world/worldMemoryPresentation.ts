import { readWorldChronicle } from '../dna/worldChronicle'
import { buildWorldEventPresentation, type WorldEventPresentationChannel } from './worldEventPresentation'
import {
  buildWorldMemoryPresentationPolicy,
  WORLD_MEMORY_PRESENTATION_VERSION,
  type WorldMemoryPresentation,
} from './worldMemoryPresentationPolicy'

export { WORLD_MEMORY_PRESENTATION_VERSION }
export type { WorldMemoryPresentation, WorldMemoryMoment, WorldMemoryChannelSummary } from './worldMemoryPresentationPolicy'

/**
 * Production adapter: Chronicle owns validation/history, event presentation owns
 * semantic channels, and the dependency-free policy owns recurrence aggregation.
 * No art/scar/animation decision is made here.
 */
export function buildWorldMemoryPresentation(
  chronicleInput: unknown,
  recentLimit = 20,
): WorldMemoryPresentation<WorldEventPresentationChannel> {
  const chronicle = readWorldChronicle(chronicleInput)
  const presented = buildWorldEventPresentation(chronicle.entries)
  return buildWorldMemoryPresentationPolicy(presented, recentLimit)
}
