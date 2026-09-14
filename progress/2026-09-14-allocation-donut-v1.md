# QVANIX · allocation donut visual v1

Date: 2026-09-14
Starting main: `f540b175a04b9467c2c1e2b6f8baabb05c0a1ee5`
Branch: `qvanix-allocation-donut-v1`

## Why this pass

Continue the approved Snowball-inspired visualization direction while preserving QVANIX deterministic methodology. The Structure screen already had correct asset-class values and weights, but they were presented primarily as text/bars. This pass adds a compact interactive ring without introducing another data source or duplicating a second structure calculation.

## Implemented

- Added fixed semantic visual tokens for equities, bonds, funds, currency, futures and other assets.
- Added an interactive allocation donut driven by the existing `allocation` calculation.
- Tap/click/keyboard selection reveals class name, weight and RUB value in the center.
- The existing detailed class list remains the methodology/detail layer and now reuses the same semantic class tones.
- The existing class-weight denominator remains unchanged: weights are normalized inside the sum of current position values (`positionItems`).
- Existing broker P/L attribution, top-3 exposure diagnostics, allocation coverage and Bond mode remain unchanged.
- On constrained phones, the visual/detail area may use local vertical scrolling instead of shrinking text solely to preserve a one-screen rule. Horizontal page scrolling remains disallowed.

## Methodology / honesty rules

- No new portfolio metric or financial formula was introduced.
- Donut segment size is exactly the already-computed class weight.
- No forecast, recommendation, inferred sector/class or LLM-derived number is introduced.
- Missing/empty structure remains empty rather than fabricated.
- Semantic colors carry category meaning; themes may change surrounding styling but should not invert class identity.

## Council review

- Quant: display-only reuse of current asset-class aggregation; denominator and coverage semantics are unchanged.
- Code: dependency-free SVG/React component; no backend/API/storage/dependency change.
- Responsive/mobile: compact ring, keyboard/touch selection, local vertical overflow permitted when needed under the approved progressive-depth UX rule; no horizontal page scroll.
- Release: Portfolio presentation files plus this checkpoint only; no broker route, credentials, legal/payment, DNA state or trading behavior.

## Autonomous reporting rule

The user asked future whole-project status reports to include numbered completed and remaining areas plus overall `% completed` and `% remaining`. Percentages must be based on the current approved roadmap/audit, not commit count or elapsed time. GATED/legal/later work must be separated so the percentage does not imply those items are immediately implementable.

## Next safe passes

1. Validate whether the current data boundary exposes genuine daily position change before adding daily movers; cumulative broker P/L must never be relabelled as daily movement.
2. Add deterministic narrative text to existing Portfolio-vs-IMOEX facts once wording/units are locked.
3. Continue richer switchable chart/drill-down work only from truthful historical series.
4. Keep separate DNA art work on the reviewed Figma/asset path.
