# QVANIX Data Trust Layer v1 — final clean recovery

Date: 2026-09-15
Fresh base: `6969ecbfac9f52ec332e9628fd39397a831acbe4`

## Why PR #353 was blocked

PR #353 (`6fa2a59e…`) was based on `4af7e921…`, while `main` had already moved forward. Its comparison therefore repeated landed Living World arrival files and omitted newer world work. It remains unmerged. This recovery was created as a new branch directly from fetched `origin/main`; no old branch rebase, merge, whole-commit cherry-pick, or Living World delta was used.

Initial work began from then-current `cd465f0…`. Before commit, the required fetch found that Living World had advanced main to `6969ecb…`; a second new branch was therefore created directly from that SHA and only the uncommitted Data Trust patch was reapplied. `git merge-base HEAD origin/main` exactly matched the fresh SHA above. Only Data Trust file deltas were applied selectively and then audited against current main.

## Canonical trust policy

The deterministic `qvanix-data-trust-v1` boundary exposes `LOADING`, `LIVE`, `PARTIAL`, `STALE`, `FALLBACK`, `ERROR`, and `UNAVAILABLE`, plus explicit source, freshness, coverage, display, and calculation eligibility. `LIVE` is the only current fully verified state; stale or partial provenance cannot pass LIVE-only gates. Explicit stale is authoritative without fabricating a source timestamp, while an absent timestamp without that signal remains `UNKNOWN` freshness.

A confirmed empty portfolio is allowed only for `LIVE` + `COMPLETE` + zero positions. Missing/invalid total portfolio values fail closed at API normalization and cannot become a verified zero. A contract-confirmed numeric zero remains valid.

## History observation fix

A syntactically valid date is now distinct from an actual observation. Portfolio and IMOEX values must each be finite numbers; `null`, `NaN`, and infinities do not count. An aggregate observation contains at least one real value and a paired point contains both. Date-only rows do not affect the source state, freshness timestamp, coverage denominator, or latest observation. Latest dates are derived independently of input order. Portfolio-only history remains separately representable, benchmark-only rows do not create portfolio history, and comparison eligibility requires verified paired coverage without interpolation.

## Presentation and feature gates

`DataTrustIndicator` provides visible textual status plus source/freshness context, with 12 px minimum text and narrow-screen wrapping. It does not use `aria-live`, avoiding periodic refresh noise.

Presentation now consumes trust eligibility rather than merely calculating it: TWR requires trusted complete portfolio history; Portfolio vs IMOEX requires complete paired observations; XIRR remains unavailable because the current public contract does not expose verifiable dated cashflows; Health requires trusted complete history and the existing financial-core maturity contract of 365 elapsed history days. No formulas or maturity methodology were changed.

Payout loading/stale/partial states are explicit. Incomplete future schedules fail closed while separately confirmed historical facts remain available. Asset-history freshness uses the latest real normalized candle, partial requested ranges remain partial, and canonical `instrumentUid` identity is preserved. Fundamentals are LIVE only for the official T-Invest boundary; API failure is ERROR and identity fallback is not fundamentals.

Both async portfolio success and error paths use the same monotonic request-ownership predicate, so neither late success nor late failure from an older request can overwrite the newer owner.

## Isolation and four review passes

- QUANT: formulas unchanged; missing is not zero; stale is not live; partial is not complete; no history/benchmark interpolation or fabrication; existing Health maturity retained.
- CODE: fresh ancestry; deterministic trust evaluator; unambiguous LIVE boolean; shared request ownership; normalized UI models only.
- MOBILE: status is textual, source/freshness may wrap, and trust text remains at least 12 px at 360/390/430 px.
- RELEASE: zero `v2/src/features/world/**` or `v2/src/features/dna/**` changes; no Living World tests/checkpoints, binaries, budget increases, security relaxations, or disabled tests.

## Verification results

- `npm ci --no-audit --no-fund` (`v2`): passed.
- `npm audit --audit-level=high` (`v2`): 0 vulnerabilities.
- `npm install --ignore-scripts --no-audit --no-fund` + `npm audit --omit=dev --audit-level=high` (root): 0 vulnerabilities.
- `npm run build` (`v2`): TypeScript and production build passed. Main JS 443.87 KiB / 450 KiB; deferred Pixi/DNA 505.94 KiB / 520 KiB; CSS 145.67 KiB (budgets unchanged).
- `npm run test:core` (`v2`): passed, including Data Trust and all existing core regressions.
- `node --experimental-strip-types tests/worldRuntimeState.test.ts`: passed without modifying Living World.
- asset-history regression, production syntax checks, and `npm run test:api`: passed.
- A Galaxy S9+ headless-browser capture verified the narrow fallback/trust state, readable textual status, wrapping, and absence of visible horizontal overflow; the screenshot stayed in `/tmp` and is not a repository artifact.
