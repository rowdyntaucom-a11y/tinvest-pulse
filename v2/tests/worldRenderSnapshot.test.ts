import assert from 'node:assert/strict'
import { buildWorldState } from '../src/features/dna/worldState.ts'
import { emptyWorldEventCursor, resolveWorldEventQueue } from '../src/features/dna/worldEventQueue.ts'
import { WORLD_RENDER_SNAPSHOT_VERSION, buildWorldRenderSnapshot } from '../src/features/dna/worldRenderSnapshot.ts'
import { WORLD_ASSET_SLOTS, WORLD_ASSET_SLOT_VERSION, worldAssetSlot, worldAssetSlotsForLayer } from '../src/features/world/worldAssetSlots.ts'
import { WORLD_SCENE_LAYER_ORDER, WORLD_SCENE_LAYER_VERSION, worldSceneLayerIndex } from '../src/features/world/worldSceneLayers.ts'

assert.equal(WORLD_RENDER_SNAPSHOT_VERSION, '0.1')
assert.equal(WORLD_SCENE_LAYER_VERSION, '0.1')
assert.deepEqual(WORLD_SCENE_LAYER_ORDER, [
  'background',
  'atmosphere',
  'terrain',
  'structures',
  'actors',
  'logistics',
  'effects',
])
assert.equal(new Set(WORLD_SCENE_LAYER_ORDER).size, WORLD_SCENE_LAYER_ORDER.length)
assert.equal(worldSceneLayerIndex('background'), 0)
assert.equal(worldSceneLayerIndex('effects'), WORLD_SCENE_LAYER_ORDER.length - 1)

assert.equal(WORLD_ASSET_SLOT_VERSION, '0.1')
assert.equal(new Set(WORLD_ASSET_SLOTS.map(slot => slot.id)).size, WORLD_ASSET_SLOTS.length)
for (const slot of WORLD_ASSET_SLOTS) {
  assert.equal(WORLD_SCENE_LAYER_ORDER.includes(slot.layer), true)
  assert.equal(slot.labelRu.trim().length > 0, true)
}
assert.equal(worldAssetSlot('terrain.mine-entrance')?.layer, 'terrain')
assert.equal(worldAssetSlot('actors.workers')?.layer, 'actors')
assert.equal(worldAssetSlotsForLayer('logistics').map(slot => slot.id).join(','), 'logistics.rails,logistics.carts,logistics.materials')

const state = buildWorldState({
  level: 4,
  xp: 125,
  xpToNext: 25,
  qualityCoverage: 0.8,
  weather: 'cloudy',
  localDate: new Date(2026, 8, 13, 18, 0, 0),
  events: [
    { id: 'seen', kind: 'xp:ACHIEVEMENT', occurredAt: '2026-09-12T10:00:00Z', title: 'Seen' },
    { id: 'pending', kind: 'xp:PLAN_ADHERENCE', occurredAt: '2026-09-13T10:00:00Z', title: 'Pending' },
  ],
})

const cursor = { ...emptyWorldEventCursor(), acknowledgedEventIds: ['seen'] }
const queue = resolveWorldEventQueue(state, cursor)
const snapshot = buildWorldRenderSnapshot(state, queue)

assert.equal(snapshot.version, '0.1')
assert.equal(snapshot.worldStateVersion, '0.1')
assert.equal(snapshot.level, 4)
assert.equal(snapshot.timePhase, 'sunset')
assert.equal(snapshot.weather, 'cloudy')
assert.equal(snapshot.pendingEventCount, 1)
assert.deepEqual(snapshot.pendingEvents.map(event => event.id), ['pending'])
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'xp'), false)
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'xpToNext'), false)
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'qualityCoverage'), false)
assert.equal(Object.prototype.hasOwnProperty.call(snapshot, 'acknowledgedEventIds'), false)

snapshot.pendingEvents[0].title = 'Changed only in renderer snapshot'
assert.equal(state.events.find(event => event.id === 'pending')?.title, 'Pending')

const emptyQueue = resolveWorldEventQueue(state, { version: '0.1', acknowledgedEventIds: ['pending', 'seen'] })
const emptySnapshot = buildWorldRenderSnapshot(state, emptyQueue)
assert.equal(emptySnapshot.pendingEventCount, 0)
assert.deepEqual(emptySnapshot.pendingEvents, [])

console.log('worldRenderSnapshot tests passed')
