import assert from 'node:assert/strict'
import { loadWorldAssetEntries } from '../src/features/world/worldAssetLoader.ts'

const requested: string[] = []
const result = await loadWorldAssetEntries(
  [
    { slotId: 'structures.workshop', assetPath: '/assets/world/workshop.svg' },
    { slotId: 'terrain.ground', assetPath: '/assets/world/ground.svg' },
    { slotId: 'structures.storage', assetPath: '/assets/world/storage.svg' },
    { slotId: 'terrain.missing', assetPath: '/assets/world/missing.svg' },
  ],
  async (assetPath) => {
    requested.push(assetPath)
    if (assetPath.endsWith('missing.svg')) return null
    if (assetPath.endsWith('storage.svg')) throw new Error('simulated load failure')
    return `loaded:${assetPath}`
  },
)

assert.deepEqual(requested, [
  '/assets/world/storage.svg',
  '/assets/world/workshop.svg',
  '/assets/world/ground.svg',
  '/assets/world/missing.svg',
], 'loader order must be deterministic by slot id, independent of manifest iteration order')
assert.equal(result.loaded.get('structures.workshop'), 'loaded:/assets/world/workshop.svg')
assert.equal(result.loaded.get('terrain.ground'), 'loaded:/assets/world/ground.svg')
assert.equal(result.loaded.has('structures.storage'), false)
assert.equal(result.loaded.has('terrain.missing'), false)
assert.deepEqual(result.failures, [
  { slotId: 'structures.storage', assetPath: '/assets/world/storage.svg', reason: 'LOAD_FAILED' },
  { slotId: 'terrain.missing', assetPath: '/assets/world/missing.svg', reason: 'EMPTY_ASSET' },
], 'one broken reviewed asset must not abort or fabricate the remaining loader result')

console.log('world asset loader regression passed')
