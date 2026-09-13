import type { WorldRenderSnapshot } from '../dna/worldRenderSnapshot'

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
}

/**
 * Presentation-only metadata for the current resolved world snapshot.
 * It does not infer weather, select art, award XP, or inspect financial inputs.
 */
export function buildWorldPresentationMetadata(snapshot: WorldRenderSnapshot): WorldPresentationMetadata {
  return {
    timePhase: snapshot.timePhase,
    timeLabel: WORLD_TIME_PHASE_LABEL_RU[snapshot.timePhase],
    weather: snapshot.weather,
    pendingEventCount: snapshot.pendingEventCount,
  }
}
