import type { WorldActorAction } from './worldActorChoreography'
import type {
  ResolvedWorldActorAtlasManifest,
  WorldActorAnimationClipSpec,
} from './worldActorAtlasManifest'
import type { WorldActorRole } from './worldLivingPresentation'

export const WORLD_ACTOR_ANIMATION_SELECTION_VERSION = '0.1' as const

export type WorldActorAnimationSelection =
  | {
      version: typeof WORLD_ACTOR_ANIMATION_SELECTION_VERSION
      renderer: 'reviewed-atlas'
      role: WorldActorRole
      action: WorldActorAction
      clip: WorldActorAnimationClipSpec
      effectiveFps: number
      freezeFrame: boolean
    }
  | {
      version: typeof WORLD_ACTOR_ANIMATION_SELECTION_VERSION
      renderer: 'procedural-fallback'
      role: WorldActorRole
      action: WorldActorAction
      reason: 'NO_REVIEWED_ATLAS' | 'MISSING_CLIP'
    }

/**
 * Selects the reviewed visual clip for an already-resolved choreography action.
 *
 * This is deliberately presentation-only. It cannot invent an action, mutate XP,
 * read portfolio data or reinterpret financial events. If a complete reviewed
 * atlas is unavailable, runtime must keep the procedural fallback visible.
 */
export function resolveWorldActorAnimationSelection(
  manifest: ResolvedWorldActorAtlasManifest,
  role: WorldActorRole,
  action: WorldActorAction,
  reducedMotion: boolean,
): WorldActorAnimationSelection {
  const atlas = manifest.entries.get(role)
  if (!atlas) {
    return {
      version: WORLD_ACTOR_ANIMATION_SELECTION_VERSION,
      renderer: 'procedural-fallback',
      role,
      action,
      reason: 'NO_REVIEWED_ATLAS',
    }
  }

  const clip = atlas.animations.find(candidate => candidate.action === action)
  if (!clip) {
    return {
      version: WORLD_ACTOR_ANIMATION_SELECTION_VERSION,
      renderer: 'procedural-fallback',
      role,
      action,
      reason: 'MISSING_CLIP',
    }
  }

  return {
    version: WORLD_ACTOR_ANIMATION_SELECTION_VERSION,
    renderer: 'reviewed-atlas',
    role,
    action,
    clip,
    effectiveFps: reducedMotion ? 0 : clip.fps,
    freezeFrame: reducedMotion,
  }
}
