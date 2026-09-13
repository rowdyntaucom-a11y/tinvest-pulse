# QVANIX checkpoint · user-authored screener v1.0 on alert boundary v1.4

Date: 2026-09-13
Branch: `qvanix-user-screener-v1-4`

## Scope

- Added deterministic ALL / ANY evaluation for conditions explicitly authored by the user.
- Reuses `evaluateUserAlertRule(...)` v1.4 for metric-domain validation, clean-source provenance and crossing chronology/version gates.
- Rejects empty IDs, invalid modes, empty rule sets, duplicate rule IDs and sets above 8 rules.
- Any invalid child rule invalidates the entire screener rather than partially evaluating a malformed configuration.
- Missing-data propagation is logical: ALL can resolve false from one known false rule; ANY can resolve true from one known true rule; otherwise missing data remains visible.

## Product / methodology boundary

This is a screener calculation primitive only. It does not rank instruments, generate candidate assets, infer a strategy, attach expected returns, produce personalized buy/sell recommendations, or submit orders.

## Council review

- Quantitative methodology: no new financial formula, expected-return assumption, normalization or LLM-derived number. Child conditions inherit the reviewed technical-indicator and alert-rule data-quality gates.
- Code quality: isolated pure boundary with bounded input size and explicit fail-closed states; regression covers ALL/ANY, missing-data short-circuiting, duplicate IDs, oversized config, invalid thresholds, stale calculation versions and crossing chronology.
- Mobile UX: no UI, CSS or navigation change; Samsung/Android density is unchanged.
- Release: frontend deterministic calculation + test registration + checkpoint only; no backend route, broker API, credentials, DNA art, legal/payment text or execution path.

## Validation

Pre-merge validation is delegated to the repository `v2 build` workflow, which must run the full `test:core` suite and TypeScript/Vite build before merge.

## Production gate

Before merge, both `tinvest-pulse-v2-preview` and `tinvest-pulse` deploy queues must be rechecked and settled. Render auto-deploy remains the only production trigger.
