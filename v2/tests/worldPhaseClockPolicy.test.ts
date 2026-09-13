import assert from 'node:assert/strict'
import {
  WORLD_PHASE_CLOCK_POLICY_VERSION,
  millisecondsUntilNextWorldPhaseBoundary,
} from '../src/features/world/worldPhaseClockPolicy.ts'

assert.equal(WORLD_PHASE_CLOCK_POLICY_VERSION, '0.1')

function localDate(hour: number, minute = 0, second = 0) {
  return new Date(2026, 8, 13, hour, minute, second, 0)
}

assert.equal(millisecondsUntilNextWorldPhaseBoundary(localDate(4, 0)), 60 * 60 * 1000)
assert.equal(millisecondsUntilNextWorldPhaseBoundary(localDate(5, 0)), 3 * 60 * 60 * 1000)
assert.equal(millisecondsUntilNextWorldPhaseBoundary(localDate(7, 59)), 60 * 1000)
assert.equal(millisecondsUntilNextWorldPhaseBoundary(localDate(8, 0)), 9 * 60 * 60 * 1000)
assert.equal(millisecondsUntilNextWorldPhaseBoundary(localDate(16, 30)), 30 * 60 * 1000)
assert.equal(millisecondsUntilNextWorldPhaseBoundary(localDate(17, 0)), 3 * 60 * 60 * 1000)
assert.equal(millisecondsUntilNextWorldPhaseBoundary(localDate(19, 30)), 30 * 60 * 1000)

const late = localDate(23, 0)
const nextDawn = new Date(2026, 8, 14, 5, 0, 0, 0)
assert.equal(millisecondsUntilNextWorldPhaseBoundary(late), nextDawn.getTime() - late.getTime())
assert.equal(millisecondsUntilNextWorldPhaseBoundary(new Date(Number.NaN)), 60_000)

console.log('worldPhaseClockPolicy tests passed')
