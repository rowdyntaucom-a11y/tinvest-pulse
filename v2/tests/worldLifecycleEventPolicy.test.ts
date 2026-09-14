import assert from 'node:assert/strict'
import {
  WORLD_FIRST_SUNRISE_EVENT_ID,
  WORLD_FIRST_SUNRISE_EVENT_KIND,
  WORLD_LIFECYCLE_EVENT_POLICY_VERSION,
  buildFirstSunriseEventPolicy,
} from '../src/features/world/worldLifecycleEventPolicy.ts'
import {
  WORLD_SESSION_EVENT_POLICY_VERSION,
  mergeWorldSessionEvents,
} from '../src/features/world/worldSessionEventPolicy.ts'

assert.equal(WORLD_LIFECYCLE_EVENT_POLICY_VERSION, '0.1')
assert.equal(WORLD_FIRST_SUNRISE_EVENT_ID, 'world:first-sunrise')
assert.equal(WORLD_FIRST_SUNRISE_EVENT_KIND, 'world:FIRST_SUNRISE')
assert.equal(buildFirstSunriseEventPolicy([], { timePhase: 'night', observedAt: '2026-09-13T03:00:00Z' }), null)
assert.equal(buildFirstSunriseEventPolicy([], { timePhase: 'day', observedAt: '2026-09-13T10:00:00Z' }), null)
assert.equal(buildFirstSunriseEventPolicy([], { timePhase: 'dawn', observedAt: 'bad-date' }), null)

const first = buildFirstSunriseEventPolicy([], { timePhase: 'dawn', observedAt: '2026-09-13T05:15:00+00:00' })
assert.deepEqual(first, {
  id: 'world:first-sunrise',
  kind: 'world:FIRST_SUNRISE',
  occurredAt: '2026-09-13T05:15:00.000Z',
  intensity: null,
  title: 'Первый рассвет',
})
for (const key of ['xp', 'portfolioValue', 'weather', 'animation']) {
  assert.equal(Object.prototype.hasOwnProperty.call(first ?? {}, key), false)
}

assert.equal(buildFirstSunriseEventPolicy(['xp:achievement-1', 'world:first-sunrise'], {
  timePhase: 'dawn', observedAt: '2026-09-14T05:15:00Z',
}), null)
assert.equal(buildFirstSunriseEventPolicy([' world:first-sunrise '], {
  timePhase: 'dawn', observedAt: '2026-09-14T05:15:00Z',
}), null)

assert.equal(WORLD_SESSION_EVENT_POLICY_VERSION, '0.1')
const merged = mergeWorldSessionEvents(
  [
    {
      id: 'xp:health-1',
      kind: 'xp:HEALTH_MILESTONE',
      occurredAt: '2026-09-13T06:00:00Z',
      intensity: 0.4,
      title: 'Health',
    },
    {
      id: 'world:first-sunrise',
      kind: 'xp:SHOULD_KEEP_RUNTIME_PRECEDENCE',
      occurredAt: '2026-09-13T05:30:00Z',
      intensity: 2,
      title: 'Runtime wins',
    },
  ],
  [
    {
      id: 'world:first-sunrise',
      kind: 'world:FIRST_SUNRISE',
      occurredAt: '2026-09-13T05:15:00Z',
      title: 'Первый рассвет',
    },
    {
      id: 'bad-row',
      kind: '',
      occurredAt: 'not-a-date',
      title: 'invalid',
    },
  ],
)
assert.equal(merged.length, 2)
assert.equal(merged[0]?.id, 'xp:health-1')
assert.equal(merged[1]?.id, 'world:first-sunrise')
assert.equal(merged[1]?.kind, 'xp:SHOULD_KEEP_RUNTIME_PRECEDENCE')
assert.equal(merged[1]?.intensity, 1)

console.log('worldLifecycleEventPolicy tests passed')
