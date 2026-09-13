import { WORLD_ASSET_SLOTS, type WorldAssetSlotId } from './worldAssetSlots'

export const WORLD_ASSET_MANIFEST_VERSION = '0.1' as const

export type WorldAssetProvenance = {
  source: 'figma-export' | 'reviewed-local'
  fileKey?: string
  nodeId?: string
  reviewedAt: string
}

export type WorldAssetManifestEntry = {
  slotId: WorldAssetSlotId
  assetPath: string
  provenance: WorldAssetProvenance
}

export type ResolvedWorldAssetManifest = {
  version: typeof WORLD_ASSET_MANIFEST_VERSION
  entries: ReadonlyMap<WorldAssetSlotId, WorldAssetManifestEntry>
  rejectedCount: number
}

const SLOT_IDS = new Set<string>(WORLD_ASSET_SLOTS.map(slot => slot.id))
const LOCAL_WORLD_ASSET_PATH = /^\/assets\/world\/[A-Za-z0-9._/-]+\.(?:png|webp|svg)$/
const FIGMA_NODE_ID = /^\d+[:\-]\d+$/
const FIGMA_FILE_KEY = /^[0-9A-Za-z]{22,128}$/

function isIsoTimestamp(value: string) {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value
}

function hasUnsafePathSegment(path: string) {
  return path.includes('..') || path.includes('?') || path.includes('#') || path.includes('\\') || path.includes('//')
}

function normalizeEntry(value: unknown): WorldAssetManifestEntry | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<WorldAssetManifestEntry>
  if (typeof candidate.slotId !== 'string' || !SLOT_IDS.has(candidate.slotId)) return null
  if (typeof candidate.assetPath !== 'string') return null
  if (hasUnsafePathSegment(candidate.assetPath) || !LOCAL_WORLD_ASSET_PATH.test(candidate.assetPath)) return null

  const provenance = candidate.provenance
  if (!provenance || typeof provenance !== 'object') return null
  if (provenance.source !== 'figma-export' && provenance.source !== 'reviewed-local') return null
  if (typeof provenance.reviewedAt !== 'string' || !isIsoTimestamp(provenance.reviewedAt)) return null

  if (provenance.source === 'figma-export') {
    if (typeof provenance.fileKey !== 'string' || !FIGMA_FILE_KEY.test(provenance.fileKey)) return null
    if (typeof provenance.nodeId !== 'string' || !FIGMA_NODE_ID.test(provenance.nodeId)) return null
  }

  return {
    slotId: candidate.slotId as WorldAssetSlotId,
    assetPath: candidate.assetPath,
    provenance: {
      source: provenance.source,
      ...(provenance.fileKey ? { fileKey: provenance.fileKey } : {}),
      ...(provenance.nodeId ? { nodeId: provenance.nodeId } : {}),
      reviewedAt: provenance.reviewedAt,
    },
  }
}

/**
 * Resolves only reviewed, local packaged Living World assets.
 * Unknown slots, remote URLs, path traversal, malformed provenance and duplicate
 * slot registrations fail closed. Duplicate slots invalidate every record for
 * that slot rather than choosing an arbitrary winner.
 */
export function resolveWorldAssetManifest(input: unknown): ResolvedWorldAssetManifest {
  if (!Array.isArray(input)) {
    return { version: WORLD_ASSET_MANIFEST_VERSION, entries: new Map(), rejectedCount: 1 }
  }

  const accepted = new Map<WorldAssetSlotId, WorldAssetManifestEntry>()
  const duplicated = new Set<WorldAssetSlotId>()
  let rejectedCount = 0

  for (const value of input) {
    const entry = normalizeEntry(value)
    if (!entry) {
      rejectedCount += 1
      continue
    }

    if (duplicated.has(entry.slotId)) {
      rejectedCount += 1
      continue
    }

    if (accepted.has(entry.slotId)) {
      accepted.delete(entry.slotId)
      duplicated.add(entry.slotId)
      rejectedCount += 2
      continue
    }

    accepted.set(entry.slotId, entry)
  }

  return {
    version: WORLD_ASSET_MANIFEST_VERSION,
    entries: accepted,
    rejectedCount,
  }
}

export function worldAssetFromManifest(manifest: ResolvedWorldAssetManifest, slotId: WorldAssetSlotId) {
  return manifest.entries.get(slotId) ?? null
}
