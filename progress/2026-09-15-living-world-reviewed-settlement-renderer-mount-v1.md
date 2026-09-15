# Living World — reviewed distant settlement renderer mount v1

Date: 2026-09-15
Base: `6969ecbfac9f52ec332e9628fd39397a831acbe4`

## Why

The Living World already had the first reviewed local SVG (`background.distant-settlement`), canonical manifest/readiness, fail-closed mount policy, and a Pixi-v8 sprite binding adapter. The remaining gap was visible: the reviewed art was still not mounted into the actual world canvas.

## Change

`WorldStage` now executes the reviewed sprite binding inside the existing deferred Pixi boot:

- the dynamic Pixi import supplies `Assets` + `Sprite` to the existing binding adapter;
- canonical `resolveWorldAssetReadiness(...)` must approve `background.distant-settlement`;
- `bindReviewedAssetSprite(...)` must return `reviewed-asset` before any display object is mounted;
- the sprite is mounted into a dedicated background container between near mountains and procedural forest;
- the reviewed SVG is fitted to the existing 1600×900 logical world;
- the existing procedural mountains/forest/development remain present underneath/around it as fail-closed fallback;
- load/binding failure does not fail renderer boot and leaves `reviewedSettlementMounted=false`.

The existing browser-native preload diagnostics remain in place for now; Pixi binding uses `Assets.load(...)` through the reviewed adapter. A later cleanup can consolidate duplicate warm-up paths only if it preserves the same fail-closed diagnostics and bundle behavior.

## Runtime invariants

- one `WorldStage` runtime owner;
- one Pixi `Application`;
- one ticker registration;
- no DOM overlay;
- `pixi.js` remains dynamically imported/deferred;
- reduced-motion/mobile FPS behavior unchanged;
- reviewed art is additive and does not remove procedural fallback.

## Regression

`worldReviewedAssets.test.ts` now verifies that `WorldStage`:

- imports Pixi dynamically with `Assets` and `Sprite`;
- creates the dedicated `background.distant-settlement` slot container;
- uses canonical readiness and `bindReviewedAssetSprite(...)`;
- mounts only the returned sprite;
- exposes binding/mount diagnostics;
- still contains exactly one `new Application()` and one `next.ticker.add(...)`.

## Boundaries

No financial formulas, broker/API/Data Trust/Metric Drill-down/Codex/v1 files changed. No new asset files or binaries were added. No bundle, security, or test threshold was changed.

## Next

After green CI/merge and Render verification, visually inspect the mounted settlement on Samsung/preview. Then continue production-art one reviewed slot at a time, prioritizing a foreground structural/terrain element that improves scene depth without replacing semantic actors or introducing a second renderer owner.
