# Living World — Ambient Activity v1

Date: 2026-09-15
Branch: `chatgpt/living-world-ambient-activity-v1`
Base: `b93affdb74191bc3a0895fed1d4cf9680bbde6fb` (`main` after Atmosphere Depth v1)

## Why this pass exists

Atmosphere Depth v1 made the world materially richer, but the settlement still read as a static diorama. The next safe visual gap is restrained life: workers and rail logistics that make the existing level progression feel inhabited without creating an economy simulator or reading financial values inside the renderer.

The old draft PR #342 contains much broader activity, actor-atlas and event-caravan work, but it is stale/conflicted and intentionally was not reused wholesale. This pass was rebuilt from latest `main` as a small, clean delta.

## What changed

- Added `worldAmbientActivityPresentation.ts`, a pure presentation-only boundary driven only by already-resolved `level`, `timePhase` and `weather` from `WorldRenderSnapshot`.
- Added a capped deterministic roster of fallback actor roles: miner, hauler, builder, keeper and resident.
- Actor availability increases only with existing DNA level thresholds. No money, portfolio value, returns, holdings, payouts or broker fields are visible to the activity policy.
- Added one/two low-cost mine-cart silhouettes at higher existing level thresholds.
- Added deterministic route loops for mine, haul, build, yard and residential activity.
- Existing single Pixi ticker remains the only animation loop.
- Night and explicit rain/storm reduce ambient movement speed only. `neutral` weather is fail-closed and does not invent a clear-weather state.
- `prefers-reduced-motion` keeps workers/carts visible but stationary.
- Added renderer diagnostics for current fallback actor/cart counts.
- Added regression coverage inside the existing `worldRenderSnapshot` test gate; no package/test-runner expansion was required.

## Data honesty and semantics

This is visual choreography only.

It does not model:
- inventory;
- production output;
- mining yield;
- capital;
- income;
- rewards;
- transaction amounts;
- trading;
- portfolio performance.

The renderer still receives only `WorldRenderSnapshot`. XP totals and finance data remain outside the renderer boundary.

`neutral` weather leaves activity at the ordinary phase-defined pace. Only explicitly resolved `rain`/`storm` slow ambient motion.

## Production-art boundary

The new figures and carts are procedural fallback silhouettes, not approved final art. They use the existing `actors` and `logistics` scene layers and do not bypass or modify the reviewed world-asset manifest. Future reviewed sprites can replace these silhouettes without changing the activity state contract.

No PNG/JPG/WebP/GIF/video/archive was added.

## Parallel Codex boundary

Codex is working in parallel on Metric Drill-down + Explainability.

This pass intentionally does not touch:
- Board/Pult metrics;
- TWR/XIRR/IMOEX/Health/income methodology;
- ContextHelp/glossary;
- metric cards or drill-down surfaces;
- PrimaryNavigation / SectionSelector;
- Asset Workspace / Pulse;
- broker/API/runtime recovery.

## Review expectations

QUANT
- no finance methodology changes;
- no daily metrics or expectedYield interpretation;
- no money/returns in activity policy.

CODE
- one pure presentation boundary;
- one Pixi Application / one existing ticker;
- no duplicate permanent state owner;
- no reuse of the stale #342 history.

MOBILE
- no new DOM layout/scroll owner;
- procedural activity remains inside the existing canvas;
- reduced-motion becomes stationary, not hidden.

RELEASE
- branch starts at current main after PR #343;
- no bundle-budget increase;
- no binary artifacts;
- no Codex Metric Drill-down files.

## Verification target

Before merge:
- TypeScript/Vite build;
- full `test:core`;
- Living World runtime regression;
- dependency/security gates;
- production/API checks from workflow;
- bundle budget unchanged;
- clean diff against current `main`;
- fresh PR-triggered CI green.
