import assert from 'node:assert/strict'
import {
  buildWorldEventArrivalPresentation,
  WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
} from '../src/features/world/worldEventArrivalPresentation.ts'
import type { WorldEventCaravanPlan } from '../src/features/world/worldEventCaravanPresentation.ts'

function plan(destination: WorldEventCaravanPlan['destination']): WorldEventCaravanPlan {
  return {
    version: '0.2',
    id: `event-${destination}`,
    channel: 'generic',
    kind: 'courier',
    route: 'lower-road',
    direction: 'eastbound',
    destination,
    accentColor: 0x66ffe2,
    phaseOffset: 0.2,
    pace: 0.9,
    scale: 1,
  }
}

assert.equal(WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION, '0.1')

assert.deepEqual(
  buildWorldEventArrivalPresentation(plan('mine-yard')),
  {
    version: '0.1',
    destination: 'mine-yard',
    activity: 'stockpile-drop',
    responder: 'worker',
    accentColor: 0x66ffe2,
    intensity: 0.72,
  },
)

assert.equal(buildWorldEventArrivalPresentation(plan('workshop')).activity, 'repair-bench')
assert.equal(buildWorldEventArrivalPresentation(plan('construction-yard')).responder, 'builder')
assert.equal(buildWorldEventArrivalPresentation(plan('storehouse')).activity, 'treasury-unload')
assert.equal(buildWorldEventArrivalPresentation(plan('settlement-gate')).activity, 'message-handoff')
assert.equal(buildWorldEventArrivalPresentation(plan('town-square')).activity, 'celebration-gathering')

for (const destination of [
  'mine-yard',
  'workshop',
  'construction-yard',
  'storehouse',
  'settlement-gate',
  'town-square',
] as const) {
  const arrival = buildWorldEventArrivalPresentation(plan(destination))
  assert.ok(arrival.intensity >= 0 && arrival.intensity <= 1)
  assert.equal(arrival.destination, destination)
}

console.log('worldEventArrivalPresentation tests passed')
