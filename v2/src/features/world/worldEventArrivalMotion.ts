export const WORLD_EVENT_ARRIVAL_MOTION_VERSION = '0.1' as const

export type WorldEventArrivalMotion = {
  version: typeof WORLD_EVENT_ARRIVAL_MOTION_VERSION
  visible: boolean
  glowAlpha: number
  sceneAlpha: number
  scale: number
  offsetY: number
  rotation: number
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

/**
 * Small deterministic motion policy for destination micro-scenes.
 *
 * The renderer supplies only dwell state, reduced-motion preference and a local
 * clock. No financial values, XP amounts, broker fields or event mutation enter
 * this boundary. Reduced motion keeps the semantic arrival readable but static.
 */
export function resolveWorldEventArrivalMotion(input: {
  arrived: boolean
  reducedMotion: boolean
  motionSeconds: number
  index: number
  emphasis: number
}): WorldEventArrivalMotion {
  if (!input.arrived) {
    return {
      version: WORLD_EVENT_ARRIVAL_MOTION_VERSION,
      visible: false,
      glowAlpha: 0,
      sceneAlpha: 0,
      scale: 1,
      offsetY: 0,
      rotation: 0,
    }
  }

  const emphasis = clamp01(input.emphasis)
  if (input.reducedMotion) {
    return {
      version: WORLD_EVENT_ARRIVAL_MOTION_VERSION,
      visible: true,
      glowAlpha: 0.12 + emphasis * 0.12,
      sceneAlpha: 0.5 + emphasis * 0.36,
      scale: 1,
      offsetY: 0,
      rotation: 0,
    }
  }

  const wave = Math.sin(input.motionSeconds * 4.8 + input.index * 0.85)
  const positiveWave = (wave + 1) / 2
  return {
    version: WORLD_EVENT_ARRIVAL_MOTION_VERSION,
    visible: true,
    glowAlpha: 0.1 + emphasis * 0.08 + positiveWave * 0.08,
    sceneAlpha: 0.56 + emphasis * 0.3 + positiveWave * 0.1,
    scale: 0.98 + positiveWave * 0.04,
    offsetY: -positiveWave * 2.4,
    rotation: wave * 0.012,
  }
}
