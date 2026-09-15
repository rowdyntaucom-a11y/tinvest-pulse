import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveWorldAssetManifest } from '../src/features/world/worldAssetManifest.ts'
import { resolveWorldAssetReadiness } from '../src/features/world/worldAssetReadiness.ts'

const reviewedSource = readFileSync(new URL('../src/features/world/worldReviewedAssets.ts', import.meta.url), 'utf8')
assert.match(reviewedSource, /slotId:\s*'terrain\.ground'/)
assert.match(reviewedSource, /assetPath:\s*'\/assets\/world\/terrain-ground-v1\.svg'/)
assert.match(reviewedSource, /source:\s*'reviewed-local'/)
assert.match(reviewedSource, /reviewedAt:\s*'2026-09-15T18:20:00\.000Z'/)

const manifest = resolveWorldAssetManifest([
  {
    slotId: 'terrain.ground',
    assetPath: '/assets/world/terrain-ground-v1.svg',
    provenance: { source: 'reviewed-local', reviewedAt: '2026-09-15T18:20:00.000Z' },
  },
])
assert.equal(manifest.rejectedCount, 0)
assert.equal(manifest.entries.get('terrain.ground')?.assetPath, '/assets/world/terrain-ground-v1.svg')

const readiness = resolveWorldAssetReadiness(manifest, ['terrain.ground'])
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
