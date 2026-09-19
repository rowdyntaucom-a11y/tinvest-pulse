# QVANIX v3 — Asset Intelligence Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `f75af29d14b80d1cb16a1402c87de188cc961e16`
- Branch: `v3/asset-intelligence-pass-v1`
- Continuation after the canonical v3 Asset Workspace + verified history went live on Render.

## Product problem
The new v3 Asset Workspace had the right navigation boundary and verified price history, but still stopped short of the richer instrument intelligence already available in reviewed v2 boundaries. Users could inspect a position and its price path, but not official fundamentals or instrument-level payout context without leaving the workspace.

## Implemented
1. Expanded the canonical Asset Workspace from 3 to 5 focused tabs:
   - Overview
   - Fundamentals
   - History
   - Income
   - Position
2. Fundamentals reuses the existing strict T-Invest GetAssetFundamentals bridge.
3. Fundamentals remain fail-closed:
   - instrument UID is required;
   - returned UID/source validation remains inside the canonical normalizer;
   - official zero values are treated as unavailable per the existing boundary;
   - only non-null verified metrics are rendered;
   - no QVANIX score is produced until a reviewed methodology exists.
4. Added grouped fundamentals for valuation, profitability, financials and cash-flow/dividend metrics.
5. Asset Income reuses the canonical payout normalizer and the canonical Income source-row identity logic.
6. Income is shown only when payout events map through exact FIGI identity to exactly one current position.
7. Fact and future schedule stay separate. YoC is displayed only when exact FIGI identity and verified cost basis support it.
8. Explicit stale payout warning is surfaced when the source snapshot marks itself stale.
9. Secondary intelligence remains inside the lazy-loaded Asset Workspace chunk; the app shell is not expanded with a parallel data path.
10. Five-tab mobile rail is intentionally horizontally scrollable only at the control level on very narrow phones; page-level horizontal overflow remains disallowed.

## Methodology / trust guarantees
- No broker/server/API changes.
- No new financial formulas.
- No hidden/demo fundamentals.
- No fundamentals score or recommendation.
- No payout alias matching by ticker/name for cost basis.
- No merging of realized fact with future schedule.
- No missing value silently becomes zero in displayed asset intelligence.
- No personalized buy/sell commands.

## Regression coverage
- Added v3 Asset Intelligence contracts for official fundamentals, exact-FIGI income matching, payout separation, YoC identity rule, five-tab mobile navigation and absence of trading-language shortcuts.
- Existing v2 boundaries continue to own normalization/business logic.

## Validation
- GitHub v3 build: success.
- Dependency security gate: success, 0 vulnerabilities.
- Full v3 test suite: success, including Asset Intelligence regression.
- Bundle split preserved: initial JS 270.30 kB / 83.23 kB gzip; deferred Asset Workspace 26.49 kB / 8.46 kB gzip; CSS 62.50 kB / 11.32 kB gzip.
- Automated Codex review did not run because the connected code-review quota is exhausted; no review finding was produced.
- Remaining real-device validation — Samsung Internet + Chrome Android:
  1. five asset tabs are readable at 360–430 px;
  2. tab rail scrolls only when necessary and never causes page overflow;
  3. long fundamentals values do not break cards;
  4. unsupported bonds/funds show honest fundamentals-unavailable state;
  5. payout loading, unavailable and stale states remain understandable;
  6. Core/Horizon/Carbon preserve contrast;
  7. Back and top shell remain stable through all five tabs.

## Recommended next pass
After live-device validation, deepen the same Asset Workspace with verified identity/brand presentation and instrument-specific risk/context only where a real source boundary exists. Do not create synthetic daily movers, YTM/duration or black-box scores.
