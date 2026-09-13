import assert from 'node:assert/strict'
import {
  WORLD_CHRONICLE_VERSION,
  createEmptyWorldChronicle,
  mergeWorldChronicleEntries,
  normalizeWorldChronicleEntry,
  readWorldChronicle,
} from '../src/features/dna/worldChronicle.ts'

assert.equal(WORLD_CHRONICLE_VERSION, '0.1')
assert.deepEqual(createEmptyWorldChronicle(), { version: '0.1', entries: [], updatedAt: null })

const normalized = normalizeWorldChronicleEntry({
  id: 'xp:habit-1',
  kind: 'xp:CONTRIBUTION_HABIT',
  occurredAt: '2026-09-13T10:00:00+00:00',
  title: ' Дисциплина пополнений ',
  intensity: 0.9,
  awardedXp: 500,
  portfolioValue: 999999,
  animation: 'fireworks',
})
assert.deepEqual(normalized, {
  id: 'xp:habit-1',
  kind: 'xp:CONTRIBUTION_HABIT',
  occurredAt: '2026-09-13T10:00:00.000Z',
  title: 'Дисциплина пополнений',
})
assert.equal(Object.prototype.hasOwnProperty.call(normalized ?? {}, 'intensity'), false)
assert.equal(Object.prototype.hasOwnProperty.call(normalized ?? {}, 'awardedXp'), false)
assert.equal(Object.prototype.hasOwnProperty.call(normalized ?? {}, 'portfolioValue'), false)
assert.equal(Object.prototype.hasOwnProperty.call(normalized ?? {}, 'animation'), false)
assert.equal(normalizeWorldChronicleEntry({ id: '', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-13' }), null)
assert.equal(normalizeWorldChronicleEntry({ id: 'bad', kind: '', occurredAt: '2026-09-13' }), null)
assert.equal(normalizeWorldChronicleEntry({ id: 'bad', kind: 'xp:ACHIEVEMENT', occurredAt: 'not-a-date' }), null)

assert.deepEqual(readWorldChronicle(null), createEmptyWorldChronicle())
assert.deepEqual(readWorldChronicle({ version: '9.9', entries: [] }), createEmptyWorldChronicle())
assert.deepEqual(readWorldChronicle({ version: '0.1', entries: 'bad' }), createEmptyWorldChronicle())

const stored = {
  version: '0.1',
  entries: [
    { id: 'xp:older', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-11T10:00:00Z', title: 'Older' },
    { id: 'xp:older', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-12T10:00:00Z', title: 'Must not rewrite' },
    { id: 'broken', kind: '', occurredAt: 'bad' },
  ],
  updatedAt: '2026-09-12T00:00:00Z',
}
const read = readWorldChronicle(stored)
assert.equal(read.entries.length, 1)
assert.equal(read.entries[0].title, 'Older')
assert.equal(read.updatedAt, '2026-09-12T00:00:00.000Z')

const merged = mergeWorldChronicleEntries(
  stored,
  [
    { id: 'xp:newer', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T11:00:00Z', title: 'Strategy' },
    { id: 'xp:older', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-14T10:00:00Z', title: 'Attempted rewrite' },
    { id: 'xp:newer', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T11:00:00Z', title: 'Duplicate retry' },
    { id: 'invalid', kind: '', occurredAt: 'bad' },
  ],
  '2026-09-13T12:00:00Z',
)
assert.equal(merged.acceptedNewEntries, 1)
assert.equal(merged.duplicateIncomingEntries, 2)
assert.equal(merged.rejectedIncomingEntries, 1)
assert.deepEqual(merged.document.entries.map(entry => entry.id), ['xp:older', 'xp:newer'])
assert.equal(merged.document.entries[0].title, 'Older')
assert.equal(merged.document.updatedAt, '2026-09-13T12:00:00.000Z')

const retry = mergeWorldChronicleEntries(
  merged.document,
  [{ id: 'xp:newer', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T11:00:00Z', title: 'Retry' }],
  '2026-09-14T12:00:00Z',
)
assert.equal(retry.acceptedNewEntries, 0)
assert.equal(retry.duplicateIncomingEntries, 1)
assert.equal(retry.document.updatedAt, '2026-09-13T12:00:00.000Z')
assert.equal(retry.document.entries.find(entry => entry.id === 'xp:newer')?.title, 'Strategy')

console.log('worldChronicle tests passed')
