import type { WorldEventPresentation, WorldEventPresentationChannel } from './worldEventPresentation'

export const WORLD_EVENT_CARAVAN_VERSION = '0.1' as const
export const WORLD_EVENT_CARAVAN_LIMIT = 2 as const

export type WorldEventCaravanDestination =
  | 'mine-yard'
  | 'workshop'
  | 'construction-yard'
  | 'storehouse'
  | 'settlement-gate'
  | 'town-square'

export type WorldEventCaravanDirection = 'eastbound' | 'westbound'
export type WorldEventCaravanJourneySegment = 'approach' | 'dwell' | 'depart'

export type WorldEventCaravanPlan = {
  version: typeof WORLD_EVENT_CARAVAN_VERSION
  id: string
  channel: WorldEventPresentationChannel
  destination: WorldEventCaravanDestination
  direction: WorldEventCaravanDirection
  accentColor: number
  phaseOffset: number
  pace: number
}

export type WorldEventCaravanJourney = {
  segment: WorldEventCaravanJourneySegment
  progress: number
  arrived: boolean
}

const CHANNEL_STYLE: Readonly<Record<WorldEventPresentationChannel, {
  destination: WorldEventCaravanDestination
  accentColor: number
  pace: number
}>> = {
  discipline: { destination: 'mine-yard', accentColor: 0x75d3c2, pace: 0.9 },
  health: { destination: 'workshop', accentColor: 0x62d48c, pace: 0.82 },
  performance: { destination: 'settlement-gate', accentColor: 0xf0c36d, pace: 1.02 },
  income: { destination: 'storehouse', accentColor: 0x6ce5dd, pace: 0.78 },
  strategy: { destination: 'construction-yard', accentColor: 0xa7c97f, pace: 0.84 },
  achievement: { destination: 'town-square', accentColor: 0xe5cb78, pace: 0.72 },
  generic: { destination: 'settlement-gate', accentColor: 0xa9bdba, pace: 0.88 },
}

const APPROACH_END = 0.38
const DWELL_END = 0.64

function stableUnitFromId(id: string) {
  let hash = 2166136261
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 0x100000000
}

function wrapUnit(value: number) {
  if (!Number.isFinite(value)) return 0
  return ((value % 1) + 1) % 1
}

function normalizedSegment(value: number, start: number, end: number) {
  if (end <= start) return 0
  return Math.max(0, Math.min(1, (value - start) / (end - start)))
}

/**
 * Builds a tiny, deterministic visual procession from already-semantic presentation
 * events. The caller must use the canonical `buildWorldEventPresentation(...)`
 * boundary first, so this module never owns or duplicates event-kind classification.
 * It never inspects transaction amounts, portfolio value, returns, XP totals or broker fields.
 */
export function buildWorldEventCaravanPresentation(
  events: readonly WorldEventPresentation[],
): WorldEventCaravanPlan[] {
  return events
    .slice(0, WORLD_EVENT_CARAVAN_LIMIT)
    .map((event, index) => {
      const style = CHANNEL_STYLE[event.channel]
      const stable = stableUnitFromId(event.id)
      return {
        version: WORLD_EVENT_CARAVAN_VERSION,
        id: event.id,
        channel: event.channel,
        destination: style.destination,
        direction: stable < 0.5 ? 'eastbound' : 'westbound',
        accentColor: style.accentColor,
        phaseOffset: (stable + index * 0.31) % 1,
        pace: style.pace,
      }
    })
}

/**
 * Each semantic caravan approaches its destination, dwells long enough to be readable,
 * then departs. Reduced motion freezes the semantic signal at its destination instead
 * of hiding it.
 */
export function resolveWorldEventCaravanJourney(phaseInput: number, reducedMotion = false): WorldEventCaravanJourney {
  if (reducedMotion) return { segment: 'dwell', progress: 0.5, arrived: true }

  const phase = wrapUnit(phaseInput)
  if (phase < APPROACH_END) {
    return { segment: 'approach', progress: normalizedSegment(phase, 0, APPROACH_END), arrived: false }
  }
  if (phase < DWELL_END) {
    return { segment: 'dwell', progress: normalizedSegment(phase, APPROACH_END, DWELL_END), arrived: true }
  }
  return { segment: 'depart', progress: normalizedSegment(phase, DWELL_END, 1), arrived: false }
}
