import assert from 'node:assert/strict'
import { WANDERER_PALETTE, WANDERER_PRESENCE_VERSION, WANDERER_SILHOUETTE, resolveWandererMotion } from '../src/dna/runtime/wandererPresence.ts'

assert.equal(WANDERER_PRESENCE_VERSION,'v1')
assert.deepEqual(WANDERER_SILHOUETTE.anchor,{x:870,y:676})
assert.ok(WANDERER_SILHOUETTE.hat.length>=8)
assert.ok(WANDERER_SILHOUETTE.cloak.length>=8)
assert.ok(WANDERER_PALETTE.steel>0)
assert.ok(WANDERER_PALETTE.lanternCore>0)

const still=resolveWandererMotion(12_345,true)
assert.deepEqual(still,{x:870,y:676,rotation:0,lanternAlpha:.88})

const a=resolveWandererMotion(0,false)
const b=resolveWandererMotion(1_000,false)
assert.notDeepEqual(a,b)
assert.ok(Math.abs(a.x-870)<=5)
assert.ok(Math.abs(b.x-870)<=5)
assert.ok(Math.abs(b.y-676)<=2.2)
assert.ok(b.lanternAlpha>=.62&&b.lanternAlpha<=.94)

console.log('dnaWandererPresence regression passed')
