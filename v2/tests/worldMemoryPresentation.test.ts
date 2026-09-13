import assert from 'node:assert/strict'
import {
  WORLD_MEMORY_PRESENTATION_VERSION,
  buildWorldMemoryPresentation,
} from '../src/features/world/worldMemoryPresentation.ts'

assert.equal(WORLD_MEMORY_PRESENTATION_VERSION, '0.1')

const empty = buildWorldMemoryPresentation(null)
assert.equal(empty.totalMoments, 0)
assert.equal(empty.firstRecordedAt, null)
assert.equal(empty.lastRecordedAt, null)
assert.deepEqual(empty.channels, [])
assert.deepEqual(empty.recentMoments, [])

const chronicle = {
  version: '0.1',
  updatedAt: '2026-09-13T12:00:00Z',
  entries: [
    { id: 'xp:health-2', kind: 'xp:HEALTH_MILESTONE', occurredAt: '2026-09-13T11:00:00Z', title: 'Health 2' },
    { id: 'xp:habit-1', kind: 'xp:CONTRIBUTION_HABIT', occurredAt: '2026-09-11T09:00:00Z', title: 'Habit 1' },
    { id: 'xp:health-1', kind: 'xp:HEALTH_MILESTONE', occurredAt: '2026-09-12T10:00:00Z', title: 'Health 1' },
    { id: 'future:unknown', kind: 'future:UNKNOWN_KIND', occurredAt: '2026-09-13T12:00:00Z', title: 'Future event' },
  ],
}

const memory = buildWorldMemoryPresentation(chronicle, 3)
assert.equal(memory.totalMoments, 4)
assert.equal(memory.firstRecordedAt, '2026-09-11T09:00:00.000Z')
assert.equal(memory.lastRecordedAt, '2026-09-13T12:00:00.000Z')
assert.deepEqual(memory.channels.map(item => [item.channel, item.count]), [
  ['discipline', 1],
  ['health', 2],
  ['generic', 1],
])

const health = memory.channels.find(item => item.channel === 'health')
assert.equal(health?.firstEventId, 'xp:health-1')
assert.equal(health?.lastEventId, 'xp:health-2')
assert.equal(health?.firstOccurredAt, '2026-09-12T10:00:00.000Z')
assert.equal(health?.lastOccurredAt, '2026-09-13T11:00:00.000Z')

assert.deepEqual(memory.recentMoments.map(item => item.id), [
  'future:unknown',
  'xp:health-2',
  'xp:health-1',
])
assert.equal(memory.recentMoments.find(item => item.id === 'xp:health-1')?.sequenceInChannel, 1)
assert.equal(memory.recentMoments.find(item => item.id === 'xp:health-1')?.isFirstInChannel, true)
assert.equal(memory.recentMoments.find(item => item.id === 'xp:health-2')?.sequenceInChannel, 2)
assert.equal(memory.recentMoments.find(item => item.id === 'xp:health-2')?.isFirstInChannel, false)
assert.equal(memory.recentMoments.find(item => item.id === 'future:unknown')?.channel, 'generic')

const noRecent = buildWorldMemoryPresentation(chronicle, 0)
assert.equal(noRecent.totalMoments, 4)
assert.deepEqual(noRecent.recentMoments, [])
assert.equal(noRecent.channels.find(item => item.channel === 'health')?.count, 2)

const invalidLimit = buildWorldMemoryPresentation(chronicle, Number.NaN)
assert.equal(invalidLimit.recentMoments.length, 4)

const dirty = buildWorldMemoryPresentation({
  version: '0.1',
  updatedAt: null,
  entries: [
    { id: 'same', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-12T10:00:00Z', title: 'Original' },
    { id: 'same', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-13T10:00:00Z', title: 'Rewrite attempt' },
    { id: '', kind: 'xp:ACHIEVEMENT', occurredAt: 'bad' },
  ],
})
assert.equal(dirty.totalMoments, 1)
assert.equal(dirty.recentMoments[0]?.title, 'Original')
assert.equal(dirty.recentMoments[0]?.isFirstInChannel, true)

console.log('worldMemoryPresentation tests passed')
