import type { WorldActorAction } from './worldActorChoreography'
import type { WorldActorAtlasManifestEntry } from './worldActorAtlasManifest'

export const WORLD_ACTOR_ATLAS_DOCUMENT_VERSION = '0.1' as const

const DOCUMENT_ACTIONS: readonly WorldActorAction[] = ['idle', 'walk', 'carry', 'work'] as const

export type WorldActorAtlasFrame = {
  x: number
  y: number
  width: number
  height: number
}

export type WorldActorAtlasDocument = {
  version: typeof WORLD_ACTOR_ATLAS_DOCUMENT_VERSION
  imageWidth: number
  imageHeight: number
  animations: Readonly<Record<WorldActorAction, readonly WorldActorAtlasFrame[]>>
}

function boundedInteger(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function normalizeFrame(
  value: unknown,
  expectedWidth: number,
  expectedHeight: number,
  imageWidth: number,
  imageHeight: number,
): WorldActorAtlasFrame | null {
  if (!value || typeof value !== 'object') return null
  const frame = value as Partial<WorldActorAtlasFrame>
  if (!boundedInteger(frame.x, 0, imageWidth - 1)) return null
  if (!boundedInteger(frame.y, 0, imageHeight - 1)) return null
  if (frame.width !== expectedWidth || frame.height !== expectedHeight) return null
  if (frame.x + expectedWidth > imageWidth || frame.y + expectedHeight > imageHeight) return null
  return {
    x: frame.x,
    y: frame.y,
    width: expectedWidth,
    height: expectedHeight,
  }
}

/**
 * Validates one local reviewed actor atlas document against its reviewed manifest
 * entry. The renderer may consume only a document that matches image bounds,
 * exact frame size and exact per-action frame counts.
 */
export function resolveWorldActorAtlasDocument(
  input: unknown,
  manifestEntry: WorldActorAtlasManifestEntry,
): WorldActorAtlasDocument | null {
  if (!input || typeof input !== 'object') return null
  const candidate = input as {
    version?: unknown
    imageWidth?: unknown
    imageHeight?: unknown
    animations?: unknown
  }

  if (candidate.version !== WORLD_ACTOR_ATLAS_DOCUMENT_VERSION) return null
  if (!boundedInteger(candidate.imageWidth, manifestEntry.frameWidth, 8192)) return null
  if (!boundedInteger(candidate.imageHeight, manifestEntry.frameHeight, 8192)) return null
  if (!candidate.animations || typeof candidate.animations !== 'object' || Array.isArray(candidate.animations)) return null

  const imageWidth = candidate.imageWidth
  const imageHeight = candidate.imageHeight
  const sourceAnimations = candidate.animations as Record<string, unknown>
  const normalized = {} as Record<WorldActorAction, readonly WorldActorAtlasFrame[]>

  for (const action of DOCUMENT_ACTIONS) {
    const clipSpec = manifestEntry.animations.find(clip => clip.action === action)
    if (!clipSpec) return null
    const frames = sourceAnimations[action]
    if (!Array.isArray(frames) || frames.length !== clipSpec.frameCount) return null
    const normalizedFrames: WorldActorAtlasFrame[] = []
    for (const frame of frames) {
      const normalizedFrame = normalizeFrame(
        frame,
        manifestEntry.frameWidth,
        manifestEntry.frameHeight,
        imageWidth,
        imageHeight,
      )
      if (!normalizedFrame) return null
      normalizedFrames.push(normalizedFrame)
    }
    normalized[action] = normalizedFrames
  }

  if (Object.keys(sourceAnimations).some(action => !DOCUMENT_ACTIONS.includes(action as WorldActorAction))) return null

  return {
    version: WORLD_ACTOR_ATLAS_DOCUMENT_VERSION,
    imageWidth,
    imageHeight,
    animations: normalized,
  }
}
