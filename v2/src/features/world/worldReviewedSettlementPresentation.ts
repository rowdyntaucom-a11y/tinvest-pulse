import type { WorldTimePhase, WorldWeather } from '../dna/worldState'

export const WORLD_REVIEWED_SETTLEMENT_PRESENTATION_VERSION = '0.1' as const

type SettlementPresentationInput = {
  timePhase: WorldTimePhase
  weather: WorldWeather
}

export type ReviewedSettlementPresentation = {
  version: typeof WORLD_REVIEWED_SETTLEMENT_PRESENTATION_VERSION
  tint: number
  alpha: number
  weatherApplied: boolean
}

const PHASE_TINT: Record<WorldTimePhase, number> = {
  dawn: 0xffe3bf,
  day: 0xffffff,
  sunset: 0xffc89f,
  night: 0x91adc6,
}

const PHASE_ALPHA: Record<WorldTimePhase, number> = {
  dawn: 0.88,
  day: 0.92,
  sunset: 0.9,
  night: 0.72,
}

const WEATHER_ALPHA: Record<WorldWeather, number> = {
  neutral: 1,
  clear: 1.03,
  cloudy: 0.9,
  rain: 0.8,
  storm: 0.66,
}

const WEATHER_TINT: Partial<Record<WorldWeather, number>> = {
  cloudy: 0xcbd6d3,
  rain: 0xa9bec3,
  storm: 0x819aa3,
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

/**
 * Presentation-only adaptation for the reviewed distant-settlement sprite.
 *
 * `neutral` deliberately adds no weather semantics: only the already-resolved
 * local time phase affects the asset. Explicit weather may cool/dim the distant
 * layer, but this boundary never reads XP, portfolio values, returns or events.
 */
export function buildReviewedSettlementPresentation(
  input: SettlementPresentationInput,
): ReviewedSettlementPresentation {
  const weatherTint = WEATHER_TINT[input.weather]

  return {
    version: WORLD_REVIEWED_SETTLEMENT_PRESENTATION_VERSION,
    tint: weatherTint ?? PHASE_TINT[input.timePhase],
    alpha: clamp(PHASE_ALPHA[input.timePhase] * WEATHER_ALPHA[input.weather], 0.42, 0.96),
    weatherApplied: input.weather !== 'neutral',
  }
}
