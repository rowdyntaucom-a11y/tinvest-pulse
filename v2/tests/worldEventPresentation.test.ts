import assert from 'node:assert/strict'
import {
  WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
  buildWorldEventArrivalPresentation,
} from '../src/features/world/worldEventArrivalPresentation.ts'
import {
  WORLD_EVENT_ARRIVAL_MOTION_VERSION,
  resolveWorldEventArrivalMotion,
} from '../src/features/world/worldEventArrivalMotion.ts'
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
const caravans = buildWorldEventCaravanPresentation(result)
assert.equal(caravans.length, WORLD_EVENT_CARAVAN_LIMIT)
assert.deepEqual(caravans.map(item => item.channel), ['discipline', 'health'])
assert.deepEqual(caravans.map(item => item.destination), ['mine-yard', 'workshop'])
assert.deepEqual(buildWorldEventCaravanPresentation(result), caravans)
assert.equal(caravans.every(item => item.phaseOffset >= 0 && item.phaseOffset < 1), true)
assert.equal(caravans.every(item => item.pace > 0), true)
for (const caravan of caravans) {
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'amount'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'portfolioValue'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'return'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(caravan, 'xp'), false)
}

const semanticDestinations = buildWorldEventCaravanPresentation(buildWorldEventPresentation([
  events[3],
  events[5],
]))
assert.deepEqual(semanticDestinations.map(item => item.destination), ['storehouse', 'town-square'])
const unknownCaravan = buildWorldEventCaravanPresentation(buildWorldEventPresentation([events[6]]))[0]
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

assert.equal(WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION, '0.1')
const arrivalByDestination = new Map(
  result.slice(0, 6).map(item => {
    const plan = buildWorldEventCaravanPresentation([item])[0]
    return [plan.destination, buildWorldEventArrivalPresentation(plan)] as const
  }),
)
assert.equal(arrivalByDestination.get('mine-yard')?.activity, 'stockpile-drop')
assert.equal(arrivalByDestination.get('workshop')?.activity, 'repair-bench')
assert.equal(arrivalByDestination.get('settlement-gate')?.activity, 'message-handoff')
assert.equal(arrivalByDestination.get('storehouse')?.activity, 'treasury-unload')
assert.equal(arrivalByDestination.get('construction-yard')?.activity, 'construction-drop')
assert.equal(arrivalByDestination.get('town-square')?.activity, 'celebration-gathering')
assert.equal(arrivalByDestination.get('construction-yard')?.responder, 'builder')
assert.equal(arrivalByDestination.get('town-square')?.responder, 'resident')
for (const arrival of arrivalByDestination.values()) {
  assert.equal(arrival.version, WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION)
  assert.equal(arrival.emphasis > 0 && arrival.emphasis <= 1, true)
  assert.equal(Object.prototype.hasOwnProperty.call(arrival, 'amount'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(arrival, 'reward'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(arrival, 'xp'), false)
}

assert.equal(WORLD_EVENT_ARRIVAL_MOTION_VERSION, '0.1')
const hiddenMotion = resolveWorldEventArrivalMotion({
  arrived: false,
  reducedMotion: false,
  motionSeconds: 10,
  index: 0,
  emphasis: 0.8,
})
assert.deepEqual(hiddenMotion, {
  version: WORLD_EVENT_ARRIVAL_MOTION_VERSION,
  visible: false,
  glowAlpha: 0,
  sceneAlpha: 0,
  scale: 1,
  offsetY: 0,
  rotation: 0,
})
const reducedMotion = resolveWorldEventArrivalMotion({
  arrived: true,
  reducedMotion: true,
  motionSeconds: 10,
  index: 1,
  emphasis: 0.72,
})
assert.equal(reducedMotion.visible, true)
assert.equal(reducedMotion.offsetY, 0)
assert.equal(reducedMotion.rotation, 0)
assert.equal(reducedMotion.scale, 1)
const animatedMotion = resolveWorldEventArrivalMotion({
  arrived: true,
  reducedMotion: false,
  motionSeconds: 3.25,
  index: 1,
  emphasis: 0.86,
})
assert.deepEqual(animatedMotion, resolveWorldEventArrivalMotion({
  arrived: true,
  reducedMotion: false,
  motionSeconds: 3.25,
  index: 1,
  emphasis: 0.86,
}))
assert.equal(animatedMotion.visible, true)
assert.equal(animatedMotion.glowAlpha > 0 && animatedMotion.glowAlpha <= 0.3, true)
assert.equal(animatedMotion.sceneAlpha > 0 && animatedMotion.sceneAlpha <= 1, true)
assert.equal(animatedMotion.scale >= 0.98 && animatedMotion.scale <= 1.02, true)
assert.equal(Math.abs(animatedMotion.rotation) <= 0.012, true)
assert.equal(animatedMotion.offsetY <= 0 && animatedMotion.offsetY >= -2.4, true)

console.log('worldEventPresentation tests passed')
