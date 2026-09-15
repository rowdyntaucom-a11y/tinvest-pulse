import assert from 'node:assert/strict'
import { buildWorldEventPresentation } from '../src/features/world/worldEventPresentation.ts'
import {
  WORLD_EVENT_CARAVAN_LIMIT,
  WORLD_EVENT_CARAVAN_VERSION,
  buildWorldEventCaravanPresentation,
  resolveWorldEventCaravanJourney,
} from '../src/features/world/worldEventCaravanPresentation.ts'

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

assert.equal(WORLD_EVENT_CARAVAN_VERSION, '0.1')
assert.equal(WORLD_EVENT_CARAVAN_LIMIT, 2)
const caravans = buildWorldEventCaravanPresentation(events)
assert.equal(caravans.length, WORLD_EVENT_CARAVAN_LIMIT)
assert.deepEqual(caravans.map(item => item.channel), ['discipline', 'health'])
assert.deepEqual(caravans.map(item => item.destination), ['mine-yard', 'workshop'])
assert.deepEqual(buildWorldEventCaravanPresentation(events), caravans)
assert.equal(caravans.every(item => item.phaseOffset >= 0 && item.phaseOffset < 1), true)
assert.equal(caravans.every(item => item.pace > 0), true)
for (const caravan of caravans) {
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'amount'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'portfolioValue'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'return'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'xp'), false)
}

const semanticDestinations = buildWorldEventCaravanPresentation([
  events[3],
  events[5],
])
assert.deepEqual(semanticDestinations.map(item => item.destination), ['storehouse', 'town-square'])
const unknownCaravan = buildWorldEventCaravanPresentation([events[6]])[0]
assert.equal(unknownCaravan.channel, 'generic')
assert.equal(unknownCaravan.destination, 'settlement-gate')

const approach = resolveWorldEventCaravanJourney(0.1)
const dwell = resolveWorldEventCaravanJourney(0.5)
const depart = resolveWorldEventCaravanJourney(0.82)
const reduced = resolveWorldEventCaravanJourney(0.1, true)
assert.equal(approach.segment, 'approach')
assert.equal(approach.arrived, false)
assert.equal(dwell.segment, 'dwell')
assert.equal(dwell.arrived, true)
assert.equal(depart.segment, 'depart')
assert.equal(depart.arrived, false)
assert.deepEqual(reduced, { segment: 'dwell', progress: 0.5, arrived: true })

console.log('worldEventPresentation tests passed')
