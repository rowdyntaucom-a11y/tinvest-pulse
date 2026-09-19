# QVANIX v3 — Metric Explainability Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `93d085240c026d0cef882e854c422bb9150b46b2`
- Branch: `v3/metric-explainability-v1`
- Continues the unified roadmap after the interactive Asset History pass.
- External audit findings remain backlog/input unless they align with the active product sequence.

## Product problem
QVANIX is now analytically deeper, but some metrics still require prior finance knowledge. The roadmap explicitly requires contextual help at the first meaningful occurrence of complex terms rather than a wall of permanent explanatory text or scattered question-mark icons.

The goal of this pass is not to add new calculations. It is to make existing verified metrics understandable without weakening their methodology.

## Implemented
1. Added a reusable v3 metric explainer component:
   - compact `i` affordance;
   - accessible label and `aria-expanded`;
   - closes on outside pointer interaction;
   - closes on Escape;
   - desktop anchored popover;
   - mobile fixed sheet above bottom navigation.
2. Added a canonical v3 metric-help registry.
3. Reused the existing canonical v2 XIRR glossary definition instead of creating a competing explanation.
4. Added contextual explanations at first meaningful use across the main product:
   - Home: passive income, CAGR, XIRR;
   - Analysis: HHI concentration, max drawdown, Top-3 concentration, risk-free rate, IMOEX comparison;
   - Income: realized passive income and annualized average-income equivalent;
   - Goal: progress-to-target.
5. Explanations include methodology boundaries where users could otherwise over-interpret a number:
   - CAGR does not replace money-weighted return;
   - max drawdown is retrospective and history-dependent;
   - HHI is concentration, not a universal risk score;
   - Top-3 ignores correlation and volatility;
   - IMOEX comparison uses common confirmed points only;
   - annualized income is a scaling of observed average, not a forecast;
   - goal progress contains no assumed return or completion date.
6. Scoped Home percentage decoration to the primary metric label only so nested help content never receives the visual % suffix.
7. Changed Home metric-card overflow to allow desktop popovers without clipping.
8. Added shell-aware Core/Horizon/Carbon help surfaces and mobile hit targets.

## UX constraints
- No permanent dense explanatory paragraphs added to the first viewport.
- No forest of `?` icons.
- Help appears only on metrics with genuine interpretation risk.
- Existing information architecture remains unchanged.
- Mobile panel stays above the persistent bottom navigation.
- Explanations do not convert diagnostics into recommendations.

## Methodology / trust guarantees
- No financial formula changed.
- No new metric values introduced.
- No source data changed.
- No LLM-generated calculation output.
- No missing values converted to zero.
- No performance metric renamed into a stronger claim.
- No trading recommendation language introduced.

## Regression coverage
- New `metricExplainability.test.ts` verifies:
  - canonical XIRR glossary reuse;
  - the approved explanation registry;
  - accessibility/open-close behavior;
  - cross-workspace integration;
  - mobile fixed panel;
  - scoped Home rate suffix.
- Existing Home metric semantics regression updated for the direct-child label selector.

## Validation
- GitHub v3 build: success.
- Dependency security gate: success, 0 vulnerabilities.
- Full v3 test suite: success, including metric explainability regression.
- Bundle: initial JS 276.21 kB / 84.82 kB gzip; deferred Asset Workspace unchanged at 38.08 kB / 11.40 kB gzip; CSS 70.96 kB / 12.61 kB gzip.
- Shared explainability adds ~5.9 kB raw / ~1.6 kB gzip to the primary bundle; accepted because the component is used across Home, Analysis, Income and Goal and does not duplicate financial calculation code.
- Automated Codex review did not run because the connected code-review quota is exhausted; no review finding was produced.
- Remaining real-device validation — Samsung Internet / Chrome Android:
  1. 30px inline help control is tappable without accidental neighboring taps;
  2. sheet remains above bottom nav and safe area;
  3. long explanations do not overflow at 360–430 px;
  4. outside tap and Escape close correctly;
  5. Core/Horizon/Carbon retain readable contrast;
  6. opening help never changes the underlying financial value or hides it.

## Next strategic step
After live validation, choose the next pass from current product evidence:
- Assets overview density if real-device friction remains obvious;
- broader semantic-color consolidation if inconsistent financial meaning is still visible;
- or the next Product Depth item with a verified data boundary.

Do not reorder the roadmap merely because an external audit listed a different sequence.
