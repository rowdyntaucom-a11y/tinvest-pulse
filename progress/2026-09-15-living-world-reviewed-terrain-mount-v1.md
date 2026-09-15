# Living World — reviewed terrain renderer mount v1

Date: 2026-09-15

## Coordination

This pass starts from `main` `532e1a804bae139d081a690907ff4605515cdb91`, after reviewed `terrain.ground` admission. Codex/Data Trust recovery is still open, so this Living World pass must remain unmerged even when CI is green. That keeps `main` stable while Codex rebuilds its true clean recovery.

## Scope

Mount the already reviewed `terrain.ground` asset through the same canonical runtime path as the distant-settlement layer:

- existing browser-native `loadWorldAssetEntries(...)` preload;
- canonical `resolveWorldAssetReadiness(...)` for the exact slot;
- canonical reviewed mount policy via `bindReviewedAssetSprite(...)`;
- caller-owned `Sprite.from(...)` inside the existing deferred Pixi boot;
- full 1600×900 placement in the existing terrain scene layer.

The procedural `ground` Graphics remain underneath the reviewed sprite. A missing, rejected or failed terrain asset therefore leaves the procedural terrain visible without creating a second renderer or alternate runtime.

## Runtime behavior

Reviewed settlement and reviewed terrain are evaluated independently from the same load result. A settlement failure no longer returns early and suppresses the terrain decision; either slot can independently resolve to reviewed art or procedural fallback.

DOM diagnostics expose `data-world-reviewed-terrain-mounted` alongside the existing settlement mount flag.

## Guardrails

- one runtime owner;
- one Pixi `Application`;
- one ticker;
- no Pixi `Assets.load(...)`;
- no new loader chunk or bundle-budget exception;
- current browser-native preload remains canonical after the prior `Assets.load` attempt exceeded the 525 KiB Pixi budget;
- no financial, broker/API, Data Trust, Metric Drill-down or v1 changes;
- no new asset file in this pass: the terrain SVG was already separately reviewed/admitted in #367;
- global cinematic grading continues to affect the complete canvas, including reviewed terrain.

## Regression

The existing mandatory `worldReviewedAssets.test.ts` now verifies:

- terrain reviewed-layer presence;
- canonical terrain readiness call;
- terrain binding through `bindReviewedAssetSprite(...)`;
- reviewed terrain sprite insertion;
- terrain mounted diagnostic;
- both reviewed mount flags fail closed in the loader error path;
- still exactly one `Application` and one ticker;
- no `Assets.load` in the binding path.

## Merge policy

Open a dedicated PR and run the complete v2 production CI. If green, keep the PR open and unmerged while Data Trust recovery is active. After Data Trust is reviewed/merged, fetch factual latest `main`, re-check ancestry/diff, transplant or rebase cleanly if needed, rerun CI if the head changes, then merge only with zero cross-scope drift.
