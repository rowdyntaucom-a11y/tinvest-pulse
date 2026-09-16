import assert from 'node:assert/strict'
import { resolveWorldAssetManifest } from '../src/features/world/worldAssetManifest.ts'
import { resolveWorldAssetReadiness } from '../src/features/world/worldAssetReadiness.ts'
import { resolveWorldAssetMountDecision } from '../src/features/world/worldAssetMountPolicy.ts'
import type { WorldAssetLoadResult } from '../src/features/world/worldAssetLoader.ts'

const manifest = resolveWorldAssetManifest([
  {
    slotId: 'terrain.ground',
    assetPath: '/assets/world/terrain-ground-v1.svg',
    provenance: { source: 'reviewed-local', reviewedAt: '2026-09-15T18:20:00.000Z' },
  },
])
const readiness = resolveWorldAssetReadiness(manifest, ['terrain.ground'])

const loaded: WorldAssetLoadResult<object> = {
  version: '0.1',
  loaded: new Map([['terrain.ground', {}]]),
  failures: [],
}
assert.deepEqual(resolveWorldAssetMountDecision(manifest, readiness, loaded, 'terrain.ground'), {
  version: '0.1',
  slotId: 'terrain.ground',
  assetPath: '/assets/world/terrain-ground-v1.svg',
  mode: 'reviewed-asset',
  reason: 'REVIEWED_ASSET_LOADED',
})

const missing: WorldAssetLoadResult<object> = { version: '0.1', loaded: new Map(), failures: [] }
assert.equal(resolveWorldAssetMountDecision(manifest, readiness, missing, 'terrain.ground').mode, 'procedural-fallback')
assert.equal(resolveWorldAssetMountDecision(manifest, readiness, missing, 'terrain.ground').reason, 'ASSET_NOT_LOADED')

const failed: WorldAssetLoadResult<object> = {
  version: '0.1',
  loaded: new Map(),
  failures: [{ slotId: 'terrain.ground', assetPath: '/assets/world/terrain-ground-v1.svg', reason: 'LOAD_FAILED' }],
}
assert.equal(resolveWorldAssetMountDecision(manifest, readiness, failed, 'terrain.ground').mode, 'procedural-fallback')
assert.equal(resolveWorldAssetMountDecision(manifest, readiness, failed, 'terrain.ground').reason, 'ASSET_LOAD_FAILED')

const notReady = resolveWorldAssetReadiness(manifest, [])
assert.equal(resolveWorldAssetMountDecision(manifest, notReady, loaded, 'terrain.ground').mode, 'procedural-fallback')
assert.equal(resolveWorldAssetMountDecision(manifest, notReady, loaded, 'terrain.ground').reason, 'MANIFEST_NOT_READY')

console.log('Living World asset mount policy regression: ok')
