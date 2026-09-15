# Living World — reviewed Pixi sprite binding adapter v1

Date: 2026-09-15
Base: `cd465f0254fb529e2fb3f9b7dcd08f960dc5e907`

## Why

The reviewed distant-settlement SVG, canonical readiness boundary and fail-closed mount policy are now on `main`. The next renderer step must use Pixi v8 asset loading without creating another runtime owner, Application or ticker, and must never create a display object before the canonical mount decision allows it.

## Change

Added `worldReviewedSpriteBinding.ts`, a renderer-side adapter that receives the already deferred Pixi module from the existing `WorldStage` boot. It uses `Assets.load(...)`, feeds the exact slot load outcome through `resolveWorldAssetMountDecision(...)`, and creates `new Sprite(texture)` only for the canonical `reviewed-asset` decision.

Load failure, missing/unreviewed slot, rejected/tainted manifest or non-ready state all return `procedural-fallback` with `sprite: null`. The adapter does not import `pixi.js`, instantiate `Application`, own a ticker, touch DOM overlays or alter world state.

The existing mandatory reviewed-asset regression now source-checks the adapter contract, including deferred Pixi ownership and absence of a second Application/ticker.

## Guardrails

- no financial formulas, broker/API, Data Trust, Metric Drill-down, Codex or v1 files;
- no new binary assets;
- reviewed local SVG/provenance unchanged;
- one runtime owner / one Pixi Application / one ticker unchanged;
- reduced-motion/mobile/Samsung policy unchanged;
- no bundle/security/test threshold changes.

## Next

Wire this adapter into the existing `WorldStage` deferred Pixi boot for `background.distant-settlement`: resolve readiness for that exact slot, await the adapter, add the returned sprite to the existing `background` layer only when mode is `reviewed-asset`, size it to the 1600×900 world coordinate space, and leave the current procedural background untouched on every fallback path. Do not create a DOM overlay or a second renderer.
