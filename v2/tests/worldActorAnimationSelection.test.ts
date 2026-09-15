import assert from 'node:assert/strict'
import { resolveWorldActorAnimationSelection } from '../src/features/world/worldActorAnimationSelection.ts'
import { resolveWorldActorAtlasManifest, WORLD_ACTOR_ACTIONS } from '../src/features/world/worldActorAtlasManifest.ts'

const empty = resolveWorldActorAtlasManifest([])
const fallback = resolveWorldActorAnimationSelection(empty, 'miner', 'carry', false)
assert.equal(fallback.renderer, 'procedural-fallback')
assert.equal(fallback.reason, 'NO_REVIEWED_ATLAS')

const manifest = resolveWorldActorAtlasManifest([{
  role: 'miner',
  imagePath: '/assets/world/actors/miner.webp',
  atlasPath: '/assets/world/actors/miner.json',
  frameWidth: 128,
  frameHeight: 128,
  animations: WORLD_ACTOR_ACTIONS.map(action => ({
    action,
    frameCount: action === 'idle' ? 4 : 8,
    fps: action === 'idle' ? 6 : 12,
    loop: action !== 'work',
  })),
  provenance: {
    source: 'reviewed-local',
    reviewedAt: '2026-09-15T10:00:00.000Z',
  },
}])

const carry = resolveWorldActorAnimationSelection(manifest, 'miner', 'carry', false)
assert.equal(carry.renderer, 'reviewed-atlas')
if (carry.renderer === 'reviewed-atlas') {
  assert.equal(carry.clip.action, 'carry')
  assert.equal(carry.effectiveFps, 12)
  assert.equal(carry.freezeFrame, false)
}

const reduced = resolveWorldActorAnimationSelection(manifest, 'miner', 'work', true)
assert.equal(reduced.renderer, 'reviewed-atlas')
if (reduced.renderer === 'reviewed-atlas') {
  assert.equal(reduced.effectiveFps, 0)
  assert.equal(reduced.freezeFrame, true)
}

const residentFallback = resolveWorldActorAnimationSelection(manifest, 'resident', 'idle', false)
assert.equal(residentFallback.renderer, 'procedural-fallback')
assert.equal(residentFallback.reason, 'NO_REVIEWED_ATLAS')

console.log('worldActorAnimationSelection tests passed')
