# QVANIX checkpoint · user-authored screener v1.0 on alert boundary v1.4

Date: 2026-09-13
Branch: `qvanix-user-screener-v1-4`

## Scope

- Added deterministic ALL / ANY evaluation for conditions explicitly authored by the user.
- Screener is integrated into the existing `userAlertRules.ts` calculation boundary, so it reuses `evaluateUserAlertRule(...)` v1.4 for metric-domain validation, clean-source provenance and crossing chronology/version gates without a second runtime resolver boundary.
- Rejects empty IDs, invalid modes, empty rule sets, duplicate rule IDs, invalid child rules and sets above 8 rules.
- Missing-data propagation is logical: ALL can resolve false from one known false rule; ANY can resolve true from one known true rule; otherwise missing data remains visible.

## Product / methodology boundary

This is a screener calculation primitive only. It does not rank instruments, generate candidate assets, infer a strategy, attach expected returns, produce personalized buy/sell recommendations, or submit orders.

## Council review

- Quantitative methodology: no new financial formula, expected-return assumption, normalization or LLM-derived number. Child conditions inherit the reviewed technical-indicator and alert-rule data-quality gates.
- Code quality: bounded pure evaluation with explicit fail-closed states; regression covers ALL/ANY, short-history missing-data semantics, duplicate IDs, oversized config, invalid thresholds, stale calculation versions and crossing chronology.
- Mobile UX: no UI, CSS or navigation change; Samsung/Android density is unchanged.
- Release: frontend deterministic calculation + regression + docs only; no backend route, broker API, credentials, DNA art, legal/payment text or execution path.

## Validation / CI findings

- First pre-merge CI caught an extensionless runtime import that Node `--experimental-strip-types` could not resolve even though TypeScript/Vite built successfully.
- A direct `.ts` source import fixed Node resolution but was correctly rejected by the production TypeScript build because `allowImportingTsExtensions` is not enabled.
- Final architecture removes that unnecessary source-to-source runtime import by colocating screener evaluation with the already-versioned alert-rule boundary.
- Regression fixtures were also corrected after CI exposed two invalid assumptions: a linear synthetic series does not guarantee positive MACD histogram, and `stochasticD3` is no longer missing on a full 40-observation sample. The final fixtures use a deterministic SMA condition and an explicit 15-observation partial-history sample instead of changing production formulas.
- Merge remains blocked until a fresh `v2 build` completes successfully on the final head.

## Production gate

Before merge, both `tinvest-pulse-v2-preview` and `tinvest-pulse` deploy queues must be rechecked and settled. Render auto-deploy remains the only production trigger.
