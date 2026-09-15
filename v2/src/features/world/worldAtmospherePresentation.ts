import type { WorldRenderSnapshot } from '../dna/worldRenderSnapshot'

export const WORLD_ATMOSPHERE_PRESENTATION_VERSION = '0.1' as const

export type WorldAtmospherePresentation = {
  version: typeof WORLD_ATMOSPHERE_PRESENTATION_VERSION
  skyTop: number
  skyHorizon: number
  mountainFar: number
  mountainNear: number
  terrain: number
  structureBase: number
  structureAccent: number
  celestial: number
  celestialAlpha: number
  celestialX: number
  celestialY: number
  starAlpha: number
  hazeAlpha: number
  cloudAlpha: number
  rainAlpha: number
  stormFlashAlpha: number
  lamp: number
}

type AtmosphereInput = Pick<WorldRenderSnapshot, 'timePhase' | 'weather'>

type PhasePalette = Omit<
  WorldAtmospherePresentation,
  'version' | 'cloudAlpha' | 'rainAlpha' | 'stormFlashAlpha'
>

const PHASE_PALETTES: Record<WorldRenderSnapshot['timePhase'], PhasePalette> = {
  dawn: {
    skyTop: 0x13283a,
    skyHorizon: 0x9b5d4c,
    mountainFar: 0x315058,
    mountainNear: 0x1c393d,
    terrain: 0x0b1b17,
    structureBase: 0x4b3428,
    structureAccent: 0xb37a4e,
    celestial: 0xffd39b,
    celestialAlpha: 0.82,
    celestialX: 1245,
    celestialY: 330,
    starAlpha: 0.08,
    hazeAlpha: 0.16,
    lamp: 0x7dffe7,
  },
  day: {
    skyTop: 0x0b3544,
    skyHorizon: 0x39716d,
    mountainFar: 0x2c5857,
    mountainNear: 0x173d3a,
    terrain: 0x0b1d17,
    structureBase: 0x4d382a,
    structureAccent: 0xa96d45,
    celestial: 0xffecc3,
    celestialAlpha: 0.72,
    celestialX: 1270,
    celestialY: 175,
    starAlpha: 0,
    hazeAlpha: 0.09,
    lamp: 0x6affe3,
  },
  sunset: {
    skyTop: 0x1b1d36,
    skyHorizon: 0xa65343,
    mountainFar: 0x3a3b4a,
    mountainNear: 0x202c32,
    terrain: 0x0a1714,
    structureBase: 0x4a3028,
    structureAccent: 0xc16c49,
    celestial: 0xffbd72,
    celestialAlpha: 0.76,
    celestialX: 1215,
    celestialY: 350,
    starAlpha: 0.06,
    hazeAlpha: 0.17,
    lamp: 0x72ffe1,
  },
  night: {
    skyTop: 0x06111f,
    skyHorizon: 0x0c2931,
    mountainFar: 0x132c35,
    mountainNear: 0x0c2125,
    terrain: 0x07130f,
    structureBase: 0x322820,
    structureAccent: 0x72533d,
    celestial: 0xdcecff,
    celestialAlpha: 0.58,
    celestialX: 1280,
    celestialY: 190,
    starAlpha: 0.68,
    hazeAlpha: 0.08,
    lamp: 0x66ffe2,
  },
}

const WEATHER_PRESENTATION: Record<WorldRenderSnapshot['weather'], {
  cloudAlpha: number
  rainAlpha: number
  stormFlashAlpha: number
  celestialVisibility: number
  hazeBoost: number
}> = {
  // `neutral` means no reviewed weather signal. Keep time-of-day atmosphere only and
  // deliberately render no weather-specific clouds, rain or storm effects.
  neutral: { cloudAlpha: 0, rainAlpha: 0, stormFlashAlpha: 0, celestialVisibility: 1, hazeBoost: 0 },
  clear: { cloudAlpha: 0.08, rainAlpha: 0, stormFlashAlpha: 0, celestialVisibility: 1, hazeBoost: 0 },
  cloudy: { cloudAlpha: 0.46, rainAlpha: 0, stormFlashAlpha: 0, celestialVisibility: 0.62, hazeBoost: 0.05 },
  rain: { cloudAlpha: 0.62, rainAlpha: 0.42, stormFlashAlpha: 0, celestialVisibility: 0.36, hazeBoost: 0.08 },
  storm: { cloudAlpha: 0.78, rainAlpha: 0.68, stormFlashAlpha: 0.18, celestialVisibility: 0.18, hazeBoost: 0.1 },
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

/**
 * Pure presentation mapping for the Living World renderer.
 *
 * Time and weather are already-resolved WorldState fields before this boundary. This
 * module only chooses visual parameters; it never derives weather from money, returns,
 * broker data or any other financial signal. Unknown/missing weather is normalized to
 * `neutral` upstream, where weather-specific effects remain disabled.
 */
export function buildWorldAtmospherePresentation(input: AtmosphereInput): WorldAtmospherePresentation {
  const phase = PHASE_PALETTES[input.timePhase]
  const weather = WEATHER_PRESENTATION[input.weather]

  return {
    version: WORLD_ATMOSPHERE_PRESENTATION_VERSION,
    ...phase,
    celestialAlpha: clamp01(phase.celestialAlpha * weather.celestialVisibility),
    hazeAlpha: clamp01(phase.hazeAlpha + weather.hazeBoost),
    cloudAlpha: clamp01(weather.cloudAlpha),
    rainAlpha: clamp01(weather.rainAlpha),
    stormFlashAlpha: clamp01(weather.stormFlashAlpha),
  }
}
