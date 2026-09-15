import type { WorldEvent } from '../dna/worldState'
import type { WorldEventPresentationChannel } from './worldEventPresentation'

export const WORLD_EVENT_CARAVAN_PRESENTATION_VERSION = '0.1' as const
export const WORLD_EVENT_CARAVAN_LIMIT = 3 as const

export type WorldEventCaravanKind =
  | 'supply'
  | 'repair'
  | 'courier'
  | 'treasury'
  | 'builder'
  | 'celebration'

export type WorldEventCaravanRoute = 'lower-road' | 'upper-road'

export type WorldEventCaravanPlan = {
  version: typeof WORLD_EVENT_CARAVAN_PRESENTATION_VERSION
  id: string
  channel: WorldEventPresentationChannel
  kind: WorldEventCaravanKind
  route: WorldEventCaravanRoute
  accentColor: number
  phaseOffset: number
  pace: number
  scale: number
}

const EVENT_KIND_TO_CHANNEL: Readonly<Record<string, WorldEventPresentationChannel>> = {
  'xp:CONTRIBUTION_HABIT': 'discipline',
  'xp:HEALTH_MILESTONE': 'health',
  'xp:PERFORMANCE_PERIOD': 'performance',
  'xp:PASSIVE_INCOME_GROWTH': 'income',
  'xp:PLAN_ADHERENCE': 'strategy',
  'xp:ACHIEVEMENT': 'achievement',
}

const CHANNEL_STYLE: Readonly<Record<WorldEventPresentationChannel, {
  kind: WorldEventCaravanKind
  accentColor: number
  pace: number
}>> = {
  discipline: { kind: 'supply', accentColor: 0x75d3c2, pace: 0.92 },
  health: { kind: 'repair', accentColor: 0x62d48c, pace: 0.82 },
  performance: { kind: 'courier', accentColor: 0xf0c36d, pace: 1.06 },
  income: { kind: 'treasury', accentColor: 0x6ce5dd, pace: 0.78 },
  strategy: { kind: 'builder', accentColor: 0xa7c97f, pace: 0.84 },
  achievement: { kind: 'celebration', accentColor: 0xe5cb78, pace: 0.72 },
  generic: { kind: 'courier', accentColor: 0xa9bdba, pace: 0.9 },
}

function stableUnitFromId(id: string) {
  let hash = 2166136261
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 0x100000000
}

/**
 * Converts already-semantic pending WorldEvents into a tiny renderer-only
 * procession plan. The channel mapping mirrors the stable semantic presentation
 * contract but is kept runtime-local so Node strip-types tests do not pull a
 * browser/bundler import chain into this pure boundary.
 *
 * It does not inspect transaction amounts, portfolio value, returns, XP totals
 * or broker data. Unknown future event kinds fail safely to `generic`.
 * The visible roster is capped so replayed pending events cannot turn the world
 * into a noisy particle system.
 */
export function buildWorldEventCaravanPresentation(
  events: readonly WorldEvent[],
): WorldEventCaravanPlan[] {
  return events
    .slice(0, WORLD_EVENT_CARAVAN_LIMIT)
    .map((event, index) => {
      const channel = EVENT_KIND_TO_CHANNEL[event.kind] ?? 'generic'
      const style = CHANNEL_STYLE[channel]
      const stable = stableUnitFromId(event.id)
      return {
        version: WORLD_EVENT_CARAVAN_PRESENTATION_VERSION,
        id: event.id,
        channel,
        kind: style.kind,
        route: index % 2 === 0 ? 'lower-road' : 'upper-road',
        accentColor: style.accentColor,
        phaseOffset: (stable + index * 0.29) % 1,
        pace: style.pace,
        scale: index === 0 ? 1 : 0.9,
      }
    })
}
