import assert from 'node:assert/strict'
import { buildQualitySnapshot } from '../src/features/dna/xpEngine.ts'
import { buildWorldRuntimeState, buildWorldRuntimeStateFromQualityInputs, WORLD_RUNTIME_STATE_VERSION } from '../src/features/dna/worldRuntimeState.ts'

const localDate = new Date('2026-09-13T12:00:00')
const quality = buildQualitySnapshot({
  twr: 0.04,
  healthScore: 72,
  contributionStreakMonths: null,
  passiveIncomeGrowth: null,
})

const empty = buildWorldRuntimeState({
  quality,
  persistedXp: null,
  progression: { level: 1, xpToNext: null },
  weather: 'neutral',
  localDate,
})

assert.equal(WORLD_RUNTIME_STATE_VERSION, '0.1')
assert.equal(empty.world.level, 1)
assert.equal(empty.world.xp, 0)
assert.equal(empty.world.qualityCoverage, 0.5)
assert.equal(empty.world.events.length, 0)
assert.equal(empty.ledger.acceptedEvents, 0)
assert.equal(empty.persistedXpEvents, 0)

const stored = {
  version: '0.1',
  updatedAt: '2026-09-13T10:00:00Z',
  events: [
    {
      id: 'plan-period:2026-09:v1',
      kind: 'PLAN_ADHERENCE',
      occurredAt: '2026-09-13T09:00:00Z',
      awardedXp: 12,
      ruleVersion: 'v1',
      sourceRef: 'strategy:2026-09',
    },
    {
      id: 'health-milestone:70:v1',
      kind: 'HEALTH_MILESTONE',
      occurredAt: '2026-09-12T09:00:00Z',
      awardedXp: 8,
      ruleVersion: 'v1',
      sourceRef: 'health:70',
    },
  ],
}

const populated = buildWorldRuntimeState({
  quality,
  persistedXp: stored,
  progression: { level: 3, xpToNext: 15 },
  weather: 'cloudy',
  localDate,
})

assert.equal(populated.world.level, 3)
assert.equal(populated.world.xp, 20)
assert.equal(populated.world.xpToNext, 15)
assert.equal(populated.world.weather, 'cloudy')
assert.equal(populated.world.events.length, 2)
assert.equal(populated.world.events[0].id, 'xp:plan-period:2026-09:v1')
assert.equal(populated.world.events[0].intensity, null)
assert.equal(populated.ledger.accumulatedXp, 20)
assert.equal(populated.persistedXpEvents, 2)

const corrupt = buildWorldRuntimeState({
  quality,
  persistedXp: { version: 'bad', events: stored.events },
  progression: { level: 2 },
  localDate,
})
assert.equal(corrupt.world.xp, 0)
assert.equal(corrupt.world.events.length, 0)
assert.equal(corrupt.persistedXpEvents, 0)

const qualityOnly = buildWorldRuntimeStateFromQualityInputs(
  { twr: 0.02, healthScore: null },
  { persistedXp: null, progression: { level: 1 }, localDate },
)
assert.equal(qualityOnly.world.qualityCoverage, 0.25)
assert.equal(qualityOnly.world.xp, 0)

console.log('world runtime-state bridge regression: ok')
