import assert from 'node:assert/strict'
import {
  resolveWorldRuntimePerformance,
  WORLD_RUNTIME_PERFORMANCE_VERSION,
} from '../src/features/world/worldRuntimePerformance.ts'

assert.equal(WORLD_RUNTIME_PERFORMANCE_VERSION, '0.1')

const samsungLike = resolveWorldRuntimePerformance({
  viewportWidth: 412,
  devicePixelRatio: 3,
  reducedMotion: false,
})
assert.equal(samsungLike.mobile, true)
assert.equal(samsungLike.maxFps, 30)
assert.equal(samsungLike.minFps, 15)
assert.equal(samsungLike.resolution, 1.35)

const desktop = resolveWorldRuntimePerformance({
  viewportWidth: 1440,
  devicePixelRatio: 2,
  reducedMotion: false,
})
assert.equal(desktop.mobile, false)
assert.equal(desktop.maxFps, 60)
assert.equal(desktop.minFps, 20)
assert.equal(desktop.resolution, 1.75)

const reduced = resolveWorldRuntimePerformance({
  viewportWidth: 412,
  devicePixelRatio: 2.5,
  reducedMotion: true,
})
assert.equal(reduced.maxFps, 15)
assert.equal(reduced.minFps, 8)
assert.equal(reduced.resolution, 1.35)

const malformed = resolveWorldRuntimePerformance({
  viewportWidth: Number.NaN,
  devicePixelRatio: Number.NaN,
  reducedMotion: false,
})
assert.equal(malformed.mobile, true)
assert.equal(malformed.resolution, 1)
assert.equal(malformed.maxFps, 30)

console.log('worldRuntimePerformance tests passed')
