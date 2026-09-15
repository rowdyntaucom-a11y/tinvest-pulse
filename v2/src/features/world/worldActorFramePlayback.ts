import type { WorldActorAnimationClipSpec } from './worldActorAtlasManifest'

export const WORLD_ACTOR_FRAME_PLAYBACK_VERSION = '0.1' as const

export type WorldActorFramePlayback = {
  version: typeof WORLD_ACTOR_FRAME_PLAYBACK_VERSION
  frameIndex: number
  normalizedProgress: number
  terminal: boolean
}

function clampUnit(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

/**
 * Maps choreography-local action progress to a reviewed atlas frame.
 *
 * Frame selection is deterministic and independent of wall-clock time. This is
 * important because route/action meaning lives in worldActorChoreography rather
 * than in Pixi. Looping clips wrap at the segment boundary; non-looping clips
 * deliberately settle on their final frame.
 */
export function resolveWorldActorFramePlayback(
  clip: WorldActorAnimationClipSpec,
  actionProgressInput: number,
  freezeFrame: boolean,
): WorldActorFramePlayback {
  const frameCount = Number.isInteger(clip.frameCount) && clip.frameCount > 0 ? clip.frameCount : 1
  const progress = freezeFrame ? 0 : clampUnit(actionProgressInput)

  if (freezeFrame || frameCount === 1) {
    return {
      version: WORLD_ACTOR_FRAME_PLAYBACK_VERSION,
      frameIndex: 0,
      normalizedProgress: progress,
      terminal: !clip.loop && progress >= 1,
    }
  }

  if (clip.loop) {
    const loopProgress = progress >= 1 ? 0 : progress
    return {
      version: WORLD_ACTOR_FRAME_PLAYBACK_VERSION,
      frameIndex: Math.min(frameCount - 1, Math.floor(loopProgress * frameCount)),
      normalizedProgress: loopProgress,
      terminal: false,
    }
  }

  return {
    version: WORLD_ACTOR_FRAME_PLAYBACK_VERSION,
    frameIndex: Math.min(frameCount - 1, Math.floor(progress * frameCount)),
    normalizedProgress: progress,
    terminal: progress >= 1,
  }
}
