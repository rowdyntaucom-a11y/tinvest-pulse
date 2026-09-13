import assert from 'node:assert/strict'
import { buildWorldState, localTimePhase } from '../src/features/dna/worldState.ts'

assert.equal(localTimePhase(new Date(2026, 8, 13, 5, 0, 0)), 'dawn')
assert.equal(localTimePhase(new Date(2026, 8, 13, 8, 0, 0)), 'day')
assert.equal(localTimePhase(new Date(2026, 8, 13, 17, 0, 0)), 'sunset')
assert.equal(localTimePhase(new Date(2026, 8, 13, 20, 0, 0)), 'night')

const neutral = buildWorldState({
  level: 1,
  xp: 0,
  localDate: new Date(2026, 8, 13, 12, 0, 0),
})
assert.equal(neutral.weather, 'neutral')
assert.equal(neutral.level, 1)
assert.equal(neutral.xp, 0)
assert.equal(neutral.timePhase, 'day')
assert.deepEqual(neutral.events, [])

const normalized = buildWorldState({
  level: 3.9,
  xp: -50,
  xpToNext: -20,
  qualityCoverage: 2,
  weather: 'rain',
  localDate: new Date(2026, 8, 13, 18, 0, 0),
  events: [
    { id: ' older ', kind: ' xp:ACHIEVEMENT ', occurredAt: '2026-09-12T12:00:00Z', intensity: -2, title: ' A ' },
    { id: 'newer', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T12:00:00Z', intensity: 4, title: ' B ' },
    { id: 'newer', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T13:00:00Z', intensity: 0.5 },
    { id: '', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-13T14:00:00Z' },
    { id: 'bad-kind', kind: '   ', occurredAt: '2026-09-13T14:00:00Z' },
    { id: 'bad-date', kind: 'xp:ACHIEVEMENT', occurredAt: 'not-a-date' },
  ],
})

assert.equal(normalized.level, 3)
assert.equal(normalized.xp, 0)
assert.equal(normalized.xpToNext, 0)
assert.equal(normalized.qualityCoverage, 1)
assert.equal(normalized.weather, 'rain')
assert.equal(normalized.timePhase, 'sunset')
assert.deepEqual(normalized.events.map(event => event.id), ['newer', 'older'])
assert.equal(normalized.events[0].intensity, 1)
assert.equal(normalized.events[1].intensity, 0)
assert.equal(normalized.events[1].kind, 'xp:ACHIEVEMENT')
assert.equal(normalized.events[1].title, 'A')

const malformedWeather = buildWorldState({
  level: Number.NaN,
  xp: Number.POSITIVE_INFINITY,
  weather: 'hail' as never,
  localDate: new Date(2026, 8, 13, 2, 0, 0),
})
assert.equal(malformedWeather.level, 1)
assert.equal(malformedWeather.xp, 0)
assert.equal(malformedWeather.weather, 'neutral')
assert.equal(malformedWeather.timePhase, 'night')

console.log('worldState tests passed')
