import type { WorldAssetLoadFailure, WorldAssetLoadResult } from './worldAssetLoader.ts'
import type { ResolvedWorldAssetManifest, WorldAssetSlotId } from './worldAssetManifest.ts'
import type { WorldAssetReadiness } from './worldAssetReadiness.ts'

export const WORLD_ASSET_MOUNT_POLICY_VERSION = '0.1' as const

export type WorldAssetMountDecision = {
  version: typeof WORLD_ASSET_MOUNT_POLICY_VERSION
  slotId: WorldAssetSlotId
  assetPath: string | null
  mode: 'reviewed-asset' | 'procedural-fallback'
  reason: 'REVIEWED_ASSET_LOADED' | 'MANIFEST_NOT_READY' | 'ASSET_NOT_LOADED' | 'ASSET_LOAD_FAILED'
}

function loadFailureForSlot(failures: readonly WorldAssetLoadFailure[], slotId: WorldAssetSlotId) {
  return failures.find(failure => failure.slotId === slotId) ?? null
}

/**
 * Pure fail-closed activation policy for one Living World asset slot.
 *
 * Readiness is resolved by the canonical readiness boundary and passed in as a
 * typed value so this policy remains runtime-import free under both Vite/tsc
 * and Node strip-types regression execution.
 */
export function resolveWorldAssetMountDecision<T>(
  manifest: ResolvedWorldAssetManifest,
  readiness: WorldAssetReadiness,
  loadResult: WorldAssetLoadResult<T>,
  slotId: WorldAssetSlotId,
): WorldAssetMountDecision {
  const entry = manifest.entries.get(slotId) ?? null
  const reviewedForSlot = readiness.reviewedSlots.includes(slotId)
  const fallbackForSlot = readiness.proceduralFallbackSlots.includes(slotId)

  if (!readiness.productionArtReady || !reviewedForSlot || fallbackForSlot || !entry) {
    return {
      version: WORLD_ASSET_MOUNT_POLICY_VERSION,
      slotId,
      assetPath: entry?.assetPath ?? null,
      mode: 'procedural-fallback',
      reason: 'MANIFEST_NOT_READY',
    }
  }

  const failure = loadFailureForSlot(loadResult.failures, slotId)
  if (failure) {
    return {
      version: WORLD_ASSET_MOUNT_POLICY_VERSION,
      slotId,
      assetPath: entry.assetPath,
      mode: 'procedural-fallback',
      reason: 'ASSET_LOAD_FAILED',
    }
  }

  if (!loadResult.loaded.has(slotId)) {
    return {
      version: WORLD_ASSET_MOUNT_POLICY_VERSION,
      slotId,
      assetPath: entry.assetPath,
      mode: 'procedural-fallback',
      reason: 'ASSET_NOT_LOADED',
    }
  }

  return {
    version: WORLD_ASSET_MOUNT_POLICY_VERSION,
    slotId,
    assetPath: entry.assetPath,
    mode: 'reviewed-asset',
    reason: 'REVIEWED_ASSET_LOADED',
  }
}
