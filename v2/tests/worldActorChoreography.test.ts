import assert from 'node:assert/strict'
import { resolveWorldActorChoreography, WORLD_ACTOR_CHOREOGRAPHY_VERSION } from '../src/features/world/worldActorChoreography.ts'
import type { WorldActorPlan } from '../src/features/world/worldLivingPresentation.ts'

function plan(role: WorldActorPlan['role']): WorldActorPlan {
  return {
    id: `${role}-test`,
    role,
    route: role === 'resident' ? 'resident-loop' : 'mine-loop',
    phaseOffset: 0,
    pace: 1,
    scale: 1,
    minLevel: 1,
  }
}

assert.equal(WORLD_ACTOR_CHOREOGRAPHY_VERSION, '0.1')

const minerStart = resolveWorldActorChoreography(plan('miner'), 0.05)
assert.equal(minerStart.routePhase, 0)
assert.equal(minerStart.action, 'work')
assert.equal(minerStart.carryLoad, false)
assert.equal(minerStart.atEndpoint, true)

const minerOutbound = resolveWorldActorChoreography(plan('miner'), 0.28)
assert.ok(minerOutbound.routePhase > 0)
assert.ok(minerOutbound.routePhase < 0.5)
assert.equal(minerOutbound.action, 'carry')
assert.equal(minerOutbound.carryLoad, true)
assert.equal(minerOutbound.atEndpoint, false)

const minerDestination = resolveWorldActorChoreography(plan('miner'), 0.5)
assert.equal(minerDestination.routePhase, 0.5)
assert.equal(minerDestination.action, 'work')
assert.equal(minerDestination.carryLoad, false)
assert.equal(minerDestination.atEndpoint, true)

const minerReturn = resolveWorldActorChoreography(plan('miner'), 0.72)
assert.ok(minerReturn.routePhase > 0.5)
assert.ok(minerReturn.routePhase < 1)
assert.equal(minerReturn.action, 'walk')
assert.equal(minerReturn.carryLoad, false)

const residentTravel = resolveWorldActorChoreography(plan('resident'), 0.28)
assert.equal(residentTravel.action, 'walk')
assert.equal(residentTravel.carryLoad, false)

const residentPause = resolveWorldActorChoreography(plan('resident'), 0.5)
assert.equal(residentPause.action, 'idle')
assert.equal(residentPause.atEndpoint, true)

const keeperTravel = resolveWorldActorChoreography(plan('keeper'), 0.28)
assert.equal(keeperTravel.action, 'walk')
assert.equal(keeperTravel.carryLoad, false)

const wrapped = resolveWorldActorChoreography(plan('builder'), 1.28)
const baseline = resolveWorldActorChoreography(plan('builder'), 0.28)
assert.deepEqual(wrapped, baseline)

const malformed = resolveWorldActorChoreography(plan('hauler'), Number.NaN)
assert.equal(malformed.routePhase, 0)
assert.equal(malformed.action, 'work')
assert.equal(malformed.atEndpoint, true)

console.log('worldActorChoreography tests passed')
