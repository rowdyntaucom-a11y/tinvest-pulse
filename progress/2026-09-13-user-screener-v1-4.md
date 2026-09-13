# QVANIX checkpoint · user-authored screener v1.0 on alert boundary v1.4

Date: 2026-09-13
Branch: `qvanix-user-screener-v1-4-mainrefresh`
Base main: `8acb0c2b047a739e29adb42470abe75af6fbfec0`

## Scope

- Added deterministic ALL / ANY evaluation for conditions explicitly authored by the user.
- Screener is integrated into the existing `userAlertRules.ts` calculation boundary, so it reuses `evaluateUserAlertRule(...)` v1.4 for metric-domain validation, clean-source provenance and crossing chronology/version gates without a second runtime resolver boundary.
- Rejects empty IDs, invalid modes, empty rule sets, duplicate rule IDs, invalid child rules and sets above 8 rules.
- Missing-data propagation is logical: ALL can resolve false from one known false rule; ANY can resolve true from one known true rule; otherwise missing data remains visible.
- Refreshed from the current main after Living World memory presentation landed, preserving its `worldMemoryPresentation.test.ts` registration.

## Product / methodology boundary

This is a screener calculation primitive only. It does not rank instruments, generate candidate assets, infer a strategy, attach expected returns, produce personalized buy/sell recommendations, or submit orders.

## Council review

- Quantitative methodology: no new financial formula, expected-return assumption, normalization or LLM-derived number. Child conditions inherit the reviewed technical-indicator and alert-rule data-quality gates.
- Code quality: bounded pure evaluation with explicit fail-closed states; regression covers ALL/ANY, short-history missing-data semantics, duplicate IDs, oversized config, invalid thresholds, stale calculation versions and crossing chronology.
- Mobile UX: no UI, CSS or navigation change; Samsung/Android density is unchanged.
- Release: frontend deterministic calculation + regression + docs only; no backend route, broker API, credentials, DNA art, legal/payment text or execution path.

## Validation / CI findings

During the superseded first branch, CI correctly exposed and prevented merge of three test/integration assumptions:
1. Node strip-types could not resolve a new extensionless runtime source import.
2. Adding `.ts` fixed Node but violated the current production TypeScript configuration.
3. Two synthetic-data assumptions were invalid: a linear series does not guarantee positive MACD histogram, and Stochastic D3 is not missing on a full 40-observation sample.

The refreshed implementation removes the unnecessary source-to-source runtime boundary, uses deterministic SMA for the positive match, and uses an explicit 15-observation sample for short-history propagation. Production formulas were not altered to satisfy tests.

Merge remains blocked until the repository `v2 build` succeeds on this refreshed branch and both Render services are rechecked settled immediately before merge.

## Production gate

At refresh time both `tinvest-pulse-v2-preview` and `tinvest-pulse` were `live` on main `8acb0c2…`. Render auto-deploy remains the only production trigger.
