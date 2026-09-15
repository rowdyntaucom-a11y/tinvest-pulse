import assert from 'node:assert/strict'
import { buildWorldLivingPresentation, WORLD_LIVING_PRESENTATION_VERSION } from '../src/features/world/worldLivingPresentation.ts'
import type { WorldRenderSnapshot } from '../src/features/dna/worldRenderSnapshot.ts'

function snapshot(overrides: Partial<WorldRenderSnapshot> = {}): WorldRenderSnapshot {
  return {
    version: '0.1',
    worldStateVersion: '0.1',
    level: 1,
    timePhase: 'night',
    weather: 'neutral',
    pendingEvents: [],
    pendingEventCount: 0,
    ...overrides,
  }
}

assert.equal(WORLD_LIVING_PRESENTATION_VERSION, '0.2')

const base = buildWorldLivingPresentation(snapshot())
assert.equal(base.actors.length, 2)
assert.equal(base.cartCount, 0)
assert.equal(base.weather.rainAlpha, 0)
assert.equal(base.weather.lightning, false)
assert.equal(base.eventAccent, null)

const growing = buildWorldLivingPresentation(snapshot({ level: 6, timePhase: 'day' }))
assert.deepEqual(growing.actors.map(actor => actor.id), [
  'miner-a',
  'hauler-a',
  'builder-a',
  'keeper-a',
  'resident-a',
  'miner-b',
  'hauler-b',
])
assert.equal(growing.cartCount, 1)
assert.ok(growing.activityScale > base.activityScale)

const primaryChain = growing.actors.filter(actor => ['miner-a', 'hauler-a', 'builder-a'].includes(actor.id))
assert.deepEqual(primaryChain.map(actor => actor.role), ['miner', 'hauler', 'builder'])
assert.deepEqual(primaryChain.map(actor => actor.route), ['mine-loop', 'haul-loop', 'build-loop'])
assert.deepEqual(primaryChain.map(actor => actor.phaseOffset), [0.5, 0.06, 0.62])
assert.equal(new Set(primaryChain.map(actor => actor.pace)).size, 1)
assert.equal(primaryChain[0]?.pace, 0.72)

const mature = buildWorldLivingPresentation(snapshot({ level: 9 }))
assert.equal(mature.actors.length, 8)
assert.equal(mature.cartCount, 2)
assert.equal(mature.constructionActivity, 1)

const rain = buildWorldLivingPresentation(snapshot({ weather: 'rain' }))
assert.ok(rain.weather.rainAlpha > 0)
assert.equal(rain.weather.lightning, false)

const storm = buildWorldLivingPresentation(snapshot({ weather: 'storm' }))
assert.ok(storm.weather.rainAlpha > rain.weather.rainAlpha)
assert.equal(storm.weather.lightning, true)

const neutral = buildWorldLivingPresentation(snapshot({ weather: 'neutral' }))
assert.equal(neutral.weather.hazeAlpha, 0)
assert.equal(neutral.weather.rainAlpha, 0)

const event = buildWorldLivingPresentation(snapshot({
  pendingEvents: [{
    id: 'income-1',
    kind: 'xp:PASSIVE_INCOME_GROWTH',
    occurredAt: '2026-09-15T00:00:00.000Z',
    intensity: null,
    title: 'Income milestone',
  }],
  pendingEventCount: 1,
}))
assert.equal(event.eventAccent, 'income')

const invalidLevel = buildWorldLivingPresentation(snapshot({ level: Number.NaN }))
assert.equal(invalidLevel.actors.length, 2)
assert.equal(invalidLevel.cartCount, 0)

console.log('worldLivingPresentation tests passed')
