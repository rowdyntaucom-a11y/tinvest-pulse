import assert from 'node:assert/strict'
import { resolveWorldAssetManifest } from '../src/features/world/worldAssetManifest.ts'
import { resolveWorldAssetReadiness } from '../src/features/world/worldAssetReadiness.ts'

const reviewedAt = '2026-09-15T15:00:00.000Z'

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

const partial = resolveWorldAssetReadiness(manifest, ['terrain.ground', 'background.sky', 'structures.workshop'])
assert.deepEqual(partial.reviewedSlots, ['background.sky', 'terrain.ground'])
assert.deepEqual(partial.proceduralFallbackSlots, ['structures.workshop'])
assert.equal(partial.productionArtReady, false)

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

console.log('world asset readiness regression passed')
