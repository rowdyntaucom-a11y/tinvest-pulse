import {
  resolveWorldActorAtlasManifest,
  type WorldActorAtlasManifestEntry,
} from './worldActorAtlasManifest'

/**
 * Production registry for reviewed Living World character atlases.
 *
 * Keep this empty until a complete role pack has passed visual review and is
 * packaged under /assets/world. Runtime/procedural fallback remains active when
 * no reviewed atlas exists.
 */
export const REVIEWED_WORLD_ACTOR_ATLAS_ENTRIES: readonly WorldActorAtlasManifestEntry[] = []

export const REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST = resolveWorldActorAtlasManifest(
  REVIEWED_WORLD_ACTOR_ATLAS_ENTRIES,
)
