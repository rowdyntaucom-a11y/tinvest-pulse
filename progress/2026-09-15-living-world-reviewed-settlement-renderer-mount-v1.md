# Living World — reviewed distant settlement renderer mount v1

Date: `2026-09-15`
Base: `6969ecbfac9f52ec332e9628fd39397a831acbe4`

## Why

The Living World already had the first reviewed local SVG (`background.distant-settlement`), canonical manifest/readiness, fail-closed mount policy, and a reviewed sprite binding adapter. The remaining gap was visible: the reviewed art was still not mounted into the actual world canvas.

## Change

`WorldStage` now executes the reviewed sprite binding inside the existing deferred Pixi boot:

- canonical `resolveWorldAssetReadiness(...)` must approve `background.distant-settlement`;
- the existing browser-native `loadWorldAssetEntries(...)` result remains the only image-loading path;
- `bindReviewedAssetSprite(...)` consumes that exact fail-closed load result and may create a Pixi Sprite only after the canonical mount decision returns `reviewed-asset`;
- the Sprite is created with caller-owned `Sprite.from(...)` inside the already deferred Pixi runtime;
- the sprite mounts into a dedicated background container between near mountains and procedural forest;
- the reviewed SVG is fitted to the existing 1600×900 logical world;
- the existing procedural mountains/forest/development remain present underneath/around it as fail-closed fallback;
- load/binding/sprite creation failure does not fail renderer boot and leaves `reviewedSettlementMounted=false`.

## Bundle-gate correction

The first renderer attempt used Pixi `Assets.load(...)`. Production build itself compiled, but the mandatory bundle gate correctly rejected it because deferred `pixi-dna` increased to **554.1 KiB**, above the unchanged **525 KiB** ceiling.

The ceiling was not raised and chunking was not manipulated to hide the cost. Instead the reviewed binding was redesigned to consume the existing lightweight browser preload and use only `Sprite.from(...)`. This keeps trust/mount semantics unchanged while avoiding the heavy Pixi Assets loader path.

## Runtime invariants

- one `WorldStage` runtime owner;
- one Pixi `Application`;
- one ticker registration;
- no DOM overlay;
- `pixi.js` remains dynamically imported/deferred;
- reduced-motion/mobile FPS behavior unchanged;
- reviewed art is additive and does not remove procedural fallback.

## Regression

`worldReviewedAssets.test.ts` now verifies that:

- the binding uses canonical readiness + mount decision;
- the binding does **not** import/use Pixi `Assets`;
- `WorldStage` uses its existing browser-native loader and caller-owned `Sprite.from(...)`;
- the dedicated `background.distant-settlement` slot exists;
- the returned sprite is mounted into that slot;
- binding/mount diagnostics remain exposed;
- there is still exactly one `new Application()` and one `next.ticker.add(...)`.

## Boundaries

No financial formulas, broker/API/Data Trust/Metric Drill-down/Codex/v1 files changed. No new asset files or binaries were added. No bundle, security, or test threshold was changed.

## Next

After green CI/merge and Render verification, visually inspect the mounted settlement on Samsung/preview. Then continue production-art one reviewed slot at a time, prioritizing a foreground structural/terrain element that improves scene depth without replacing semantic actors or introducing a second renderer owner.
