# QVANIX autonomous checkpoint — 2026-09-13

## Historical stress shock-input integrity

Timestamp: `2026-09-13 09:10 MSK`.

Starting main for the accepted runtime change: `34d6e85c2b725b32d6111cd4060c9c8282994a39`.

Completed through PR #192 (`Analytics: fail closed malformed stress shocks`) and squash-merged as `0006339b16d4231413648ead893ffaac68fb716d`.

### Why
The stress calculation boundary converted incoming shock values with `Number(value)`. At runtime that meant values such as `null`, an empty string, or `false` could silently become `0` and be treated as a valid 0% shock. Such coercion could incorrectly mark an exposure as covered even though no explicit numeric shock-return existed.

### Accepted change
- `STRESS_CALC_VERSION` bumped from `1.1` to `1.2`.
- A stress shock is now accepted only when the runtime value is an actual finite JavaScript `number` and is not below `-1`.
- Runtime-coercible non-numeric values (`null`, empty string, booleans) fail closed instead of becoming an invented 0% shock.
- Existing historical scenario values and stress formulas were not changed.
- Missing/invalid classes remain uncovered; no shock is fabricated to improve coverage.
- Regression coverage explicitly locks malformed runtime-shock behavior.

### Validation
Scoped GitHub `v2 build` PR run #303 succeeded end-to-end. The run completed dependency install, both dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history regression, and the existing runtime syntax checks before merge.

### Council / scope
- Quant: historical sourced shock values and P/L formulas are unchanged; only admissible input types were narrowed so coverage cannot be created through JavaScript coercion.
- Code: pure TypeScript calculation boundary plus regression test; PR changed two files only.
- Mobile: no React/CSS/layout/navigation change; Samsung/Android density is unaffected.
- Release: no backend/broker route, credentials, DNA runtime, legal/payment wording, recommendation logic, or trade execution change.

### Production / blockers
- Render was not manually deployed; main remains the auto-deploy source.
- Read-only Render verification is currently blocked because no workspace is user-confirmed in the connector. The workspace was not selected autonomously.
- `LEGAL_REVIEW_2026-09-11.md` remains a publication blocker; no RU/EN offer, privacy, consent, marketing-consent, payment, or production legal wording was published or changed.
- The large canonical `WEEKEND_PROGRESS.md` still requires full-file replacement through the available GitHub write primitive, so this checkpoint preserves the result without risking accidental edits to historical entries. Canonical catch-up remains a documentation task.

### Next safe focus
Continue the approved depth audit on another independent deterministic boundary rather than duplicating recently hardened asset-history, rebalancing, stress, rolling, VaR/CVaR, correlation, recovery, Monte Carlo, or allocation logic. Prefer a gap that can be validated without new subjective UI/art decisions.
