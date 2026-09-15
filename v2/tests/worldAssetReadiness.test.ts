import assert from 'node:assert/strict'
import { resolveWorldAssetManifest } from '../src/features/world/worldAssetManifest.ts'
import { resolveWorldAssetReadiness } from '../src/features/world/worldAssetReadiness.ts'
import { REVIEWED_WORLD_ASSET_MANIFEST } from '../src/features/world/worldReviewedAssets.ts'

const reviewedAt = '2026-09-15T15:00:00.000Z'

const current = resolveWorldAssetReadiness(REVIEWED_WORLD_ASSET_MANIFEST, [
  'background.distant-settlement',
  'terrain.ground',
])
assert.deepEqual(current.reviewedSlots, ['background.distant-settlement'])
assert.deepEqual(current.proceduralFallbackSlots, ['terrain.ground'])
assert.equal(current.rejectedCount, 0)
assert.equal(current.productionArtReady, false)

const manifest = resolveWorldAssetManifest([
  {
    slotId: 'background.sky',
    assetPath: '/assets/world/sky.svg',
    provenance: { source: 'reviewed-local', reviewedAt },
  },
  {
    slotId: 'terrain.ground',
    assetPath: '/assets/world/ground.svg',
    provenance: { source: 'reviewed-local', reviewedAt },
  },
])

const complete = resolveWorldAssetReadiness(manifest, ['terrain.ground', 'background.sky', 'background.sky'])
assert.deepEqual(complete.reviewedSlots, ['background.sky', 'terrain.ground'])
assert.deepEqual(complete.proceduralFallbackSlots, [])
assert.equal(complete.productionArtReady, true)

const rejected = resolveWorldAssetManifest([
  {
    slotId: 'background.sky',
    assetPath: 'https://example.com/sky.svg',
    provenance: { source: 'reviewed-local', reviewedAt },
  },
])
const failClosed = resolveWorldAssetReadiness(rejected, [])
assert.equal(failClosed.rejectedCount, 1)
assert.equal(failClosed.productionArtReady, false)

console.log('Living World asset readiness regression: ok')
