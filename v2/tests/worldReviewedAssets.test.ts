import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { REVIEWED_WORLD_ASSET_ENTRIES, REVIEWED_WORLD_ASSET_MANIFEST } from '../src/features/world/worldReviewedAssets.ts'

assert.equal(REVIEWED_WORLD_ASSET_ENTRIES.length, 1)
assert.equal(REVIEWED_WORLD_ASSET_MANIFEST.rejectedCount, 0)
assert.equal(REVIEWED_WORLD_ASSET_MANIFEST.entries.size, 1)

const settlement = REVIEWED_WORLD_ASSET_MANIFEST.entries.get('background.distant-settlement')
assert.ok(settlement)
assert.equal(settlement.assetPath, '/assets/world/distant-settlement-v1.svg')
assert.equal(settlement.provenance.source, 'reviewed-local')
assert.equal(settlement.provenance.reviewedAt, '2026-09-15T15:00:00.000Z')

const svg = readFileSync(new URL('../public/assets/world/distant-settlement-v1.svg', import.meta.url), 'utf8')
assert.match(svg, /^<svg\b/)
assert.match(svg, /viewBox="0 0 1600 900"/)
assert.doesNotMatch(svg, /<script\b/i)
assert.doesNotMatch(svg, /<foreignObject\b/i)
assert.doesNotMatch(svg, /(?:href|src)\s*=\s*["']https?:/i)
assert.doesNotMatch(svg, /url\(\s*https?:/i)

console.log('Living World reviewed asset registry regression: ok')
