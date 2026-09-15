import assert from 'node:assert/strict'
import {
  buildWorldEventCaravanPresentation,
  resolveWorldEventCaravanJourney,
  WORLD_EVENT_CARAVAN_JOURNEY_VERSION,
  WORLD_EVENT_CARAVAN_LIMIT,
  WORLD_EVENT_CARAVAN_PRESENTATION_VERSION,
} from '../src/features/world/worldEventCaravanPresentation.ts'
import type { WorldEvent } from '../src/features/dna/worldState.ts'

function event(id: string, kind: string): WorldEvent {
  return {
    id,
    kind,
    occurredAt: '2026-09-15T00:00:00.000Z',
    intensity: null,
    title: null,
  }
}

assert.equal(WORLD_EVENT_CARAVAN_PRESENTATION_VERSION, '0.2')
assert.equal(WORLD_EVENT_CARAVAN_JOURNEY_VERSION, '0.1')
assert.equal(WORLD_EVENT_CARAVAN_LIMIT, 3)

const income = buildWorldEventCaravanPresentation([
  event('income-1', 'xp:PASSIVE_INCOME_GROWTH'),
])
assert.equal(income.length, 1)
assert.equal(income[0]?.channel, 'income')
assert.equal(income[0]?.kind, 'treasury')
assert.equal(income[0]?.destination, 'storehouse')
assert.ok(income[0]?.direction === 'eastbound' || income[0]?.direction === 'westbound')
assert.equal(income[0]?.accentColor, 0x6ce5dd)
assert.ok((income[0]?.phaseOffset ?? -1) >= 0 && (income[0]?.phaseOffset ?? 2) < 1)

const strategy = buildWorldEventCaravanPresentation([
  event('strategy-1', 'xp:PLAN_ADHERENCE'),
])
assert.equal(strategy[0]?.destination, 'construction-yard')
assert.equal(strategy[0]?.kind, 'builder')

const discipline = buildWorldEventCaravanPresentation([
  event('discipline-1', 'xp:CONTRIBUTION_HABIT'),
])
assert.equal(discipline[0]?.destination, 'mine-yard')

const achievement = buildWorldEventCaravanPresentation([
  event('achievement-1', 'xp:ACHIEVEMENT'),
])
assert.equal(achievement[0]?.destination, 'town-square')

const unknown = buildWorldEventCaravanPresentation([
  event('future-1', 'xp:FUTURE_KIND'),
])
assert.equal(unknown[0]?.channel, 'generic')
assert.equal(unknown[0]?.kind, 'courier')
assert.equal(unknown[0]?.destination, 'settlement-gate')

const many = buildWorldEventCaravanPresentation([
  event('a', 'xp:CONTRIBUTION_HABIT'),
  event('b', 'xp:HEALTH_MILESTONE'),
  event('c', 'xp:PERFORMANCE_PERIOD'),
  event('d', 'xp:ACHIEVEMENT'),
])
assert.equal(many.length, WORLD_EVENT_CARAVAN_LIMIT)
assert.deepEqual(many.map(plan => plan.route), ['lower-road', 'upper-road', 'lower-road'])

const approach = resolveWorldEventCaravanJourney(0.18)
assert.equal(approach.segment, 'approach')
assert.equal(approach.arrived, false)
assert.ok(approach.progress > 0 && approach.progress < 1)

const dwell = resolveWorldEventCaravanJourney(0.5)
assert.equal(dwell.segment, 'dwell')
assert.equal(dwell.arrived, true)
assert.ok(dwell.progress > 0 && dwell.progress < 1)

const depart = resolveWorldEventCaravanJourney(0.8)
assert.equal(depart.segment, 'depart')
assert.equal(depart.arrived, false)
assert.ok(depart.progress > 0 && depart.progress < 1)

const reduced = resolveWorldEventCaravanJourney(0.01, true)
assert.equal(reduced.segment, 'dwell')
assert.equal(reduced.arrived, true)
assert.equal(reduced.progress, 0.5)

const wrappedJourney = resolveWorldEventCaravanJourney(1.18)
assert.deepEqual(wrappedJourney, approach)
const malformedJourney = resolveWorldEventCaravanJourney(Number.NaN)
assert.equal(malformedJourney.segment, 'approach')
assert.equal(malformedJourney.progress, 0)

const stableA = buildWorldEventCaravanPresentation([event('stable-id', 'xp:ACHIEVEMENT')])[0]
const stableB = buildWorldEventCaravanPresentation([event('stable-id', 'xp:ACHIEVEMENT')])[0]
assert.deepEqual(stableA, stableB)

const source = [event('immutability', 'xp:PLAN_ADHERENCE')]
const snapshot = JSON.stringify(source)
buildWorldEventCaravanPresentation(source)
assert.equal(JSON.stringify(source), snapshot)

console.log('worldEventCaravanPresentation tests passed')
