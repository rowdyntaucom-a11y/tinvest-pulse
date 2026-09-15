import type { ResolvedWorldAssetManifest, WorldAssetSlotId } from './worldAssetManifest'

export const WORLD_ASSET_READINESS_VERSION = '0.1' as const

export type WorldAssetReadiness = {
  version: typeof WORLD_ASSET_READINESS_VERSION
  reviewedSlots: readonly WorldAssetSlotId[]
  proceduralFallbackSlots: readonly WorldAssetSlotId[]
  rejectedCount: number
  productionArtReady: boolean
}

/**
 * Keeps production-art activation fail-closed. A slot is considered reviewed
 * only after the canonical manifest accepted its local path and provenance.
 * Everything else remains explicitly procedural; missing art never disables
 * the Living World or invents a replacement asset.
 */
export function resolveWorldAssetReadiness(
  manifest: ResolvedWorldAssetManifest,
  requiredSlots: readonly WorldAssetSlotId[],
): WorldAssetReadiness {
  const reviewedSlots: WorldAssetSlotId[] = []
  const proceduralFallbackSlots: WorldAssetSlotId[] = []

  for (const slotId of [...new Set(requiredSlots)].sort()) {
    if (manifest.entries.has(slotId)) reviewedSlots.push(slotId)
    else proceduralFallbackSlots.push(slotId)
  }

  return {
    version: WORLD_ASSET_READINESS_VERSION,
    reviewedSlots,
    proceduralFallbackSlots,
    rejectedCount: manifest.rejectedCount,
    productionArtReady: proceduralFallbackSlots.length === 0 && manifest.rejectedCount === 0,
  }
}
