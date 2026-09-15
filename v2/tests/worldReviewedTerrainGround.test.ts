import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { REVIEWED_WORLD_ASSET_MANIFEST } from '../src/features/world/worldReviewedAssets.ts'
import { resolveWorldAssetReadiness } from '../src/features/world/worldAssetReadiness.ts'

const entry = REVIEWED_WORLD_ASSET_MANIFEST.entries.get('terrain.ground')
assert.ok(entry)
assert.equal(entry.assetPath, '/assets/world/terrain-ground-v1.svg')
assert.equal(entry.provenance.source, 'reviewed-local')
assert.equal(entry.provenance.reviewedAt, '2026-09-15T18:20:00.000Z')
assert.equal(REVIEWED_WORLD_ASSET_MANIFEST.rejectedCount, 0)

const readiness = resolveWorldAssetReadiness(REVIEWED_WORLD_ASSET_MANIFEST, ['terrain.ground'])
assert.deepEqual(readiness.reviewedSlots, ['terrain.ground'])
assert.deepEqual(readiness.proceduralFallbackSlots, [])
assert.equal(readiness.productionArtReady, true)

const svg = readFileSync(new URL('../public/assets/world/terrain-ground-v1.svg', import.meta.url), 'utf8')
assert.match(svg, /^<svg\b/)
assert.match(svg, /viewBox="0 0 1600 900"/)
assert.doesNotMatch(svg, /<script\b/i)
assert.doesNotMatch(svg, /<foreignObject\b/i)
assert.doesNotMatch(svg, /(?:href|src)\s*=\s*["']https?:/i)
assert.doesNotMatch(svg, /url\(\s*https?:/i)
assert.match(svg, /Layered rocky foreground terrain/)

console.log('Living World reviewed terrain ground asset regression: ok')
