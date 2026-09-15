import type { WorldAmbientActorPlan, WorldAmbientActorRole } from './worldAmbientActivityPresentation'

export const WORLD_AMBIENT_ACTOR_CHOREOGRAPHY_VERSION = '0.1' as const
export const WORLD_PRIMARY_WORK_CHAIN_PACE = 0.62 as const
export const WORLD_PRIMARY_WORK_CHAIN_PHASE: Readonly<Record<'miner' | 'hauler' | 'builder', number>> = {
  miner: 0.04,
  hauler: 0.18,
  builder: 0.5,
}

export type WorldAmbientActorAction = 'idle' | 'walk' | 'carry' | 'work'

export type WorldAmbientActorChoreography = {
  version: typeof WORLD_AMBIENT_ACTOR_CHOREOGRAPHY_VERSION
  action: WorldAmbientActorAction
  actionProgress: number
  showLoad: boolean
  showWorkCue: boolean
  motionScale: number
}

const wrap01 = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return ((value % 1) + 1) % 1
}

const segmentProgress = (value: number, start: number, end: number) => {
  if (end <= start) return 0
  return Math.max(0, Math.min(1, (value - start) / (end - start)))
}

export function resolveWorldPrimaryWorkChainTiming(role: WorldAmbientActorRole) {
  if (role !== 'miner' && role !== 'hauler' && role !== 'builder') return null
  return {
    phaseOffset: WORLD_PRIMARY_WORK_CHAIN_PHASE[role],
    pace: WORLD_PRIMARY_WORK_CHAIN_PACE,
  }
}

/**
 * Presentation-only actor choreography for the procedural Living World fallback.
 *
 * It creates a readable visual grammar — extraction, delivery and construction —
 * without modelling inventory, production output, capital, rewards or XP amounts.
 * `motionScale` is zero under reduced motion so the renderer can keep a semantic
 * pose visible without continuous locomotion.
 */
export function resolveWorldAmbientActorChoreography(input: {
  actor: Pick<WorldAmbientActorPlan, 'role' | 'route'>
  phase: number
  reducedMotion?: boolean
}): WorldAmbientActorChoreography {
  const phase = wrap01(input.phase)
  const reducedMotion = input.reducedMotion ?? false

  let action: WorldAmbientActorAction = 'walk'
  let actionProgress = phase
  let showLoad = false
  let showWorkCue = false

  switch (input.actor.role) {
    case 'miner': {
      const atMine = phase <= 0.1 || phase >= 0.9
      if (atMine) {
        action = 'work'
        showWorkCue = true
        actionProgress = phase <= 0.1
          ? segmentProgress(phase, 0, 0.1)
          : segmentProgress(phase, 0.9, 1)
      }
      break
    }
    case 'hauler': {
      if (phase >= 0.08 && phase <= 0.48) {
        action = 'carry'
        showLoad = true
        actionProgress = segmentProgress(phase, 0.08, 0.48)
      } else if (phase < 0.08 || phase > 0.92) {
        action = 'idle'
        actionProgress = phase < 0.08
          ? segmentProgress(phase, 0, 0.08)
          : segmentProgress(phase, 0.92, 1)
      }
      break
    }
    case 'builder': {
      if (phase >= 0.42 && phase <= 0.58) {
        action = 'work'
        showWorkCue = true
        actionProgress = segmentProgress(phase, 0.42, 0.58)
      }
      break
    }
    case 'keeper': {
      if (phase >= 0.44 && phase <= 0.62) {
        action = 'work'
        showWorkCue = true
        actionProgress = segmentProgress(phase, 0.44, 0.62)
      } else if (phase < 0.08 || phase > 0.92) {
        action = 'idle'
      }
      break
    }
    case 'resident': {
      if (phase < 0.12 || phase > 0.88) {
        action = 'idle'
        actionProgress = phase < 0.12
          ? segmentProgress(phase, 0, 0.12)
          : segmentProgress(phase, 0.88, 1)
      }
      break
    }
  }

  return {
    version: WORLD_AMBIENT_ACTOR_CHOREOGRAPHY_VERSION,
    action,
    actionProgress: Math.max(0, Math.min(1, actionProgress)),
    showLoad,
    showWorkCue,
    motionScale: reducedMotion || action === 'idle' || action === 'work' ? 0 : 1,
  }
}
