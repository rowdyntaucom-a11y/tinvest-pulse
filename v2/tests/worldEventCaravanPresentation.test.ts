import assert from 'node:assert/strict'
import {
  buildWorldEventCaravanPresentation,
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

assert.equal(WORLD_EVENT_CARAVAN_PRESENTATION_VERSION, '0.1')
assert.equal(WORLD_EVENT_CARAVAN_LIMIT, 3)

const income = buildWorldEventCaravanPresentation([
  event('income-1', 'xp:PASSIVE_INCOME_GROWTH'),
])
assert.equal(income.length, 1)
assert.equal(income[0]?.channel, 'income')
assert.equal(income[0]?.kind, 'treasury')
assert.equal(income[0]?.accentColor, 0x6ce5dd)
assert.ok((income[0]?.phaseOffset ?? -1) >= 0 && (income[0]?.phaseOffset ?? 2) < 1)

const unknown = buildWorldEventCaravanPresentation([
  event('future-1', 'xp:FUTURE_KIND'),
])
assert.equal(unknown[0]?.channel, 'generic')
assert.equal(unknown[0]?.kind, 'courier')

const many = buildWorldEventCaravanPresentation([
  event('a', 'xp:CONTRIBUTION_HABIT'),
  event('b', 'xp:HEALTH_MILESTONE'),
  event('c', 'xp:PERFORMANCE_PERIOD'),
  event('d', 'xp:ACHIEVEMENT'),
])
assert.equal(many.length, WORLD_EVENT_CARAVAN_LIMIT)
assert.deepEqual(many.map(plan => plan.route), ['lower-road', 'upper-road', 'lower-road'])

const stableA = buildWorldEventCaravanPresentation([event('stable-id', 'xp:ACHIEVEMENT')])[0]
const stableB = buildWorldEventCaravanPresentation([event('stable-id', 'xp:ACHIEVEMENT')])[0]
assert.deepEqual(stableA, stableB)

const source = [event('immutability', 'xp:PLAN_ADHERENCE')]
const snapshot = JSON.stringify(source)
buildWorldEventCaravanPresentation(source)
assert.equal(JSON.stringify(source), snapshot)

console.log('worldEventCaravanPresentation tests passed')
