import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  WORLD_ATMOSPHERE_PRESENTATION_VERSION,
  buildWorldAtmospherePresentation,
} from '../src/features/world/worldAtmospherePresentation.ts'

const rgbSum = (color: number) => ((color >> 16) & 0xff) + ((color >> 8) & 0xff) + (color & 0xff)

const neutralDay = buildWorldAtmospherePresentation({ timePhase: 'day', weather: 'neutral' })
const clearDay = buildWorldAtmospherePresentation({ timePhase: 'day', weather: 'clear' })
const cloudyDay = buildWorldAtmospherePresentation({ timePhase: 'day', weather: 'cloudy' })
const rainyDay = buildWorldAtmospherePresentation({ timePhase: 'day', weather: 'rain' })
const stormDay = buildWorldAtmospherePresentation({ timePhase: 'day', weather: 'storm' })
const dawn = buildWorldAtmospherePresentation({ timePhase: 'dawn', weather: 'neutral' })
const sunset = buildWorldAtmospherePresentation({ timePhase: 'sunset', weather: 'neutral' })
const night = buildWorldAtmospherePresentation({ timePhase: 'night', weather: 'neutral' })

assert.equal(WORLD_ATMOSPHERE_PRESENTATION_VERSION, '0.1')
assert.deepEqual(neutralDay, buildWorldAtmospherePresentation({ timePhase: 'day', weather: 'neutral' }))

assert.equal(neutralDay.cloudAlpha, 0)
assert.equal(neutralDay.rainAlpha, 0)
assert.equal(neutralDay.stormFlashAlpha, 0)
assert.equal(neutralDay.skyTop, clearDay.skyTop, 'clear weather must not recolor the reviewed phase palette')
assert.equal(clearDay.rainAlpha, 0)
assert.equal(clearDay.stormFlashAlpha, 0)

assert.ok(cloudyDay.cloudAlpha > clearDay.cloudAlpha)
assert.ok(rainyDay.rainAlpha > 0)
assert.ok(stormDay.rainAlpha > rainyDay.rainAlpha)
assert.ok(stormDay.stormFlashAlpha > 0)
assert.ok(stormDay.celestialAlpha < rainyDay.celestialAlpha)
assert.ok(rainyDay.celestialAlpha < clearDay.celestialAlpha)

assert.ok(rgbSum(cloudyDay.skyTop) < rgbSum(clearDay.skyTop))
assert.ok(rgbSum(rainyDay.skyTop) < rgbSum(cloudyDay.skyTop))
assert.ok(rgbSum(stormDay.skyTop) < rgbSum(rainyDay.skyTop))
assert.equal(stormDay.lamp, clearDay.lamp, 'weather shading must not dim the settlement lamp color')

assert.ok(dawn.starAlpha > neutralDay.starAlpha)
assert.ok(sunset.starAlpha > neutralDay.starAlpha)
assert.ok(night.starAlpha > sunset.starAlpha)
assert.ok(night.starAlpha > dawn.starAlpha)
assert.notEqual(dawn.skyHorizon, sunset.skyHorizon)
assert.notEqual(night.skyTop, neutralDay.skyTop)

for (const presentation of [neutralDay, clearDay, cloudyDay, rainyDay, stormDay, dawn, sunset, night]) {
  for (const alpha of [
    presentation.celestialAlpha,
    presentation.starAlpha,
    presentation.hazeAlpha,
    presentation.cloudAlpha,
    presentation.rainAlpha,
    presentation.stormFlashAlpha,
  ]) {
    assert.ok(alpha >= 0 && alpha <= 1)
  }
  assert.equal(Object.prototype.hasOwnProperty.call(presentation, 'portfolioValue'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(presentation, 'return'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(presentation, 'expectedYield'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(presentation, 'xp'), false)
}

const gradeCss = readFileSync(new URL('../src/features/world/worldCinematicGrade.css', import.meta.url), 'utf8')
const mainSource = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
assert.match(gradeCss, /\.world-stage\[data-world-time='dawn'\]/)
assert.match(gradeCss, /\.world-stage\[data-world-time='day'\]/)
assert.match(gradeCss, /\.world-stage\[data-world-time='sunset'\]/)
assert.match(gradeCss, /\.world-stage\[data-world-time='night'\]/)
assert.match(gradeCss, /\.world-stage\[data-world-weather='clear'\]/)
assert.match(gradeCss, /\.world-stage\[data-world-weather='cloudy'\]/)
assert.match(gradeCss, /\.world-stage\[data-world-weather='rain'\]/)
assert.match(gradeCss, /\.world-stage\[data-world-weather='storm'\]/)
assert.doesNotMatch(gradeCss, /\.world-stage\[data-world-weather='neutral'\]/, 'neutral weather must stay fail-closed with no extra grade')
assert.match(gradeCss, /filter:\s*[\s\S]*brightness\(var\(--world-phase-brightness\)\)[\s\S]*brightness\(var\(--world-weather-brightness\)\)/)
assert.match(gradeCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition:\s*none/)
assert.match(mainSource, /import '\.\/features\/world\/worldCinematicGrade\.css'/)

console.log('world atmosphere presentation tests passed')
