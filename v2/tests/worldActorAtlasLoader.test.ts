import assert from 'node:assert/strict'
import { loadWorldActorAtlases } from '../src/features/world/worldActorAtlasLoader.ts'
import { resolveWorldActorAtlasManifest, WORLD_ACTOR_ACTIONS } from '../src/features/world/worldActorAtlasManifest.ts'

function reviewed(role: 'miner' | 'builder') {
  return {
    role,
    imagePath: `/assets/world/actors/${role}.webp`,
    atlasPath: `/assets/world/actors/${role}.json`,
    frameWidth: 64,
    frameHeight: 64,
    animations: WORLD_ACTOR_ACTIONS.map(action => ({
      action,
      frameCount: 1,
      fps: 8,
      loop: true,
    })),
    provenance: {
      source: 'reviewed-local' as const,
      reviewedAt: '2026-09-15T10:00:00.000Z',
    },
  }
}

function document() {
  const frame = { x: 0, y: 0, width: 64, height: 64 }
  return {
    version: '0.1',
    imageWidth: 64,
    imageHeight: 64,
    animations: {
      idle: [frame],
      walk: [frame],
      carry: [frame],
      work: [frame],
    },
  }
}

const manifest = resolveWorldActorAtlasManifest([reviewed('miner'), reviewed('builder')])
const loaded = await loadWorldActorAtlases(
  manifest,
  async path => ({ path }),
  async () => document(),
)
assert.equal(loaded.loaded.size, 2)
assert.equal(loaded.failures.length, 0)
assert.equal(loaded.loaded.get('miner')?.image.path, '/assets/world/actors/miner.webp')

const partial = await loadWorldActorAtlases(
  manifest,
  async path => path.includes('builder') ? null : ({ path }),
  async () => document(),
)
assert.equal(partial.loaded.size, 1)
assert.equal(partial.failures.length, 1)
assert.equal(partial.failures[0]?.role, 'builder')
assert.equal(partial.failures[0]?.reason, 'IMAGE_LOAD_FAILED')

const atlasTransportFailure = await loadWorldActorAtlases(
  resolveWorldActorAtlasManifest([reviewed('miner')]),
  async path => ({ path }),
  async () => { throw new Error('offline') },
)
assert.equal(atlasTransportFailure.loaded.size, 0)
assert.equal(atlasTransportFailure.failures[0]?.reason, 'ATLAS_LOAD_FAILED')

const invalidDocument = await loadWorldActorAtlases(
  resolveWorldActorAtlasManifest([reviewed('miner')]),
  async path => ({ path }),
  async () => ({ version: '0.1', imageWidth: 64, imageHeight: 64, animations: {} }),
)
assert.equal(invalidDocument.loaded.size, 0)
assert.equal(invalidDocument.failures[0]?.reason, 'ATLAS_DOCUMENT_INVALID')

console.log('worldActorAtlasLoader tests passed')
