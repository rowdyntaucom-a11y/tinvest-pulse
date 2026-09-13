import assert from 'node:assert/strict'
import {
  WORLD_MEMORY_PRESENTATION_VERSION,
  buildWorldMemoryPresentationPolicy,
} from '../src/features/world/worldMemoryPresentationPolicy.ts'

assert.equal(WORLD_MEMORY_PRESENTATION_VERSION, '0.1')

const empty = buildWorldMemoryPresentationPolicy([])
assert.equal(empty.totalMoments, 0)
assert.equal(empty.firstRecordedAt, null)
assert.equal(empty.lastRecordedAt, null)
assert.deepEqual(empty.channels, [])
assert.deepEqual(empty.recentMoments, [])

const presented = [
  { id: 'xp:habit-1', channel: 'discipline', label: 'ДИСЦИПЛИНА', occurredAt: '2026-09-11T09:00:00.000Z', title: 'Habit 1' },
  { id: 'xp:health-1', channel: 'health', label: 'ЗДОРОВЬЕ', occurredAt: '2026-09-12T10:00:00.000Z', title: 'Health 1' },
  { id: 'xp:health-2', channel: 'health', label: 'ЗДОРОВЬЕ', occurredAt: '2026-09-13T11:00:00.000Z', title: 'Health 2' },
  { id: 'future:unknown', channel: 'generic', label: 'СОБЫТИЕ', occurredAt: '2026-09-13T12:00:00.000Z', title: 'Future event' },
] as const

const memory = buildWorldMemoryPresentationPolicy(presented, 3)
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

const noRecent = buildWorldMemoryPresentationPolicy(presented, 0)
assert.equal(noRecent.totalMoments, 4)
assert.deepEqual(noRecent.recentMoments, [])
assert.equal(noRecent.channels.find(item => item.channel === 'health')?.count, 2)

const invalidLimit = buildWorldMemoryPresentationPolicy(presented, Number.NaN)
assert.equal(invalidLimit.recentMoments.length, 4)

const sameTime = buildWorldMemoryPresentationPolicy([
  { id: 'b', channel: 'strategy', label: 'СТРАТЕГИЯ', occurredAt: '2026-09-13T12:00:00.000Z', title: null },
  { id: 'a', channel: 'achievement', label: 'ДОСТИЖЕНИЕ', occurredAt: '2026-09-13T12:00:00.000Z', title: null },
])
assert.deepEqual(sameTime.channels.map(item => item.channel), ['achievement', 'strategy'])

console.log('worldMemoryPresentation policy tests passed')
