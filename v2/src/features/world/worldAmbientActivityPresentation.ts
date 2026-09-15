import type { WorldRenderSnapshot } from '../dna/worldRenderSnapshot'

export const WORLD_AMBIENT_ACTIVITY_VERSION = '0.1' as const
export const WORLD_PRIMARY_WORK_CHAIN_PACE = 0.62 as const
export const WORLD_PRIMARY_WORK_CHAIN_PHASE = {
  miner: 0.04,
  hauler: 0.18,
  builder: 0.5,
} as const

export type WorldAmbientActorRole = 'miner' | 'hauler' | 'builder' | 'keeper' | 'resident'
export type WorldAmbientActorRoute = 'mine-loop' | 'haul-loop' | 'build-loop' | 'yard-loop' | 'resident-loop'

export type WorldAmbientActorPlan = {
  id: string
  role: WorldAmbientActorRole
  route: WorldAmbientActorRoute
  phaseOffset: number
  pace: number
  scale: number
  minLevel: number
}

export type WorldAmbientActivityPresentation = {
  version: typeof WORLD_AMBIENT_ACTIVITY_VERSION
  activityScale: number
  actors: WorldAmbientActorPlan[]
  cartCount: number
}

/**
 * Procedural fallback inhabitants. They are intentionally presentation-only:
 * no actor carries inventory, money, production output, rewards or broker data.
 * Reviewed sprite art can later replace these silhouettes without changing the
 * WorldRenderSnapshot contract.
 *
 * The primary `*-a` trio is intentionally phase-locked so the current fallback
 * renderer reads as extraction → delivery → construction on one visual clock.
 */
export const WORLD_AMBIENT_ACTOR_SLOTS: readonly WorldAmbientActorPlan[] = [
  { id: 'miner-a', role: 'miner', route: 'mine-loop', phaseOffset: WORLD_PRIMARY_WORK_CHAIN_PHASE.miner, pace: WORLD_PRIMARY_WORK_CHAIN_PACE, scale: 1, minLevel: 1 },
  { id: 'hauler-a', role: 'hauler', route: 'haul-loop', phaseOffset: WORLD_PRIMARY_WORK_CHAIN_PHASE.hauler, pace: WORLD_PRIMARY_WORK_CHAIN_PACE, scale: 0.98, minLevel: 1 },
  { id: 'builder-a', role: 'builder', route: 'build-loop', phaseOffset: WORLD_PRIMARY_WORK_CHAIN_PHASE.builder, pace: WORLD_PRIMARY_WORK_CHAIN_PACE, scale: 1.03, minLevel: 2 },
  { id: 'keeper-a', role: 'keeper', route: 'yard-loop', phaseOffset: 0.72, pace: 0.44, scale: 0.96, minLevel: 3 },
  { id: 'resident-a', role: 'resident', route: 'resident-loop', phaseOffset: 0.37, pace: 0.36, scale: 0.94, minLevel: 4 },
  { id: 'miner-b', role: 'miner', route: 'mine-loop', phaseOffset: 0.63, pace: 0.82, scale: 0.95, minLevel: 5 },
  { id: 'hauler-b', role: 'hauler', route: 'haul-loop', phaseOffset: 0.16, pace: 0.7, scale: 0.94, minLevel: 6 },
  { id: 'builder-b', role: 'builder', route: 'build-loop', phaseOffset: 0.81, pace: 0.62, scale: 0.98, minLevel: 8 },
] as const

const PHASE_ACTIVITY: Record<WorldRenderSnapshot['timePhase'], number> = {
  dawn: 0.78,
  day: 1,
  sunset: 0.84,
  night: 0.54,
}

const PHASE_ROLE_PACE: Record<WorldRenderSnapshot['timePhase'], Record<WorldAmbientActorRole, number>> = {
  dawn: { miner: 0.9, hauler: 0.9, builder: 0.9, keeper: 0.96, resident: 0.76 },
  day: { miner: 1, hauler: 1, builder: 1, keeper: 0.94, resident: 0.88 },
  sunset: { miner: 0.8, hauler: 0.8, builder: 0.8, keeper: 1.02, resident: 1.14 },
  night: { miner: 0.58, hauler: 0.58, builder: 0.58, keeper: 0.92, resident: 0.74 },
}

const WEATHER_ACTIVITY: Record<WorldRenderSnapshot['weather'], number> = {
  neutral: 1,
  clear: 1,
  cloudy: 0.92,
  rain: 0.72,
  storm: 0.46,
}

function safeLevel(level: number) {
  if (!Number.isFinite(level)) return 1
  return Math.max(1, Math.min(99, Math.floor(level)))
}

function phaseAdjustedActor(actor: WorldAmbientActorPlan, timePhase: WorldRenderSnapshot['timePhase']): WorldAmbientActorPlan {
  const roleMultiplier = PHASE_ROLE_PACE[timePhase][actor.role]
  return {
    ...actor,
    pace: actor.pace * roleMultiplier,
  }
}

function visibleCartCount(level: number, timePhase: WorldRenderSnapshot['timePhase'], weather: WorldRenderSnapshot['weather']) {
  const baseCount = level >= 7 ? 2 : level >= 2 ? 1 : 0
  if (baseCount === 0) return 0
  if (timePhase === 'night' || weather === 'storm') return Math.min(1, baseCount)
  return baseCount
}

/**
 * Converts only already-resolved Living World state into restrained ambient motion.
 * `neutral` is deliberately equivalent to ordinary activity: it does not imply clear
 * weather or any other invented condition. Explicit rain/storm may slow movement,
 * but they never change portfolio/DNA progression or create financial meaning.
 *
 * Time-of-day rhythm is presentation-only. It changes the cadence of existing actor
 * loops so the settlement feels different at dawn/day/sunset/night while preserving
 * the same inhabitants, routes and semantic work-chain. It does not model working
 * hours, production capacity, inventory or any financial outcome.
 */
export function buildWorldAmbientActivityPresentation(
  snapshot: Pick<WorldRenderSnapshot, 'level' | 'timePhase' | 'weather'>,
): WorldAmbientActivityPresentation {
  const level = safeLevel(snapshot.level)
  const activityScale = PHASE_ACTIVITY[snapshot.timePhase] * WEATHER_ACTIVITY[snapshot.weather]

  return {
    version: WORLD_AMBIENT_ACTIVITY_VERSION,
    activityScale,
    actors: WORLD_AMBIENT_ACTOR_SLOTS
      .filter(actor => actor.minLevel <= level)
      .map(actor => phaseAdjustedActor(actor, snapshot.timePhase)),
    cartCount: visibleCartCount(level, snapshot.timePhase, snapshot.weather),
  }
}
