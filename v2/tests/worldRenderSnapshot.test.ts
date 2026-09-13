import assert from 'node:assert/strict'
import { buildWorldState } from '../src/features/dna/worldState.ts'
import { emptyWorldEventCursor, resolveWorldEventQueue } from '../src/features/dna/worldEventQueue.ts'
import { WORLD_RENDER_SNAPSHOT_VERSION, buildWorldRenderSnapshot } from '../src/features/dna/worldRenderSnapshot.ts'

assert.equal(WORLD_RENDER_SNAPSHOT_VERSION, '0.1')

const state = buildWorldState({
  level: 4,
  xp: 125,
  xpToNext: 25,
  qualityCoverage: 0.8,
  weather: 'cloudy',
  localDate: new Date(2026, 8, 13, 18, 0, 0),
  events: [
    { id: 'seen', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-12T10:00:00Z', title: 'Seen' },
    { id: 'pending', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T10:00:00Z', title: 'Pending' },
  ],
})

const cursor = {
  ...emptyWorldEventCursor(),
  acknowledgedEventIds: ['seen'],
}
const queue = resolveWorldEventQueue(state, cursor)
const snapshot = buildWorldRenderSnapshot(state, queue)

assert.equal(snapshot.version, '0.1')
assert.equal(snapshot.worldStateVersion, '0.1')
assert.equal(snapshot.level, 4)
assert.equal(snapshot.timePhase, 'sunset')
assert.equal(snapshot.weather, 'cloudy')
assert.equal(snapshot.pendingEventCount, 1)
assert.deepEqual(snapshot.pendingEvents.map(event => event.id), ['pending'])

// Renderer boundary deliberately hides XP/quality/acknowledgement internals.
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'xp'), false)
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'xpToNext'), false)
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'qualityCoverage'), false)
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'acknowledgedEventIds'), false)

// Snapshot owns a copy of pending semantic events; mutation must not change WorldState.
snapshot.pendingEvents[0].title = 'Changed only in renderer snapshot'
assert.equal(state.events.find(event => event.id === 'pending')?.title, 'Pending')

const emptyQueue = resolveWorldEventQueue(state, {
  version: '0.1',
  acknowledgedEventIds: ['pending', 'seen'],
})
const emptySnapshot = buildWorldRenderSnapshot(state, emptyQueue)
assert.equal(emptySnapshot.pendingEventCount, 0)
assert.deepEqual(emptySnapshot.pendingEvents, [])

console.log('worldRenderSnapshot tests passed')
