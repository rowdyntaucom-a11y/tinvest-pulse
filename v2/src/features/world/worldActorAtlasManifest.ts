import type { WorldActorAction } from './worldActorChoreography'
import type { WorldActorRole } from './worldLivingPresentation'

export const WORLD_ACTOR_ATLAS_MANIFEST_VERSION = '0.1' as const

export const WORLD_ACTOR_ACTIONS: readonly WorldActorAction[] = ['idle', 'walk', 'carry', 'work'] as const
export const WORLD_ACTOR_ROLES: readonly WorldActorRole[] = ['miner', 'hauler', 'builder', 'keeper', 'resident'] as const

export type WorldActorAnimationClipSpec = {
  action: WorldActorAction
  frameCount: number
  fps: number
  loop: boolean
}

export type WorldActorAtlasProvenance = {
  source: 'figma-export' | 'reviewed-local'
  fileKey?: string
  nodeId?: string
  reviewedAt: string
}

export type WorldActorAtlasManifestEntry = {
  role: WorldActorRole
  imagePath: string
  atlasPath: string
  frameWidth: number
  frameHeight: number
  animations: readonly WorldActorAnimationClipSpec[]
  provenance: WorldActorAtlasProvenance
}

export type ResolvedWorldActorAtlasManifest = {
  version: typeof WORLD_ACTOR_ATLAS_MANIFEST_VERSION
  entries: ReadonlyMap<WorldActorRole, WorldActorAtlasManifestEntry>
  rejectedCount: number
}

const ROLE_SET = new Set<string>(WORLD_ACTOR_ROLES)
const ACTION_SET = new Set<string>(WORLD_ACTOR_ACTIONS)
const LOCAL_WORLD_IMAGE = /^\/assets\/world\/[A-Za-z0-9._/-]+\.(?:png|webp)$/
const LOCAL_WORLD_ATLAS = /^\/assets\/world\/[A-Za-z0-9._/-]+\.json$/
const FIGMA_NODE_ID = /^\d+[:\-]\d+$/
const FIGMA_FILE_KEY = /^[0-9A-Za-z]{22,128}$/

function hasUnsafePathSegment(path: string) {
  return path.includes('..') || path.includes('?') || path.includes('#') || path.includes('\\') || path.includes('//')
}

function isIsoTimestamp(value: string) {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value
}

function positiveInteger(value: unknown, max: number) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= max
}

function positiveFinite(value: unknown, max: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= max
}

function normalizeAnimations(value: unknown): readonly WorldActorAnimationClipSpec[] | null {
  if (!Array.isArray(value)) return null
  const clips = new Map<WorldActorAction, WorldActorAnimationClipSpec>()

  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') return null
    const clip = candidate as Partial<WorldActorAnimationClipSpec>
    if (typeof clip.action !== 'string' || !ACTION_SET.has(clip.action) || clips.has(clip.action as WorldActorAction)) return null
    if (!positiveInteger(clip.frameCount, 48) || !positiveFinite(clip.fps, 30) || typeof clip.loop !== 'boolean') return null
    clips.set(clip.action as WorldActorAction, {
      action: clip.action as WorldActorAction,
      frameCount: clip.frameCount,
      fps: clip.fps,
      loop: clip.loop,
    })
  }

  // Production actor packs are intentionally strict: every reviewed role must
  // include all four choreography states so runtime fallback is never silently
  // mistaken for finished art.
  if (WORLD_ACTOR_ACTIONS.some(action => !clips.has(action))) return null
  return WORLD_ACTOR_ACTIONS.map(action => clips.get(action)!)
}

function normalizeEntry(value: unknown): WorldActorAtlasManifestEntry | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<WorldActorAtlasManifestEntry>
  if (typeof candidate.role !== 'string' || !ROLE_SET.has(candidate.role)) return null
  if (typeof candidate.imagePath !== 'string' || hasUnsafePathSegment(candidate.imagePath) || !LOCAL_WORLD_IMAGE.test(candidate.imagePath)) return null
  if (typeof candidate.atlasPath !== 'string' || hasUnsafePathSegment(candidate.atlasPath) || !LOCAL_WORLD_ATLAS.test(candidate.atlasPath)) return null
  if (!positiveInteger(candidate.frameWidth, 1024) || !positiveInteger(candidate.frameHeight, 1024)) return null

  const animations = normalizeAnimations(candidate.animations)
  if (!animations) return null

  const provenance = candidate.provenance
  if (!provenance || typeof provenance !== 'object') return null
  if (provenance.source !== 'figma-export' && provenance.source !== 'reviewed-local') return null
  if (typeof provenance.reviewedAt !== 'string' || !isIsoTimestamp(provenance.reviewedAt)) return null
  if (provenance.source === 'figma-export') {
    if (typeof provenance.fileKey !== 'string' || !FIGMA_FILE_KEY.test(provenance.fileKey)) return null
    if (typeof provenance.nodeId !== 'string' || !FIGMA_NODE_ID.test(provenance.nodeId)) return null
  }

  return {
    role: candidate.role as WorldActorRole,
    imagePath: candidate.imagePath,
    atlasPath: candidate.atlasPath,
    frameWidth: candidate.frameWidth,
    frameHeight: candidate.frameHeight,
    animations,
    provenance: {
      source: provenance.source,
      ...(provenance.fileKey ? { fileKey: provenance.fileKey } : {}),
      ...(provenance.nodeId ? { nodeId: provenance.nodeId } : {}),
      reviewedAt: provenance.reviewedAt,
    },
  }
}

/**
 * Fail-closed production contract for reviewed Living World actor atlases.
 *
 * The manifest deliberately contains no financial semantics, XP weights or
 * gameplay outcomes. It only proves that a local reviewed role pack exists and
 * exposes the animation states already emitted by worldActorChoreography.
 */
export function resolveWorldActorAtlasManifest(input: unknown): ResolvedWorldActorAtlasManifest {
  if (!Array.isArray(input)) {
    return { version: WORLD_ACTOR_ATLAS_MANIFEST_VERSION, entries: new Map(), rejectedCount: 1 }
  }

  const accepted = new Map<WorldActorRole, WorldActorAtlasManifestEntry>()
  const duplicated = new Set<WorldActorRole>()
  let rejectedCount = 0

  for (const value of input) {
    const entry = normalizeEntry(value)
    if (!entry) {
      rejectedCount += 1
      continue
    }

    if (duplicated.has(entry.role)) {
      rejectedCount += 1
      continue
    }

    if (accepted.has(entry.role)) {
      accepted.delete(entry.role)
      duplicated.add(entry.role)
      rejectedCount += 2
      continue
    }

    accepted.set(entry.role, entry)
  }

  return {
    version: WORLD_ACTOR_ATLAS_MANIFEST_VERSION,
    entries: accepted,
    rejectedCount,
  }
}
