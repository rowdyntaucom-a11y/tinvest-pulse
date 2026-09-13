import type { WorldEvent } from '../dna/worldState'

export const WORLD_EVENT_PRESENTATION_CHANNELS = {
  discipline: 'ДИСЦИПЛИНА',
  health: 'ЗДОРОВЬЕ',
  performance: 'РЕЗУЛЬТАТ',
  income: 'ДОХОД',
  strategy: 'СТРАТЕГИЯ',
  achievement: 'ДОСТИЖЕНИЕ',
  generic: 'СОБЫТИЕ',
} as const

export type WorldEventPresentationChannel = keyof typeof WORLD_EVENT_PRESENTATION_CHANNELS

export type WorldEventPresentation = {
  id: string
  channel: WorldEventPresentationChannel
  label: string
  occurredAt: string
  title: string | null
}

const XP_KIND_TO_CHANNEL: Record<string, WorldEventPresentationChannel> = {
  'xp:CONTRIBUTION_HABIT': 'discipline',
  'xp:HEALTH_MILESTONE': 'health',
  'xp:PERFORMANCE_PERIOD': 'performance',
  'xp:PASSIVE_INCOME_GROWTH': 'income',
  'xp:PLAN_ADHERENCE': 'strategy',
  'xp:ACHIEVEMENT': 'achievement',
}

/**
 * Converts semantic world events into renderer-facing presentation channels only.
 * It does not select sprites, animation names, colors, particles, camera motion, sound,
 * reward magnitude, weather or event intensity. Unknown future kinds fail safely to `generic`.
 */
export function buildWorldEventPresentation(events: readonly WorldEvent[]): WorldEventPresentation[] {
  return events.map(event => {
    const channel = XP_KIND_TO_CHANNEL[event.kind] ?? 'generic'
    return {
      id: event.id,
      channel,
      label: WORLD_EVENT_PRESENTATION_CHANNELS[channel],
      occurredAt: event.occurredAt,
      title: event.title ?? null,
    }
  })
}
