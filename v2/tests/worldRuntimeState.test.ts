import assert from 'node:assert/strict'
import { composeWorldRuntimeState, WORLD_RUNTIME_STATE_VERSION } from '../src/features/dna/worldRuntimeStatePolicy.ts'

type Event = { id: string; xp: number }
type Ledger = { accumulatedXp: number; acceptedEvents: number }
type WorldEvent = { id: string }
type World = {
  level: number
  xp: number
  xpToNext: number | null
  qualityCoverage: number
  weather: string
  events: WorldEvent[]
}

const adapters = {
  readXpEvents: (persisted: unknown): Event[] => {
    if (!persisted || typeof persisted !== 'object') return []
    const raw = persisted as { version?: unknown; events?: unknown }
    if (raw.version !== '0.1' || !Array.isArray(raw.events)) return []
    return raw.events.filter((event): event is Event => Boolean(
      event
      && typeof event === 'object'
      && typeof (event as Event).id === 'string'
      && Number.isFinite((event as Event).xp)
      && (event as Event).xp >= 0,
    ))
  },
  buildLedger: (events: Event[]): Ledger => ({
    accumulatedXp: events.reduce((sum, event) => sum + event.xp, 0),
    acceptedEvents: events.length,
  }),
  buildEvents: (events: Event[]): WorldEvent[] => events.map(event => ({ id: `xp:${event.id}` })),
  buildWorld: (input: {
    level: number
    xp: number
    xpToNext: number | null
    qualityCoverage: number
    weather: string
    events: WorldEvent[]
  }): World => ({ ...input }),
}

const empty = composeWorldRuntimeState(
  {
    qualityCoverage: 0.5,
    persistedXp: null,
    level: 1,
    xpToNext: null,
    weather: 'neutral',
  },
  adapters,
)

assert.equal(WORLD_RUNTIME_STATE_VERSION, '0.1')
assert.equal(empty.world.level, 1)
assert.equal(empty.world.xp, 0)
assert.equal(empty.world.qualityCoverage, 0.5)
assert.equal(empty.world.events.length, 0)
assert.equal(empty.persistedXpEvents, 0)

const populated = composeWorldRuntimeState(
  {
    qualityCoverage: 0.75,
    persistedXp: { version: '0.1', events: [{ id: 'plan', xp: 12 }, { id: 'health', xp: 8 }] },
    level: 3,
    xpToNext: 15,
    weather: 'cloudy',
  },
  adapters,
)

assert.equal(populated.world.level, 3)
assert.equal(populated.world.xp, 20)
assert.equal(populated.world.xpToNext, 15)
assert.equal(populated.world.qualityCoverage, 0.75)
assert.equal(populated.world.weather, 'cloudy')
assert.deepEqual(populated.world.events, [{ id: 'xp:plan' }, { id: 'xp:health' }])
assert.equal(populated.ledger.accumulatedXp, 20)
assert.equal(populated.persistedXpEvents, 2)

const corrupt = composeWorldRuntimeState(
  {
    qualityCoverage: 0.25,
    persistedXp: { version: 'bad', events: [{ id: 'ghost', xp: 999 }] },
    level: 2,
    xpToNext: null,
    weather: 'neutral',
  },
  adapters,
)
assert.equal(corrupt.world.xp, 0)
assert.equal(corrupt.world.events.length, 0)
assert.equal(corrupt.persistedXpEvents, 0)

console.log('world runtime-state composition policy regression: ok')
