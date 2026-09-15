import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveWorldAssetManifest } from '../src/features/world/worldAssetManifest.ts'
import { resolveWorldAssetReadiness } from '../src/features/world/worldAssetReadiness.ts'
import { resolveWorldAssetMountDecision } from '../src/features/world/worldAssetMountPolicy.ts'

const reviewedSource = readFileSync(new URL('../src/features/world/worldReviewedAssets.ts', import.meta.url), 'utf8')
assert.match(reviewedSource, /slotId:\s*'background\.distant-settlement'/)
assert.match(reviewedSource, /assetPath:\s*'\/assets\/world\/distant-settlement-v1\.svg'/)
assert.match(reviewedSource, /slotId:\s*'terrain\.ground'/)
assert.match(reviewedSource, /assetPath:\s*'\/assets\/world\/terrain-ground-v1\.svg'/)
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

const partial = resolveWorldAssetReadiness(manifest, ['background.distant-settlement', 'terrain.ground'])
assert.deepEqual(partial.reviewedSlots, ['background.distant-settlement'])
assert.deepEqual(partial.proceduralFallbackSlots, ['terrain.ground'])
assert.equal(partial.productionArtReady, false)

const complete = resolveWorldAssetReadiness(manifest, ['background.distant-settlement', 'background.distant-settlement'])
assert.deepEqual(complete.reviewedSlots, ['background.distant-settlement'])
assert.deepEqual(complete.proceduralFallbackSlots, [])
assert.equal(complete.productionArtReady, true)

const rejected = resolveWorldAssetManifest([
  {
    slotId: 'background.sky',
    assetPath: 'https://example.com/sky.svg',
    provenance: { source: 'reviewed-local', reviewedAt: '2026-09-15T15:00:00.000Z' },
  },
])
assert.equal(resolveWorldAssetReadiness(rejected, []).productionArtReady, false)

const loadedSettlement = {
  version: '0.1' as const,
  loaded: new Map([['background.distant-settlement', { kind: 'image' }]]),
  failures: [],
}
const mountReviewed = resolveWorldAssetMountDecision(manifest, complete, loadedSettlement, 'background.distant-settlement')
assert.deepEqual(mountReviewed, {
  version: '0.1',
  slotId: 'background.distant-settlement',
  assetPath: '/assets/world/distant-settlement-v1.svg',
  mode: 'reviewed-asset',
  reason: 'REVIEWED_ASSET_LOADED',
})

const notLoaded = resolveWorldAssetMountDecision(
  manifest,
  complete,
  { version: '0.1' as const, loaded: new Map(), failures: [] },
  'background.distant-settlement',
)
assert.equal(notLoaded.mode, 'procedural-fallback')
assert.equal(notLoaded.reason, 'ASSET_NOT_LOADED')

const failedLoad = resolveWorldAssetMountDecision(
  manifest,
  complete,
  {
    version: '0.1' as const,
    loaded: new Map(),
    failures: [
      {
        slotId: 'background.distant-settlement',
        assetPath: '/assets/world/distant-settlement-v1.svg',
        reason: 'LOAD_FAILED' as const,
      },
    ],
  },
  'background.distant-settlement',
)
assert.equal(failedLoad.mode, 'procedural-fallback')
assert.equal(failedLoad.reason, 'ASSET_LOAD_FAILED')

const taintedManifest = resolveWorldAssetManifest([
  {
    slotId: 'background.distant-settlement',
    assetPath: '/assets/world/distant-settlement-v1.svg',
    provenance: { source: 'reviewed-local', reviewedAt: '2026-09-15T15:00:00.000Z' },
  },
  {
    slotId: 'background.sky',
    assetPath: 'https://example.com/not-local.svg',
    provenance: { source: 'reviewed-local', reviewedAt: '2026-09-15T15:00:00.000Z' },
  },
])
assert.equal(taintedManifest.entries.has('background.distant-settlement'), true)
assert.equal(taintedManifest.rejectedCount, 1)
const taintedReadiness = resolveWorldAssetReadiness(taintedManifest, ['background.distant-settlement'])
const taintedDecision = resolveWorldAssetMountDecision(
  taintedManifest,
  taintedReadiness,
  loadedSettlement,
  'background.distant-settlement',
)
assert.equal(taintedDecision.mode, 'procedural-fallback')
assert.equal(taintedDecision.reason, 'MANIFEST_NOT_READY')

