import assert from 'node:assert/strict'
import {
  resolveWorldActorAtlasManifest,
  WORLD_ACTOR_ACTIONS,
  WORLD_ACTOR_ATLAS_MANIFEST_VERSION,
} from '../src/features/world/worldActorAtlasManifest.ts'

const valid = {
  role: 'miner',
  imagePath: '/assets/world/actors/miner.webp',
  atlasPath: '/assets/world/actors/miner.json',
  frameWidth: 128,
  frameHeight: 128,
  animations: WORLD_ACTOR_ACTIONS.map(action => ({
    action,
    frameCount: action === 'idle' ? 4 : 8,
    fps: action === 'idle' ? 6 : 10,
    loop: action !== 'work',
  })),
  provenance: {
    source: 'reviewed-local',
    reviewedAt: '2026-09-15T10:00:00.000Z',
  },
} as const

const resolved = resolveWorldActorAtlasManifest([valid])
assert.equal(resolved.version, WORLD_ACTOR_ATLAS_MANIFEST_VERSION)
assert.equal(resolved.entries.size, 1)
assert.equal(resolved.rejectedCount, 0)
assert.deepEqual(resolved.entries.get('miner')?.animations.map(clip => clip.action), WORLD_ACTOR_ACTIONS)

const missingState = resolveWorldActorAtlasManifest([{
  ...valid,
  animations: valid.animations.filter(clip => clip.action !== 'carry'),
}])
assert.equal(missingState.entries.size, 0)
assert.equal(missingState.rejectedCount, 1)

const unsafePath = resolveWorldActorAtlasManifest([{
  ...valid,
  imagePath: '/assets/world/../secret.png',
}])
assert.equal(unsafePath.entries.size, 0)
assert.equal(unsafePath.rejectedCount, 1)

const remotePath = resolveWorldActorAtlasManifest([{
  ...valid,
  atlasPath: 'https://example.com/miner.json',
}])
assert.equal(remotePath.entries.size, 0)
assert.equal(remotePath.rejectedCount, 1)

const badFigma = resolveWorldActorAtlasManifest([{
  ...valid,
  provenance: {
    source: 'figma-export',
    fileKey: 'short',
    nodeId: 'bad-node',
    reviewedAt: '2026-09-15T10:00:00.000Z',
  },
}])
assert.equal(badFigma.entries.size, 0)
assert.equal(badFigma.rejectedCount, 1)

const duplicateRole = resolveWorldActorAtlasManifest([valid, {
  ...valid,
  imagePath: '/assets/world/actors/miner-alt.webp',
  atlasPath: '/assets/world/actors/miner-alt.json',
}])
assert.equal(duplicateRole.entries.size, 0)
assert.equal(duplicateRole.rejectedCount, 2)

const malformedAnimation = resolveWorldActorAtlasManifest([{
  ...valid,
  animations: valid.animations.map(clip => clip.action === 'walk' ? { ...clip, fps: 0 } : clip),
}])
assert.equal(malformedAnimation.entries.size, 0)
assert.equal(malformedAnimation.rejectedCount, 1)

assert.equal(resolveWorldActorAtlasManifest(null).entries.size, 0)
assert.equal(resolveWorldActorAtlasManifest(null).rejectedCount, 1)

console.log('worldActorAtlasManifest tests passed')
