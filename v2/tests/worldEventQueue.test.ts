import assert from 'node:assert/strict'
import { buildWorldState } from '../src/features/dna/worldState.ts'
import {
  WORLD_EVENT_QUEUE_VERSION,
  acknowledgePendingWorldEvents,
  acknowledgeWorldEvent,
  acknowledgeWorldEvents,
  emptyWorldEventCursor,
  normalizeWorldEventCursor,
  resolveWorldEventQueue,
} from '../src/features/dna/worldEventQueue.ts'

assert.equal(WORLD_EVENT_QUEUE_VERSION, '0.1')
assert.deepEqual(emptyWorldEventCursor(), {
  version: '0.1',
  acknowledgedEventIds: [],
})

assert.deepEqual(normalizeWorldEventCursor(null), emptyWorldEventCursor())
assert.deepEqual(normalizeWorldEventCursor({ version: '9.9', acknowledgedEventIds: ['a'] }), emptyWorldEventCursor())
assert.deepEqual(normalizeWorldEventCursor({ version: '0.1', acknowledgedEventIds: 'a' }), emptyWorldEventCursor())
assert.deepEqual(
  normalizeWorldEventCursor({ version: '0.1', acknowledgedEventIds: [' b ', 'a', 'b', '', null, 7] }),
  { version: '0.1', acknowledgedEventIds: ['7', 'a', 'b'] },
)

const state = buildWorldState({
  level: 2,
  xp: 40,
  weather: 'neutral',
  localDate: new Date(2026, 8, 13, 12, 0, 0),
  events: [
    { id: 'old', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-11T10:00:00Z', title: 'Old' },
    { id: 'new', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T10:00:00Z', title: 'New' },
    { id: 'mid', kind: 'xp:CONTRIBUTION_HABIT', occurredAt: '2026-09-12T10:00:00Z', title: 'Mid' },
  ],
})

const initialQueue = resolveWorldEventQueue(state, emptyWorldEventCursor())
assert.equal(initialQueue.visibleEvents, 3)
assert.equal(initialQueue.acknowledgedVisibleEvents, 0)
assert.deepEqual(initialQueue.pending.map(event => event.id), ['new', 'mid', 'old'])

const ackNew = acknowledgeWorldEvent(emptyWorldEventCursor(), ' new ')
assert.deepEqual(ackNew.acknowledgedEventIds, ['new'])
const queueAfterOne = resolveWorldEventQueue(state, ackNew)
assert.equal(queueAfterOne.visibleEvents, 3)
assert.equal(queueAfterOne.acknowledgedVisibleEvents, 1)
assert.deepEqual(queueAfterOne.pending.map(event => event.id), ['mid', 'old'])

// Acknowledgement is idempotent and unknown ids cannot manufacture or reorder events.
const idempotent = acknowledgeWorldEvents(ackNew, ['new', 'ghost', 'new', ''])
assert.deepEqual(idempotent.acknowledgedEventIds, ['ghost', 'new'])
const queueWithUnknownAck = resolveWorldEventQueue(state, idempotent)
assert.deepEqual(queueWithUnknownAck.pending.map(event => event.id), ['mid', 'old'])

const allVisibleAcked = acknowledgePendingWorldEvents(idempotent, queueWithUnknownAck)
assert.deepEqual(allVisibleAcked.acknowledgedEventIds, ['ghost', 'mid', 'new', 'old'])
const emptyQueue = resolveWorldEventQueue(state, allVisibleAcked)
assert.equal(emptyQueue.visibleEvents, 3)
assert.equal(emptyQueue.acknowledgedVisibleEvents, 3)
assert.deepEqual(emptyQueue.pending, [])

// Re-resolving the same WorldState never replays acknowledged ids.
assert.deepEqual(resolveWorldEventQueue(state, allVisibleAcked), emptyQueue)

// A newly arriving semantic event appears without disturbing acknowledged history.
const laterState = buildWorldState({
  level: 2,
  xp: 45,
  weather: 'neutral',
  localDate: new Date(2026, 8, 13, 12, 0, 0),
  events: [
    ...state.events,
    { id: 'latest', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-14T10:00:00Z', title: 'Latest' },
  ],
})
const laterQueue = resolveWorldEventQueue(laterState, allVisibleAcked)
assert.deepEqual(laterQueue.pending.map(event => event.id), ['latest'])
assert.equal(laterQueue.acknowledgedVisibleEvents, 3)

console.log('worldEventQueue tests passed')
