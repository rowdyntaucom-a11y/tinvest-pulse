# QVANIX v3 — Pult benchmark context pass

Date: 2026-09-20

## Why this pass

The master direction says the first viewport should answer and explicitly names benchmark context as a primary Pult signal when verified. V3 already had deep IMOEX analytics, but the home command center only linked to it. This pass promotes a compact, deterministic relative-performance summary to Pult without duplicating methodology.

## Implemented

- Home view model now derives its IMOEX comparison through the canonical `calculateRelativePerformance` engine used by Analytics.
- The Pult shows portfolio period return, IMOEX period return and excess return on the exact overlapping verified sample.
- Sample dates and overlap count are exposed; detailed mode labels sample maturity and points users to Analytics for advanced coefficients.
- Fail-closed behavior is preserved: untrusted/fallback data never produces benchmark numbers, and missing overlap renders an explicit data gate instead of zeroes.
- No new financial formula was introduced and no benchmark values are fabricated or interpolated.
- Added compact responsive styling for Core/Horizon/Carbon and 359px mobile handling.
- Extended the existing Home command-center regression contract to guard the canonical engine, trust gate, IMOEX copy and responsive surface.

## Methodology boundary

This pass deliberately reuses `v2/src/features/analytics/relativePerformance.ts` (`RELATIVE_PERFORMANCE_CALC_VERSION 1.2`). Pult does not calculate its own relative-return methodology. Advanced Tracking Error / Information Ratio / Beta / correlation remain gated and live only in Analytics.
