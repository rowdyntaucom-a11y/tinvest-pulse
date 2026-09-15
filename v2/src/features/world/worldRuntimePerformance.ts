export const WORLD_RUNTIME_PERFORMANCE_VERSION = '0.1' as const

export type WorldRuntimePerformancePolicy = {
  version: typeof WORLD_RUNTIME_PERFORMANCE_VERSION
  mobile: boolean
  resolution: number
  maxFps: number
  minFps: number
}

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Central mobile performance policy for the deferred Living World renderer.
 *
 * This encodes the approved mid-tier Android budget without changing financial
 * state or world semantics. Reduced motion lowers ticker pressure further while
 * preserving the same static world state. Hidden/offscreen stopping remains a
 * runtime lifecycle responsibility and is not represented as a fake FPS value.
 */
export function resolveWorldRuntimePerformance(input: {
  viewportWidth: number
  devicePixelRatio: number
  reducedMotion: boolean
}): WorldRuntimePerformancePolicy {
  const viewportWidth = Math.max(1, finiteOr(input.viewportWidth, 1))
  const dpr = Math.max(1, finiteOr(input.devicePixelRatio, 1))
  const mobile = viewportWidth < 900
  const resolutionCap = mobile ? 1.35 : 1.75

  if (input.reducedMotion) {
    return {
      version: WORLD_RUNTIME_PERFORMANCE_VERSION,
      mobile,
      resolution: clamp(dpr, 1, resolutionCap),
      maxFps: 15,
      minFps: 8,
    }
  }

  return {
    version: WORLD_RUNTIME_PERFORMANCE_VERSION,
    mobile,
    resolution: clamp(dpr, 1, resolutionCap),
    maxFps: mobile ? 30 : 60,
    minFps: mobile ? 15 : 20,
  }
}
