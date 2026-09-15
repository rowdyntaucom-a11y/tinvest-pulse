import assert from 'node:assert/strict'
import { resolveWorldAmbientActorChoreography } from '../src/features/world/worldAmbientActorChoreography.ts'
import {
  WORLD_PRIMARY_WORK_CHAIN_PACE,
  WORLD_PRIMARY_WORK_CHAIN_PHASE,
  buildWorldAmbientActivityPresentation,
} from '../src/features/world/worldAmbientActivityPresentation.ts'

const snapshot = {
  level: 2,
  timePhase: 'day' as const,
  weather: 'neutral' as const,
}

const presentation = buildWorldAmbientActivityPresentation(snapshot)
const miner = presentation.actors.find(actor => actor.id === 'miner-a')
const hauler = presentation.actors.find(actor => actor.id === 'hauler-a')
const builder = presentation.actors.find(actor => actor.id === 'builder-a')

assert.ok(miner)
assert.ok(hauler)
assert.ok(builder)
assert.equal(miner.pace, WORLD_PRIMARY_WORK_CHAIN_PACE)
assert.equal(hauler.pace, WORLD_PRIMARY_WORK_CHAIN_PACE)
assert.equal(builder.pace, WORLD_PRIMARY_WORK_CHAIN_PACE)
assert.equal(miner.phaseOffset, WORLD_PRIMARY_WORK_CHAIN_PHASE.miner)
assert.equal(hauler.phaseOffset, WORLD_PRIMARY_WORK_CHAIN_PHASE.hauler)
assert.equal(builder.phaseOffset, WORLD_PRIMARY_WORK_CHAIN_PHASE.builder)

const minerPose = resolveWorldAmbientActorChoreography({ actor: miner, phase: miner.phaseOffset })
const haulerPose = resolveWorldAmbientActorChoreography({ actor: hauler, phase: hauler.phaseOffset })
const builderPose = resolveWorldAmbientActorChoreography({ actor: builder, phase: builder.phaseOffset })
assert.equal(minerPose.action, 'work')
assert.equal(minerPose.showWorkCue, true)
assert.equal(haulerPose.action, 'carry')
assert.equal(haulerPose.showLoad, true)
assert.equal(builderPose.action, 'work')
assert.equal(builderPose.showWorkCue, true)

const secondary = buildWorldAmbientActivityPresentation({ ...snapshot, level: 8 }).actors.filter(actor => actor.id.endsWith('-b'))
assert.equal(secondary.length, 3)
assert.deepEqual(
  secondary.map(actor => [actor.id, actor.phaseOffset, actor.pace]),
  [
    ['miner-b', 0.63, 0.82],
    ['hauler-b', 0.16, 0.7],
    ['builder-b', 0.81, 0.62],
  ],
  'secondary ambient actors retain independent day timing',
)

const sunset = buildWorldAmbientActivityPresentation({ level: 8, timePhase: 'sunset', weather: 'neutral' })
const night = buildWorldAmbientActivityPresentation({ level: 8, timePhase: 'night', weather: 'neutral' })
const sunsetWorkerPaces = ['miner-a', 'hauler-a', 'builder-a'].map(id => sunset.actors.find(actor => actor.id === id)?.pace)
assert.ok(sunsetWorkerPaces.every(pace => pace === WORLD_PRIMARY_WORK_CHAIN_PACE * 0.8), 'primary work-chain remains phase-locked at sunset')
const dayResident = buildWorldAmbientActivityPresentation({ level: 8, timePhase: 'day', weather: 'neutral' }).actors.find(actor => actor.id === 'resident-a')
const sunsetResident = sunset.actors.find(actor => actor.id === 'resident-a')
const nightResident = night.actors.find(actor => actor.id === 'resident-a')
assert.ok(dayResident && sunsetResident && nightResident)
assert.ok(sunsetResident.pace > dayResident.pace, 'resident cadence is more visible at sunset')
assert.ok(nightResident.pace < sunsetResident.pace, 'night cadence is restrained')
assert.equal(night.cartCount, 1, 'night logistics remains visible but restrained')

const rainy = buildWorldAmbientActivityPresentation({ level: 2, timePhase: 'day', weather: 'rain' })
const storm = buildWorldAmbientActivityPresentation({ level: 8, timePhase: 'day', weather: 'storm' })
assert.ok(rainy.activityScale < presentation.activityScale)
assert.ok(storm.activityScale < rainy.activityScale)
assert.equal(storm.cartCount, 1, 'storm reduces visible cart density without inventing production state')
assert.equal(buildWorldAmbientActivityPresentation({ level: 8, timePhase: 'day', weather: 'neutral' }).cartCount, 2)

for (const phase of ['dawn', 'day', 'sunset', 'night'] as const) {
  const state = buildWorldAmbientActivityPresentation({ level: 8, timePhase: phase, weather: 'neutral' })
  assert.equal(state.actors.length, 8, 'time-of-day rhythm changes cadence, not inhabitant availability')
  for (const actor of state.actors) {
    assert.ok(actor.pace > 0)
    assert.equal(Object.prototype.hasOwnProperty.call(actor, 'amount'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(actor, 'inventory'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(actor, 'portfolioValue'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(actor, 'reward'), false)
  }
}

console.log('world ambient activity tests passed')
