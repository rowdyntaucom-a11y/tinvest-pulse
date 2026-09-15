import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveWorldAssetManifest } from '../src/features/world/worldAssetManifest.ts'
import { resolveWorldAssetReadiness } from '../src/features/world/worldAssetReadiness.ts'

const reviewedSource = readFileSync(new URL('../src/features/world/worldReviewedAssets.ts', import.meta.url), 'utf8')
assert.match(reviewedSource, /slotId:\s*'structures\.workshop'/)
assert.match(reviewedSource, /assetPath:\s*'\/assets\/world\/workshop-v1\.svg'/)
assert.match(reviewedSource, /source:\s*'reviewed-local'/)
assert.match(reviewedSource, /reviewedAt:\s*'2026-09-15T20:15:00\.000Z'/)

const manifest = resolveWorldAssetManifest([
  {
    slotId: 'structures.workshop',
    assetPath: '/assets/world/workshop-v1.svg',
    provenance: { source: 'reviewed-local', reviewedAt: '2026-09-15T20:15:00.000Z' },
  },
])
assert.equal(manifest.rejectedCount, 0)
assert.equal(manifest.entries.get('structures.workshop')?.assetPath, '/assets/world/workshop-v1.svg')

const readiness = resolveWorldAssetReadiness(manifest, ['structures.workshop'])
assert.deepEqual(readiness.reviewedSlots, ['structures.workshop'])
assert.deepEqual(readiness.proceduralFallbackSlots, [])
assert.equal(readiness.productionArtReady, true)

const svg = readFileSync(new URL('../public/assets/world/workshop-v1.svg', import.meta.url), 'utf8')
assert.match(svg, /^<svg\b/)
assert.match(svg, /viewBox="0 0 1600 900"/)
assert.match(svg, /Reviewed workshop structure layer/)
assert.match(svg, /transform="translate\(500 385\)"/)
assert.doesNotMatch(svg, /<script\b/i)
assert.doesNotMatch(svg, /<foreignObject\b/i)
assert.doesNotMatch(svg, /(?:href|src)\s*=\s*["']https?:/i)
assert.doesNotMatch(svg, /url\(\s*https?:/i)
assert.doesNotMatch(svg, /<text\b/i, 'reviewed workshop asset must not bake interface or financial copy into production art')

console.log('Living World reviewed workshop asset regression: ok')
