import assert from 'node:assert/strict'
import { resolveWorldActorFramePlayback, WORLD_ACTOR_FRAME_PLAYBACK_VERSION } from '../src/features/world/worldActorFramePlayback.ts'

const loop = { action: 'walk' as const, frameCount: 4, fps: 8, loop: true }
assert.equal(WORLD_ACTOR_FRAME_PLAYBACK_VERSION, '0.1')
assert.equal(resolveWorldActorFramePlayback(loop, 0, false).frameIndex, 0)
assert.equal(resolveWorldActorFramePlayback(loop, 0.24, false).frameIndex, 0)
assert.equal(resolveWorldActorFramePlayback(loop, 0.25, false).frameIndex, 1)
assert.equal(resolveWorldActorFramePlayback(loop, 0.74, false).frameIndex, 2)
assert.equal(resolveWorldActorFramePlayback(loop, 0.99, false).frameIndex, 3)
assert.equal(resolveWorldActorFramePlayback(loop, 1, false).frameIndex, 0)
assert.equal(resolveWorldActorFramePlayback(loop, Number.NaN, false).frameIndex, 0)

const oneShot = { action: 'work' as const, frameCount: 4, fps: 10, loop: false }
assert.equal(resolveWorldActorFramePlayback(oneShot, 0, false).frameIndex, 0)
assert.equal(resolveWorldActorFramePlayback(oneShot, 0.5, false).frameIndex, 2)
const terminal = resolveWorldActorFramePlayback(oneShot, 1, false)
assert.equal(terminal.frameIndex, 3)
assert.equal(terminal.terminal, true)

const frozen = resolveWorldActorFramePlayback(loop, 0.75, true)
assert.equal(frozen.frameIndex, 0)
assert.equal(frozen.normalizedProgress, 0)

const malformedCount = resolveWorldActorFramePlayback({ ...loop, frameCount: 0 }, 0.9, false)
assert.equal(malformedCount.frameIndex, 0)

console.log('worldActorFramePlayback tests passed')
