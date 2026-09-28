# QVANIX mobile cold-start stability — 2026-09-28

## Why this patch exists
Real Samsung review repeatedly showed a visible geometry/scale jump after the live portfolio finished loading. The financial data path itself was already healthy after PR #767; the remaining issue was presentation continuity.

## Root causes addressed
1. The Board used a generic loading placeholder whose geometry did not match the real Board. When the broker response arrived, React replaced the entire loading composition with the Board hero/context/module grid, causing a large layout discontinuity.
2. Theme/density/motion/detail attributes were copied to `<html>` only after the first React effect. Stored UI preferences therefore had a first-paint window where root-level theme selectors could render with defaults.
3. The mobile Data Trust text could wrap differently between LOADING and LIVE states and alter header height.

## Changes
- Added `BoardLoadingSkeleton` that reuses the production Board hero, context rail and module grid geometry without fabricating financial values.
- Board cold start now swaps skeleton content for live values inside the same layout footprint.
- Added an inline, defensive pre-paint preference bootstrap in `v2/index.html`; it validates stored enum values and applies only presentation attributes.
- Stabilized mobile Data Trust to a one-line, fixed-height header row.
- Added `coldStartLayoutStability.test.ts` and wired it into `test:core`.

## Guardrails preserved
- No missing financial value is converted to zero for display.
- No methodology, eligibility, broker integration or trading boundary changed.
- Reduced-motion remains supported.
- DNA / Living World remains untouched and frozen.

## Validation target
On Samsung/Android, reload `/v2/` from a cold start and watch the transition from “loading” to LIVE. The Board should retain the same overall scale and geometry instead of visibly shrinking/recomposing after the API response.
