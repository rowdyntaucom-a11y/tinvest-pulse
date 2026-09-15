# Living World — Atmosphere Depth v1

Date: 2026-09-15
Branch: `chatgpt/living-world-atmosphere-depth-v1`
Base: `5fc5dc96bc52bbce1ba2dcddcd1eb98eac5a0e8d` (`main` at branch creation)

## Why this pass exists

QVANIX Living World currently has the correct v2 ownership/state boundaries, deferred Pixi loading, scene layers, asset slots and a reviewed-asset manifest. The reviewed production asset registry is intentionally empty, so the visible world is still mostly a procedural fallback: a flat sky, one mountain silhouette, a flat ground plane, level rectangles and one pulsing lamp.

This pass increases visual depth without introducing unreviewed binary assets, without bypassing the asset pipeline, and without touching the parallel UX Architecture + Comprehension work.

## What changed

- Added `worldAtmospherePresentation.ts`, a pure presentation-only mapping from already-resolved `timePhase` + `weather` to renderer parameters.
- Added distinct dawn/day/sunset/night palettes, celestial placement, stars and haze.
- Added deterministic far/near mountain depth, forest silhouettes and atmospheric bands.
- Added reviewed-weather-driven clouds, rain and restrained storm flash presentation.
- Added low-cost rail depth and richer procedural level structures while keeping the existing level thresholds.
- Added responsive decorative motion for work light/cloud/rain layers.
- Added `prefers-reduced-motion` handling: decorative movement and storm flash are disabled, while the scene and data-driven state remain visible.
- Added regression coverage to the existing `worldRenderSnapshot` test gate.

## Data honesty

This pass does **not** infer weather from portfolio returns, prices, expectedYield or any broker data.

`neutral` remains the fail-closed weather state. It intentionally renders no weather-specific clouds, rain or storm effect. Weather visuals are only selected from `WorldState.weather`, which is already resolved before the renderer boundary.

No TWR/XIRR/IMOEX/risk/bond/income methodology changed. No daily metrics, movers, forecasts, scores or recommendations were added.

## Runtime / ownership guardrails

- One Pixi `Application` remains the only Living World renderer owner.
- One existing ticker remains the only animation/update loop.
- `pixi.js` remains a dynamic import inside renderer boot; it is not pulled into the initial main bundle by this change.
- Existing `WORLD_SCENE_LAYER_ORDER`, asset slot ids and reviewed asset manifest remain unchanged.
- Reviewed art preloading remains independent and any future reviewed asset can continue replacing/enriching the procedural fallback without changing the state contract.

## Parallel-development boundary

The Codex clean-recovery epic is working on navigation, progressive disclosure, Pult hierarchy, comprehension/help and responsive UX. This Living World pass intentionally does not touch those surfaces.

Not changed here:

- primary navigation;
- `SectionSelector` / generic UX architecture;
- financial data state semantics;
- ContextHelp/glossary;
- Asset Workspace / Pulse;
- broker/API/runtime recovery;
- finance formulas;
- legacy/public DNA renderer chain;
- binary assets.

## Verification target

Required before merge:

- TypeScript/Vite build;
- full `test:core`;
- security/dependency gates required by repository CI;
- bundle budget with no limit increase;
- confirm Pixi remains deferred;
- clean diff against current `main`;
- no binary artifacts.

This branch should be reviewed/merged independently from the Codex UX clean-recovery PR to keep conflict risk low.
