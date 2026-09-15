import assert from 'node:assert/strict'
import { resolveWorldActorAtlasDocument } from '../src/features/world/worldActorAtlasDocument.ts'
import { resolveWorldActorAtlasManifest, WORLD_ACTOR_ACTIONS } from '../src/features/world/worldActorAtlasManifest.ts'

const manifest = resolveWorldActorAtlasManifest([{
  role: 'miner',
  imagePath: '/assets/world/actors/miner.webp',
  atlasPath: '/assets/world/actors/miner.json',
  frameWidth: 64,
  frameHeight: 64,
  animations: WORLD_ACTOR_ACTIONS.map(action => ({
    action,
    frameCount: 2,
    fps: 8,
    loop: true,
  })),
  provenance: {
    source: 'reviewed-local',
    reviewedAt: '2026-09-15T10:00:00.000Z',
  },
}])
const entry = manifest.entries.get('miner')!

const validFrames = [
  { x: 0, y: 0, width: 64, height: 64 },
  { x: 64, y: 0, width: 64, height: 64 },
]
const validDocument = {
  version: '0.1',
  imageWidth: 256,
  imageHeight: 256,
  animations: {
    idle: validFrames,
    walk: validFrames,
    carry: validFrames,
    work: validFrames,
  },
}

const resolved = resolveWorldActorAtlasDocument(validDocument, entry)
assert.ok(resolved)
assert.equal(resolved?.animations.walk.length, 2)

assert.equal(resolveWorldActorAtlasDocument({ ...validDocument, version: '0.2' }, entry), null)
assert.equal(resolveWorldActorAtlasDocument({
  ...validDocument,
  animations: { ...validDocument.animations, walk: [validFrames[0]] },
}, entry), null)
assert.equal(resolveWorldActorAtlasDocument({
  ...validDocument,
  animations: {
    ...validDocument.animations,
    idle: [{ x: 220, y: 0, width: 64, height: 64 }, validFrames[1]],
  },
}, entry), null)
assert.equal(resolveWorldActorAtlasDocument({
  ...validDocument,
  animations: {
    ...validDocument.animations,
    work: [{ x: 0, y: 0, width: 32, height: 64 }, validFrames[1]],
  },
}, entry), null)
assert.equal(resolveWorldActorAtlasDocument({
  ...validDocument,
  animations: { ...validDocument.animations, dance: validFrames },
}, entry), null)

console.log('worldActorAtlasDocument tests passed')
