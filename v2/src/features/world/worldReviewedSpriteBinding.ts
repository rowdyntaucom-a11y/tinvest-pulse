import type { WorldAssetLoadResult } from './worldAssetLoader'
import type { WorldAssetReadiness } from './worldAssetReadiness'
import { resolveWorldAssetMountDecision } from './worldAssetMountPolicy'
import type { ResolvedWorldAssetManifest, WorldAssetSlotId } from './worldAssetManifest'

export const WORLD_REVIEWED_SPRITE_BINDING_VERSION = '0.1' as const

type PixiSpriteLike = {
  label: string
  width: number
  height: number
  position: { set(x: number, y: number): void }
}

type PixiReviewedAssetRuntime = {
  createSprite(source: unknown): PixiSpriteLike
}

export type ReviewedSpriteBindingResult = {
  version: typeof WORLD_REVIEWED_SPRITE_BINDING_VERSION
  slotId: WorldAssetSlotId
  mode: 'reviewed-asset' | 'procedural-fallback'
  sprite: PixiSpriteLike | null
  reason: 'REVIEWED_ASSET_LOADED' | 'MANIFEST_NOT_READY' | 'ASSET_NOT_LOADED' | 'ASSET_LOAD_FAILED' | 'SPRITE_CREATE_FAILED'
}

/**
 * Renderer-side adapter for one reviewed Living World image slot.
 *
 * Loading remains owned by the lightweight browser-native world asset loader.
 * This adapter receives that already-resolved result plus a caller-owned Pixi
 * sprite factory, so the heavier Pixi Assets loader never enters the deferred
 * DNA chunk. The canonical readiness + mount decision remains authoritative:
 * no sprite is created unless the exact reviewed slot loaded successfully.
 */
export function bindReviewedAssetSprite<T>(
  pixi: PixiReviewedAssetRuntime,
  manifest: ResolvedWorldAssetManifest,
  readiness: WorldAssetReadiness,
  loadResult: WorldAssetLoadResult<T>,
  slotId: WorldAssetSlotId,
): ReviewedSpriteBindingResult {
  const decision = resolveWorldAssetMountDecision(manifest, readiness, loadResult, slotId)
  if (decision.mode !== 'reviewed-asset') {
    return {
      version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
      slotId,
      mode: 'procedural-fallback',
      sprite: null,
      reason: decision.reason,
    }
  }

  const source = loadResult.loaded.get(slotId)
  if (source == null) {
    return {
      version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
      slotId,
      mode: 'procedural-fallback',
      sprite: null,
      reason: 'ASSET_NOT_LOADED',
    }
  }

  try {
    const sprite = pixi.createSprite(source)
    sprite.label = `reviewed-asset:${slotId}`
    return {
      version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
      slotId,
      mode: 'reviewed-asset',
      sprite,
      reason: 'REVIEWED_ASSET_LOADED',
    }
  } catch {
    return {
      version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
      slotId,
      mode: 'procedural-fallback',
      sprite: null,
      reason: 'SPRITE_CREATE_FAILED',
    }
  }
}
