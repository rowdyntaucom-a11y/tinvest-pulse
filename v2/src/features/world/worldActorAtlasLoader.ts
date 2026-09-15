import {
  resolveWorldActorAtlasDocument,
  type WorldActorAtlasDocument,
} from './worldActorAtlasDocument'
import type {
  ResolvedWorldActorAtlasManifest,
  WorldActorAtlasManifestEntry,
} from './worldActorAtlasManifest'
import type { WorldActorRole } from './worldLivingPresentation'

export const WORLD_ACTOR_ATLAS_LOADER_VERSION = '0.1' as const

export type LoadedWorldActorAtlas<TImage> = {
  entry: WorldActorAtlasManifestEntry
  image: TImage
  document: WorldActorAtlasDocument
}

export type WorldActorAtlasLoadFailureReason =
  | 'IMAGE_LOAD_FAILED'
  | 'ATLAS_LOAD_FAILED'
  | 'ATLAS_DOCUMENT_INVALID'

export type WorldActorAtlasLoadFailure = {
  role: WorldActorRole
  imagePath: string
  atlasPath: string
  reason: WorldActorAtlasLoadFailureReason
}

export type WorldActorAtlasLoadResult<TImage> = {
  version: typeof WORLD_ACTOR_ATLAS_LOADER_VERSION
  loaded: ReadonlyMap<WorldActorRole, LoadedWorldActorAtlas<TImage>>
  failures: readonly WorldActorAtlasLoadFailure[]
}

/**
 * Loads reviewed actor packs independently and fail-closed per role.
 *
 * The caller owns transport/decoding. This boundary only coordinates already
 * reviewed local manifest entries with the strict atlas-document validator.
 * One broken role can never abort every other reviewed actor pack.
 */
export async function loadWorldActorAtlases<TImage>(
  manifest: ResolvedWorldActorAtlasManifest,
  loadImage: (assetPath: string) => Promise<TImage | null | undefined>,
  loadAtlasDocument: (assetPath: string) => Promise<unknown>,
): Promise<WorldActorAtlasLoadResult<TImage>> {
  const loaded = new Map<WorldActorRole, LoadedWorldActorAtlas<TImage>>()
  const failures: WorldActorAtlasLoadFailure[] = []
  const entries = [...manifest.entries.values()].sort((a, b) => a.role.localeCompare(b.role))

  for (const entry of entries) {
    let image: TImage | null | undefined
    try {
      image = await loadImage(entry.imagePath)
    } catch {
      failures.push({
        role: entry.role,
        imagePath: entry.imagePath,
        atlasPath: entry.atlasPath,
        reason: 'IMAGE_LOAD_FAILED',
      })
      continue
    }
    if (image == null) {
      failures.push({
        role: entry.role,
        imagePath: entry.imagePath,
        atlasPath: entry.atlasPath,
        reason: 'IMAGE_LOAD_FAILED',
      })
      continue
    }

    let atlasInput: unknown
    try {
      atlasInput = await loadAtlasDocument(entry.atlasPath)
    } catch {
      failures.push({
        role: entry.role,
        imagePath: entry.imagePath,
        atlasPath: entry.atlasPath,
        reason: 'ATLAS_LOAD_FAILED',
      })
      continue
    }

    const document = resolveWorldActorAtlasDocument(atlasInput, entry)
    if (!document) {
      failures.push({
        role: entry.role,
        imagePath: entry.imagePath,
        atlasPath: entry.atlasPath,
        reason: 'ATLAS_DOCUMENT_INVALID',
      })
      continue
    }

    loaded.set(entry.role, { entry, image, document })
  }

  return {
    version: WORLD_ACTOR_ATLAS_LOADER_VERSION,
    loaded,
    failures,
  }
}
