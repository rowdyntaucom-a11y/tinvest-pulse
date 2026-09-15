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
    skyTop: 0x17253f,
    skyHorizon: 0xb46d58,
    mountainFar: 0x425968,
    mountainNear: 0x243b45,
    terrain: 0x0b1c18,
    structureBase: 0x4a352c,
    structureAccent: 0xc3895c,
    celestial: 0xffd7a3,
    celestialAlpha: 0.86,
    celestialX: 1235,
    celestialY: 325,
    starAlpha: 0.14,
    hazeAlpha: 0.2,
    lamp: 0x9bffe8,
  },
  day: {
    skyTop: 0x0d4254,
    skyHorizon: 0x5b948e,
    mountainFar: 0x3b6664,
    mountainNear: 0x204944,
    terrain: 0x0c221b,
    structureBase: 0x50392c,
    structureAccent: 0xb77b50,
    celestial: 0xffefc8,
    celestialAlpha: 0.82,
    celestialX: 1265,
    celestialY: 168,
    starAlpha: 0,
    hazeAlpha: 0.08,
    lamp: 0x7fffe4,
  },
  sunset: {
    skyTop: 0x25203f,
    skyHorizon: 0xc0634d,
    mountainFar: 0x4a4051,
    mountainNear: 0x293038,
    terrain: 0x0b1815,
    structureBase: 0x4d3129,
    structureAccent: 0xd07750,
    celestial: 0xffbd72,
    celestialAlpha: 0.8,
    celestialX: 1205,
    celestialY: 345,
    starAlpha: 0.12,
    hazeAlpha: 0.22,
    lamp: 0x8dffe5,
  },
  night: {
    skyTop: 0x050d1c,
    skyHorizon: 0x102b3a,
    mountainFar: 0x17313d,
    mountainNear: 0x0d232a,
    terrain: 0x06110f,
    structureBase: 0x30271f,
    structureAccent: 0x846044,
    celestial: 0xdde9ff,
    celestialAlpha: 0.66,
    celestialX: 1280,
    celestialY: 188,
    starAlpha: 0.78,
    hazeAlpha: 0.065,
    lamp: 0x72ffe1,
  },
}

const WEATHER_PRESENTATION: Record<WorldRenderSnapshot['weather'], {
  cloudAlpha: number
  rainAlpha: number
  stormFlashAlpha: number
  celestialVisibility: number
  hazeBoost: number
  shade: number
}> = {
  neutral: { cloudAlpha: 0, rainAlpha: 0, stormFlashAlpha: 0, celestialVisibility: 1, hazeBoost: 0, shade: 0 },
  clear: { cloudAlpha: 0.04, rainAlpha: 0, stormFlashAlpha: 0, celestialVisibility: 1, hazeBoost: 0, shade: 0 },
  cloudy: { cloudAlpha: 0.44, rainAlpha: 0, stormFlashAlpha: 0, celestialVisibility: 0.66, hazeBoost: 0.045, shade: 0.08 },
  rain: { cloudAlpha: 0.6, rainAlpha: 0.46, stormFlashAlpha: 0, celestialVisibility: 0.38, hazeBoost: 0.085, shade: 0.15 },
  storm: { cloudAlpha: 0.76, rainAlpha: 0.72, stormFlashAlpha: 0.17, celestialVisibility: 0.16, hazeBoost: 0.12, shade: 0.25 },
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function shadeColor(color: number, amount: number) {
  const factor = 1 - clamp01(amount)
  const red = Math.round(((color >> 16) & 0xff) * factor)
  const green = Math.round(((color >> 8) & 0xff) * factor)
  const blue = Math.round((color & 0xff) * factor)
  return (red << 16) | (green << 8) | blue
}

/**
 * Pure presentation mapping for the Living World renderer.
 *
 * Time and weather are already-resolved WorldState fields before this boundary. This
 * module only chooses visual parameters; it never derives weather from money, returns,
 * broker data or any other financial signal. Unknown/missing weather is normalized to
 * `neutral` upstream, where weather-specific effects remain disabled.
 *
 * Reviewed weather may darken the already-selected phase palette so rain/storm reads
 * through the whole scene instead of only adding particles. Settlement lamps are kept
 * unshaded, preserving readable local warmth without creating a second lighting state.
 */
export function buildWorldAtmospherePresentation(input: AtmosphereInput): WorldAtmospherePresentation {
  const phase = PHASE_PALETTES[input.timePhase]
  const weather = WEATHER_PRESENTATION[input.weather]

  return {
    version: WORLD_ATMOSPHERE_PRESENTATION_VERSION,
    ...phase,
    skyTop: shadeColor(phase.skyTop, weather.shade),
    skyHorizon: shadeColor(phase.skyHorizon, weather.shade * 0.72),
    mountainFar: shadeColor(phase.mountainFar, weather.shade),
    mountainNear: shadeColor(phase.mountainNear, weather.shade),
    terrain: shadeColor(phase.terrain, weather.shade * 0.8),
    structureBase: shadeColor(phase.structureBase, weather.shade * 0.72),
    structureAccent: shadeColor(phase.structureAccent, weather.shade * 0.55),
    celestialAlpha: clamp01(phase.celestialAlpha * weather.celestialVisibility),
    hazeAlpha: clamp01(phase.hazeAlpha + weather.hazeBoost),
    cloudAlpha: clamp01(weather.cloudAlpha),
    rainAlpha: clamp01(weather.rainAlpha),
    stormFlashAlpha: clamp01(weather.stormFlashAlpha),
  }
}
