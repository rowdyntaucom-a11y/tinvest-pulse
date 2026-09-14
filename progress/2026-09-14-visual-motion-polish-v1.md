# QVANIX · visual motion polish v1

Date: 2026-09-14
Starting main: `160d4f73408f6fd7d90021a91cc33bb3debda9ea`
Branch: `qvanix-visual-motion-polish-v1`

## Scope

Visualisation and animation only. Financial calculations, broker/API boundaries, analytics methodology, payout logic, portfolio normalization, DNA financial state and trading behavior are intentionally untouched.

## Why

The current project direction calls for QVANIX to feel alive through restrained state-aware motion without making charts harder to read. Existing visual primitives already expose truthful data, so this pass improves how those primitives enter and respond rather than adding another metric or data source.

## Implemented

- `MetricSparkline` now renders a separate soft trace glow and a crisp line over the same existing SVG path.
- Full-motion mode draws the existing sparkline path on entry; reduced/off modes remove non-essential glow and animation.
- `prefers-reduced-motion` disables all sparkline reveal animation regardless of the in-app motion profile.
- Portfolio allocation donut segments reveal from their real existing arc geometry; no value or weight calculation changed.
- Selecting a donut segment remounts only the center presentation block, giving the selected label/weight/value a short morph without re-running financial logic.
- The selected legend row gets a tiny positional focus cue and dot pulse in full-motion mode.
- Donut segments and legend buttons now expose `aria-pressed` for the selected visual state.
- Reduced/off and OS-level reduced-motion paths keep the interaction static and readable.

## Guardrails

- No backend, API, storage, dependency, route or schema change.
- No changes to `metrics.ts`, portfolio/income calculation modules, normalization, TWR/XIRR, benchmark, risk, tax or payout formulas.
- No invented interpolation, forecasts, recommendations or derived financial values.
- No continuous decorative motion; all new animation is short-lived and tied to mount/selection.
- No layout-shifting animation; transforms/opacity/stroke effects only.

## Files

- `v2/src/features/shared/MetricSparkline.tsx`
- `v2/src/features/shared/metricSparkline.css`
- `v2/src/features/portfolio/AllocationDonutView.tsx`
- `v2/src/features/portfolio/allocationDonut.css`

## Release gate

Run the existing v2 build/core regression/bundle checks in GitHub CI before merge. If any bundle, TypeScript, accessibility-related lint/build, or regression gate fails, keep the PR unmerged and fix only within this visual scope.
