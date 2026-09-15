# Metric Drill-down + Explainability V1

Date: 2026-09-15. Base: `origin/main` at `ac77cb1024b948890ca90d06c60723cf5ab3c57c`.

## UX gap and architecture
Important analytics ended at a card or number. V1 adds one registry of deterministic presentation models and one lazy mobile-first `MetricDrilldown` sheet. The generic UI receives no broker objects and performs no financial calculations. Existing ContextHelp glossary strings remain the canonical short definitions; the sheet adds value, period, coverage, provenance, freshness, methodology, limitations and optional deeper action.

## Connected metrics
TWR, XIRR and transparent Health v1.0 are reachable from Analytics summary; normalized Portfolio vs IMOEX is reachable beside the existing history comparison; payout coverage is reachable from Income sources. Health exposes existing component points, weights and reasons. Existing history period controls, shading, narrative and transaction markers were not duplicated.

## Data honesty
TWR/XIRR/Health formulas and cash-flow methodology are unchanged. Missing TWR/XIRR/Health remains unavailable, not 0. IMOEX details require at least two verified paired points and never interpolate. The normalized spread is explicitly not alpha, a forecast or advice. Payout coverage distinguishes complete/incomplete/unavailable; missing payouts never become 0 ₽ or “no payouts”. `expectedYield` is named only to prohibit its use as TWR/daily movement. No daily metric or new formula was added.

## Mobile and accessibility
The sheet is bottom-aligned on phone and centered on wider screens, has one contained vertical scroll owner, safe-area padding, readable type and 44px controls. Opening locks body scroll; close, backdrop and Escape close it; focus moves to close and returns to the invoking control. Dialog labelling, `aria-modal`, visible focus and reduced-motion compatibility are present.

## Isolation and remaining gates
Living World, DNA, Pixi runtime/assets and manual chunks are untouched. Deeper-workspace actions remain optional until canonical cross-workspace routing is needed. Real Samsung checks should verify 360px portrait, 390/430px, landscape, keyboard focus, close reachability and no page overflow.

## Review and gates
QUANT: existing outputs only. CODE: shared typed registry/model/UI; registry and sheet are deferred. MOBILE: bottom sheet and focus/scroll contract. RELEASE: no budgets changed, no binary assets, no Living World delta. Final test/build/security/API/bundle results are recorded in the PR and final report.
