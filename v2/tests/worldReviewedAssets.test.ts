import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveWorldAssetManifest } from '../src/features/world/worldAssetManifest.ts'

const reviewedSource = readFileSync(new URL('../src/features/world/worldReviewedAssets.ts', import.meta.url), 'utf8')
assert.match(reviewedSource, /slotId:\s*'background\.distant-settlement'/)
assert.match(reviewedSource, /assetPath:\s*'\/assets\/world\/distant-settlement-v1\.svg'/)
assert.match(reviewedSource, /source:\s*'reviewed-local'/)
assert.match(reviewedSource, /reviewedAt:\s*'2026-09-15T15:00:00\.000Z'/)

const manifest = resolveWorldAssetManifest([
  {
    slotId: 'background.distant-settlement',
    assetPath: '/assets/world/distant-settlement-v1.svg',
    provenance: { source: 'reviewed-local', reviewedAt: '2026-09-15T15:00:00.000Z' },
  },
])
assert.equal(manifest.rejectedCount, 0)
assert.equal(manifest.entries.size, 1)
assert.equal(manifest.entries.get('background.distant-settlement')?.assetPath, '/assets/world/distant-settlement-v1.svg')

const svg = readFileSync(new URL('../public/assets/world/distant-settlement-v1.svg', import.meta.url), 'utf8')
assert.match(svg, /^<svg\b/)
assert.match(svg, /viewBox="0 0 1600 900"/)
assert.doesNotMatch(svg, /<script\b/i)
assert.doesNotMatch(svg, /<foreignObject\b/i)
assert.doesNotMatch(svg, /(?:href|src)\s*=\s*["']https?:/i)
assert.doesNotMatch(svg, /url\(\s*https?:/i)

console.log('Living World reviewed asset registry regression: ok')
