import { resolveWorldAssetManifest, type WorldAssetManifestEntry } from './worldAssetManifest'

/**
 * Production registry for reviewed Living World art.
 * Keep this empty until an asset has passed visual review and is packaged under
 * v2/public/assets/world. Legacy v1/Figma-era SVGs are not promoted implicitly.
 */
export const REVIEWED_WORLD_ASSET_ENTRIES: readonly WorldAssetManifestEntry[] = []

export const REVIEWED_WORLD_ASSET_MANIFEST = resolveWorldAssetManifest(REVIEWED_WORLD_ASSET_ENTRIES)
