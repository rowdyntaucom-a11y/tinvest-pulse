import assert from 'node:assert/strict'
import { buildWorldEventPresentation } from '../src/features/world/worldEventPresentation.ts'

const events = [
  { id: 'a', kind: 'xp:CONTRIBUTION_HABIT', occurredAt: '2026-09-13T10:00:00.000Z', title: 'A' },
  { id: 'b', kind: 'xp:HEALTH_MILESTONE', occurredAt: '2026-09-13T11:00:00.000Z', title: 'B' },
  { id: 'c', kind: 'xp:PERFORMANCE_PERIOD', occurredAt: '2026-09-13T12:00:00.000Z', title: 'C' },
  { id: 'd', kind: 'xp:PASSIVE_INCOME_GROWTH', occurredAt: '2026-09-13T13:00:00.000Z', title: 'D' },
  { id: 'e', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T14:00:00.000Z', title: 'E' },
  { id: 'f', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-13T15:00:00.000Z', title: 'F' },
  { id: 'g', kind: 'future:UNKNOWN', occurredAt: '2026-09-13T16:00:00.000Z', title: 'G', intensity: 1 },
]

const result = buildWorldEventPresentation(events)
assert.deepEqual(result.map(item => item.channel), [
  'discipline',
  'health',
  'performance',
  'income',
  'strategy',
  'achievement',
  'generic',
])
assert.equal(result[0].label, 'ДИСЦИПЛИНА')
assert.equal(result[6].label, 'СОБЫТИЕ')
assert.equal(Object.prototype.hasOwnProperty.call(result[6], 'intensity'), false)
assert.equal(Object.prototype.hasOwnProperty.call(result[6], 'sprite'), false)
assert.equal(Object.prototype.hasOwnProperty.call(result[6], 'animation'), false)

console.log('worldEventPresentation tests passed')
