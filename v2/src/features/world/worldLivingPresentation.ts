import type { WorldRenderSnapshot } from '../dna/worldRenderSnapshot'
import type { WorldEventPresentationChannel } from './worldEventPresentation'

export const WORLD_LIVING_PRESENTATION_VERSION = '0.1' as const

export type WorldActorRole = 'miner' | 'hauler' | 'builder' | 'keeper' | 'resident'
export type WorldActorRoute = 'mine-loop' | 'haul-loop' | 'build-loop' | 'yard-loop' | 'resident-loop'

export type WorldActorPlan = {
  id: string
  role: WorldActorRole
  route: WorldActorRoute
  phaseOffset: number
  pace: number
  scale: number
  minLevel: number
}

export type WorldWeatherPresentation = {
  hazeAlpha: number
  rainAlpha: number
  rainSpeed: number
  lightning: boolean
}

export type WorldLivingPresentation = {
  version: typeof WORLD_LIVING_PRESENTATION_VERSION
  activityScale: number
  lightScale: number
  skyTint: number
  atmosphereTint: number
  weather: WorldWeatherPresentation
  actors: WorldActorPlan[]
  cartCount: number
  constructionActivity: number
  eventAccent: WorldEventPresentationChannel | null
}

const ACTOR_SLOTS: readonly WorldActorPlan[] = [
  { id: 'miner-a', role: 'miner', route: 'mine-loop', phaseOffset: 0.03, pace: 0.92, scale: 1, minLevel: 1 },
  { id: 'hauler-a', role: 'hauler', route: 'haul-loop', phaseOffset: 0.42, pace: 0.78, scale: 0.98, minLevel: 1 },
  { id: 'builder-a', role: 'builder', route: 'build-loop', phaseOffset: 0.17, pace: 0.7, scale: 1.03, minLevel: 2 },
  { id: 'keeper-a', role: 'keeper', route: 'yard-loop', phaseOffset: 0.66, pace: 0.48, scale: 0.96, minLevel: 3 },
  { id: 'resident-a', role: 'resident', route: 'resident-loop', phaseOffset: 0.29, pace: 0.38, scale: 0.94, minLevel: 4 },
  { id: 'miner-b', role: 'miner', route: 'mine-loop', phaseOffset: 0.71, pace: 0.86, scale: 0.96, minLevel: 5 },
  { id: 'hauler-b', role: 'hauler', route: 'haul-loop', phaseOffset: 0.11, pace: 0.74, scale: 0.95, minLevel: 6 },
  { id: 'builder-b', role: 'builder', route: 'build-loop', phaseOffset: 0.83, pace: 0.66, scale: 0.98, minLevel: 8 },
] as const

const PHASE_POLICY = {
  dawn: { activityScale: 0.78, lightScale: 0.72, skyTint: 0x173344, atmosphereTint: 0x315768 },
  day: { activityScale: 1, lightScale: 0.46, skyTint: 0x23495a, atmosphereTint: 0x3c6874 },
  sunset: { activityScale: 0.86, lightScale: 0.82, skyTint: 0x302d3b, atmosphereTint: 0x6a4a46 },
  night: { activityScale: 0.58, lightScale: 1, skyTint: 0x081d2a, atmosphereTint: 0x173339 },
} as const satisfies Record<WorldRenderSnapshot['timePhase'], {
  activityScale: number
  lightScale: number
  skyTint: number
  atmosphereTint: number
}>

const WEATHER_POLICY = {
  neutral: { hazeAlpha: 0, rainAlpha: 0, rainSpeed: 0, lightning: false },
  clear: { hazeAlpha: 0.05, rainAlpha: 0, rainSpeed: 0, lightning: false },
  cloudy: { hazeAlpha: 0.2, rainAlpha: 0, rainSpeed: 0, lightning: false },
  rain: { hazeAlpha: 0.28, rainAlpha: 0.38, rainSpeed: 1, lightning: false },
  storm: { hazeAlpha: 0.38, rainAlpha: 0.62, rainSpeed: 1.5, lightning: true },
} as const satisfies Record<WorldRenderSnapshot['weather'], WorldWeatherPresentation>

const EVENT_KIND_TO_CHANNEL: Readonly<Record<string, WorldEventPresentationChannel>> = {
  'xp:CONTRIBUTION_HABIT': 'discipline',
  'xp:HEALTH_MILESTONE': 'health',
  'xp:PERFORMANCE_PERIOD': 'performance',
  'xp:PASSIVE_INCOME_GROWTH': 'income',
  'xp:PLAN_ADHERENCE': 'strategy',
  'xp:ACHIEVEMENT': 'achievement',
}

function clampLevel(level: number) {
  return Number.isFinite(level) ? Math.max(1, Math.min(99, Math.floor(level))) : 1
}

function primaryEventAccent(snapshot: WorldRenderSnapshot): WorldEventPresentationChannel | null {
  const event = snapshot.pendingEvents[0]
  if (!event) return null
  return EVENT_KIND_TO_CHANNEL[event.kind] ?? 'generic'
}

/**
 * Presentation-only policy for Living World motion and atmosphere.
 *
 * It consumes only the already-resolved renderer snapshot. It never inspects cash,
 * returns, XP totals, broker data or portfolio metrics and therefore cannot invent
 * financial meaning. `neutral` weather stays visually neutral; only an explicitly
 * resolved weather state may enable rain/storm effects.
 */
export function buildWorldLivingPresentation(snapshot: WorldRenderSnapshot): WorldLivingPresentation {
  const level = clampLevel(snapshot.level)
  const phase = PHASE_POLICY[snapshot.timePhase]
  const actors = ACTOR_SLOTS.filter(actor => actor.minLevel <= level).map(actor => ({ ...actor }))

  return {
    version: WORLD_LIVING_PRESENTATION_VERSION,
    activityScale: phase.activityScale,
    lightScale: phase.lightScale,
    skyTint: phase.skyTint,
    atmosphereTint: phase.atmosphereTint,
    weather: { ...WEATHER_POLICY[snapshot.weather] },
    actors,
    cartCount: level >= 7 ? 2 : level >= 2 ? 1 : 0,
    constructionActivity: level >= 9 ? 1 : level >= 5 ? 0.8 : level >= 2 ? 0.55 : 0.28,
    eventAccent: primaryEventAccent(snapshot),
  }
}
