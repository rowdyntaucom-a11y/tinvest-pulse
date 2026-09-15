import { resolveWorldAssetManifest, type WorldAssetManifestEntry } from './worldAssetManifest'

/**
 * Production registry for reviewed Living World art.
 * Assets enter here only after visual review and local packaging under
 * v2/public/assets/world. Legacy v1/Figma-era assets are never promoted implicitly.
 */
export const REVIEWED_WORLD_ASSET_ENTRIES: readonly WorldAssetManifestEntry[] = [
  {
    slotId: 'background.distant-settlement',
    assetPath: '/assets/world/distant-settlement-v1.svg',
    provenance: {
      source: 'reviewed-local',
      reviewedAt: '2026-09-15T15:00:00.000Z',
    },
  },
  {
    slotId: 'terrain.ground',
    assetPath: '/assets/world/terrain-ground-v1.svg',
    provenance: {
      source: 'reviewed-local',
      reviewedAt: '2026-09-15T18:20:00.000Z',
    },
  },
  {
    slotId: 'structures.storage',
    assetPath: '/assets/world/storage-v1.svg',
    provenance: {
      source: 'reviewed-local',
      reviewedAt: '2026-09-15T21:05:00.000Z',
    },
  },
]

export const REVIEWED_WORLD_ASSET_MANIFEST = resolveWorldAssetManifest(REVIEWED_WORLD_ASSET_ENTRIES)
