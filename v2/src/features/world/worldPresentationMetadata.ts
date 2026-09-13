import type { WorldRenderSnapshot } from '../dna/worldRenderSnapshot'
import { buildWorldEventPresentation, type WorldEventPresentation } from './worldEventPresentation'

export const WORLD_TIME_PHASE_LABEL_RU = {
  dawn: 'РАССВЕТ',
  day: 'ДЕНЬ',
  sunset: 'ВЕЧЕР',
  night: 'НОЧЬ',
} as const satisfies Record<WorldRenderSnapshot['timePhase'], string>

export type WorldPresentationMetadata = {
  timePhase: WorldRenderSnapshot['timePhase']
  timeLabel: string
  weather: WorldRenderSnapshot['weather']
  pendingEventCount: number
  pendingEvents: WorldEventPresentation[]
  primaryEventChannel: WorldEventPresentation['channel'] | null
}

/**
 * Presentation-only metadata for the current resolved world snapshot.
 * It does not infer weather, select art, award XP, or inspect financial inputs.
 */
export function buildWorldPresentationMetadata(snapshot: WorldRenderSnapshot): WorldPresentationMetadata {
  const pendingEvents = buildWorldEventPresentation(snapshot.pendingEvents)
  return {
    timePhase: snapshot.timePhase,
    timeLabel: WORLD_TIME_PHASE_LABEL_RU[snapshot.timePhase],
    weather: snapshot.weather,
    pendingEventCount: snapshot.pendingEventCount,
    pendingEvents,
    primaryEventChannel: pendingEvents[0]?.channel ?? null,
  }
}
