import type { WorldActorPlan } from './worldLivingPresentation'

export const WORLD_ACTOR_CHOREOGRAPHY_VERSION = '0.1' as const

export type WorldActorAction = 'idle' | 'walk' | 'carry' | 'work'

export type WorldActorChoreography = {
  version: typeof WORLD_ACTOR_CHOREOGRAPHY_VERSION
  routePhase: number
  action: WorldActorAction
  carryLoad: boolean
  atEndpoint: boolean
}

const START_HOLD_END = 0.12
const OUTBOUND_END = 0.44
const END_HOLD_END = 0.58
const INBOUND_END = 0.9

function wrapUnit(value: number) {
  if (!Number.isFinite(value)) return 0
  return ((value % 1) + 1) % 1
}

function interpolate(value: number, start: number, end: number, from: number, to: number) {
  if (end <= start) return from
  const progress = Math.max(0, Math.min(1, (value - start) / (end - start)))
  return from + (to - from) * progress
}

function endpointAction(role: WorldActorPlan['role']): WorldActorAction {
  return role === 'resident' ? 'idle' : 'work'
}

function carriesOutbound(role: WorldActorPlan['role']) {
  return role === 'miner' || role === 'hauler' || role === 'builder'
}

/**
 * Turns a continuously advancing actor cycle into a small deterministic work loop:
 * pause/work at the origin, travel out, pause/work at the destination, then return.
 *
 * This policy is presentation-only. It does not inspect portfolio data, XP totals,
 * broker state or financial calculations and it never mutates WorldState.
 */
export function resolveWorldActorChoreography(
  plan: WorldActorPlan,
  cycleInput: number,
): WorldActorChoreography {
  const cycle = wrapUnit(cycleInput)
  const endpoint = endpointAction(plan.role)

  if (cycle < START_HOLD_END) {
    return {
      version: WORLD_ACTOR_CHOREOGRAPHY_VERSION,
      routePhase: 0,
      action: endpoint,
      carryLoad: false,
      atEndpoint: true,
    }
  }

  if (cycle < OUTBOUND_END) {
    const carryLoad = carriesOutbound(plan.role)
    return {
      version: WORLD_ACTOR_CHOREOGRAPHY_VERSION,
      routePhase: interpolate(cycle, START_HOLD_END, OUTBOUND_END, 0, 0.5),
      action: carryLoad ? 'carry' : 'walk',
      carryLoad,
      atEndpoint: false,
    }
  }

  if (cycle < END_HOLD_END) {
    return {
      version: WORLD_ACTOR_CHOREOGRAPHY_VERSION,
      routePhase: 0.5,
      action: endpoint,
      carryLoad: false,
      atEndpoint: true,
    }
  }

  if (cycle < INBOUND_END) {
    return {
      version: WORLD_ACTOR_CHOREOGRAPHY_VERSION,
      routePhase: interpolate(cycle, END_HOLD_END, INBOUND_END, 0.5, 1),
      action: 'walk',
      carryLoad: false,
      atEndpoint: false,
    }
  }

  return {
    version: WORLD_ACTOR_CHOREOGRAPHY_VERSION,
    routePhase: 1,
    action: endpoint,
    carryLoad: false,
    atEndpoint: true,
  }
}