const terrainReadiness = resolveWorldAssetReadiness(manifest, ['terrain.ground'])
const spoofedUnreviewed = resolveWorldAssetMountDecision(
  manifest,
  terrainReadiness,
  {
    version: '0.1' as const,
    loaded: new Map([['terrain.ground', { kind: 'image' }]]),
    failures: [],
  },
  'terrain.ground',
)
assert.equal(spoofedUnreviewed.mode, 'procedural-fallback')
assert.equal(spoofedUnreviewed.reason, 'MANIFEST_NOT_READY')

const bindingSource = readFileSync(new URL('../src/features/world/worldReviewedSpriteBinding.ts', import.meta.url), 'utf8')
assert.match(bindingSource, /resolveWorldAssetMountDecision\([\s\S]*?manifest,[\s\S]*?readiness,[\s\S]*?loadResult/)
assert.match(bindingSource, /pixi\.createSprite\(source\)/)
assert.match(bindingSource, /mode:\s*'procedural-fallback'/)
assert.match(bindingSource, /sprite:\s*null/)
assert.doesNotMatch(bindingSource, /Assets\.load/)
assert.doesNotMatch(bindingSource, /from\s+['"]pixi\.js['"]/)
assert.doesNotMatch(bindingSource, /new\s+Application\s*\(/)
assert.doesNotMatch(bindingSource, /ticker\.(?:add|update|start)/)

const stageSource = readFileSync(new URL('../src/features/world/WorldStage.tsx', import.meta.url), 'utf8')
assert.match(stageSource, /const \{ Application, Container, Graphics, Sprite \} = await import\('pixi\.js'\)/)
assert.doesNotMatch(stageSource, /const \{ Application, Assets,/)
assert.match(stageSource, /reviewedSettlementLayer\.label = 'asset-slot:background\.distant-settlement'/)
assert.match(stageSource, /reviewedTerrainLayer\.label = 'world:reviewed-terrain-ground'/)
assert.match(stageSource, /resolveWorldAssetReadiness\([\s\S]*?REVIEWED_WORLD_ASSET_MANIFEST,[\s\S]*?'background\.distant-settlement'/)
assert.match(stageSource, /const reviewedTerrainReadiness = resolveWorldAssetReadiness\([\s\S]*?'terrain\.ground'/)
assert.match(stageSource, /loadWorldAssetEntries\([\s\S]*?preloadBrowserImage\)/)
assert.match(stageSource, /const settlementBinding = bindReviewedAssetSprite\([\s\S]*?result,[\s\S]*?'background\.distant-settlement'/)
assert.match(stageSource, /const terrainBinding = bindReviewedAssetSprite\([\s\S]*?result,[\s\S]*?'terrain\.ground'/)
assert.match(stageSource, /Sprite\.from\(source as Parameters<typeof Sprite\.from>\[0\]\)/)
assert.match(stageSource, /reviewedSettlementLayer\.addChild\(sprite\)/)
assert.match(stageSource, /reviewedTerrainLayer\.addChild\(sprite\)/)
assert.match(stageSource, /data-world-reviewed-settlement-mounted=/)
assert.match(stageSource, /data-world-reviewed-terrain-mounted=/)
assert.match(stageSource, /setReviewedSettlementMounted\(false\)[\s\S]*?setReviewedTerrainMounted\(false\)/)
assert.match(stageSource, /data-world-reviewed-sprite-binding-version=/)
assert.equal((stageSource.match(/new Application\(\)/g) ?? []).length, 1)
assert.equal((stageSource.match(/next\.ticker\.add\(/g) ?? []).length, 1)

const svg = readFileSync(new URL('../public/assets/world/distant-settlement-v1.svg', import.meta.url), 'utf8')
assert.match(svg, /^<svg\b/)
assert.match(svg, /viewBox="0 0 1600 900"/)
assert.doesNotMatch(svg, /<script\b/i)
assert.doesNotMatch(svg, /<foreignObject\b/i)
assert.doesNotMatch(svg, /(?:href|src)\s*=\s*["']https?:/i)
assert.doesNotMatch(svg, /url\(\s*https?:/i)

console.log('Living World reviewed asset registry/readiness/mount-policy/sprite-binding regression: ok')
