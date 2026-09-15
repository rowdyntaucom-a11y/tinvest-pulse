# Living World — reviewed asset readiness on current main v1

Date: 2026-09-15
Base: `138eafad4000e9b89311353ab6efa6adfed36758`

## Why

The first reviewed production-art file (`background.distant-settlement`) is now on main, but renderer activation still needs a pure fail-closed answer for each requested slot: reviewed asset or procedural fallback. The older readiness PR predates the reviewed-art merge and is intentionally not reused.

## Change

Added `worldAssetReadiness.ts` on the current main line. It consumes only the already-resolved canonical manifest and caller-owned required slots, then reports reviewed slots, procedural fallback slots, manifest rejection count and strict `productionArtReady`.

The existing `worldReviewedAssets.test.ts` core regression now covers the real reviewed distant-settlement slot, a missing terrain slot, duplicate requested slots and rejected remote provenance/path behavior. This keeps the new boundary inside the already mandatory `test:core` gate without adding another test-runner surface.

## Guardrails

- no WorldStage/Pixi renderer/ticker/canvas change;
- no financial/broker/API/Data Trust/Metric Drill-down/Codex/v1 files;
- no new binary assets;
- existing reviewed SVG and procedural fallback remain unchanged;
- `productionArtReady` fails closed on any missing requested slot or any rejected manifest record.

## Next

Use this boundary during the renderer-binding pass for `background.distant-settlement`: mount only the reviewed local SVG after successful load, otherwise retain procedural background. Do not add another Pixi Application, ticker or runtime owner.
