import type { WorldRenderSnapshot } from '../dna/worldRenderSnapshot'
import {
  resolveWorldPrimaryWorkChainTiming,
} from './worldAmbientActorChoreography'

export const WORLD_AMBIENT_ACTIVITY_VERSION = '0.1' as const

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
 */
export const WORLD_AMBIENT_ACTOR_SLOTS: readonly WorldAmbientActorPlan[] = [
  { id: 'miner-a', role: 'miner', route: 'mine-loop', phaseOffset: 0.08, pace: 0.72, scale: 1, minLevel: 1 },
  { id: 'hauler-a', role: 'hauler', route: 'haul-loop', phaseOffset: 0.54, pace: 0.66, scale: 0.98, minLevel: 1 },
  { id: 'builder-a', role: 'builder', route: 'build-loop', phaseOffset: 0.26, pace: 0.58, scale: 1.03, minLevel: 2 },
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

function synchronizedActorPlan(actor: WorldAmbientActorPlan): WorldAmbientActorPlan {
  if (!actor.id.endsWith('-a')) return { ...actor }
  const timing = resolveWorldPrimaryWorkChainTiming(actor.role)
  if (!timing) return { ...actor }
  return {
    ...actor,
    phaseOffset: timing.phaseOffset,
    pace: timing.pace,
  }
}

/**
 * Converts only already-resolved Living World state into restrained ambient motion.
 * `neutral` is deliberately equivalent to ordinary activity: it does not imply clear
 * weather or any other invented condition. Explicit rain/storm may slow movement,
 * but they never change portfolio/DNA progression or create financial meaning.
 *
 * The primary miner/hauler/builder trio shares one visual clock with staggered phases.
 * This makes extraction → delivery → construction legible without creating inventory,
 * throughput or any simulation of portfolio economics.
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
      .map(synchronizedActorPlan),
    cartCount: level >= 7 ? 2 : level >= 2 ? 1 : 0,
  }
}
