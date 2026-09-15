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
  Assets: {
    load<T>(assetPath: string): Promise<T>
  }
  Sprite: new (texture: unknown) => PixiSpriteLike
}

export type ReviewedSpriteBindingResult = {
  version: typeof WORLD_REVIEWED_SPRITE_BINDING_VERSION
  slotId: WorldAssetSlotId
  mode: 'reviewed-asset' | 'procedural-fallback'
  sprite: PixiSpriteLike | null
  reason: 'REVIEWED_ASSET_LOADED' | 'MANIFEST_NOT_READY' | 'ASSET_LOAD_FAILED'
}

/**
 * Renderer-side adapter for one reviewed Living World image slot.
 *
 * This helper deliberately receives the already deferred Pixi module instead
 * of importing pixi.js itself. That keeps Pixi out of the initial bundle and
 * guarantees the caller's existing Application/ticker remains the only runtime.
 * A browser/Pixi load failure is converted into the canonical fail-closed mount
 * decision; no sprite is created unless the reviewed manifest is ready and the
 * exact slot loaded successfully.
 */
export async function bindReviewedAssetSprite(
  pixi: PixiReviewedAssetRuntime,
  manifest: ResolvedWorldAssetManifest,
  readiness: WorldAssetReadiness,
  slotId: WorldAssetSlotId,
): Promise<ReviewedSpriteBindingResult> {
  const entry = manifest.entries.get(slotId) ?? null
  if (!entry || !readiness.productionArtReady || !readiness.reviewedSlots.includes(slotId)) {
    return {
      version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
      slotId,
      mode: 'procedural-fallback',
      sprite: null,
      reason: 'MANIFEST_NOT_READY',
    }
  }

  try {
    const texture = await pixi.Assets.load<unknown>(entry.assetPath)
    const loaded = new Map<WorldAssetSlotId, unknown>([[slotId, texture]])
    const decision = resolveWorldAssetMountDecision(
      manifest,
      readiness,
      { version: '0.1', loaded, failures: [] },
      slotId,
    )
    if (decision.mode !== 'reviewed-asset') {
      return {
        version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
        slotId,
        mode: 'procedural-fallback',
        sprite: null,
        reason: 'MANIFEST_NOT_READY',
      }
    }

    const sprite = new pixi.Sprite(texture)
    sprite.label = `reviewed-asset:${slotId}`
    return {
      version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
      slotId,
      mode: 'reviewed-asset',
      sprite,
      reason: 'REVIEWED_ASSET_LOADED',
    }
  } catch {
    const decision = resolveWorldAssetMountDecision(
      manifest,
      readiness,
      {
        version: '0.1',
        loaded: new Map(),
        failures: [{ slotId, assetPath: entry.assetPath, reason: 'LOAD_FAILED' }],
      },
      slotId,
    )
    return {
      version: WORLD_REVIEWED_SPRITE_BINDING_VERSION,
      slotId,
      mode: 'procedural-fallback',
      sprite: null,
      reason: decision.reason === 'ASSET_LOAD_FAILED' ? 'ASSET_LOAD_FAILED' : 'MANIFEST_NOT_READY',
    }
  }
}
