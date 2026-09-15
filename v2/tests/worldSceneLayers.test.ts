import assert from 'node:assert/strict'
import {
  WORLD_SCENE_LAYER_LABEL_RU,
  WORLD_SCENE_LAYER_ORDER,
  WORLD_SCENE_LAYER_VERSION,
  worldSceneLayerIndex,
} from '../src/features/world/worldSceneLayers.ts'

assert.equal(WORLD_SCENE_LAYER_VERSION, '0.2')
assert.deepEqual(WORLD_SCENE_LAYER_ORDER, [
  'background',
  'atmosphere',
  'terrain',
  'structures',
  'actors',
  'logistics',
  'events',
  'effects',
])
assert.ok(worldSceneLayerIndex('events') > worldSceneLayerIndex('logistics'))
assert.ok(worldSceneLayerIndex('events') < worldSceneLayerIndex('effects'))
assert.equal(WORLD_SCENE_LAYER_LABEL_RU.events, 'СОБЫТИЯ')

console.log('worldSceneLayers tests passed')
