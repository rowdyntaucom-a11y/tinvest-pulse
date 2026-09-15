# QVANIX Data Trust Layer V1

Date: 2026-09-15
Starting base: `origin/main` at `4af7e92114f0fe812966a4c64258cf3a46ff74ef`
Branch: `feature/data-trust-layer-v1`

## Problem

Source, freshness, completeness and calculation eligibility were represented by several domain-specific booleans. A complete fallback payload could be confused with live data, missing portfolio value was normalized to zero, payout coverage did not universally gate forward presentation, and history/IMOEX pairing had no shared typed trust result.

## Canonical trust model and policy

`DataTrustSnapshot` is the single presentation-safe deterministic boundary. It records status, source id/type, optional fetch/source/live timestamps, age/freshness, coverage, incomplete/stale reason, display/calculation flags, short user reason and method version `qvanix-data-trust-v1`.

States are `LOADING`, `LIVE`, `PARTIAL`, `STALE`, `FALLBACK`, `ERROR`, and `UNAVAILABLE`. Precedence is loading/error/unavailable/fallback/stale/partial/live. Fallback can never be live or calculation-safe. A source timestamp is optional and is never inferred: absent timestamps yield `UNKNOWN` freshness. Portfolio freshness uses five minutes, market history seven days, payout snapshots 24 hours, and fundamentals 30 days. These are presentation trust thresholds, not changes to financial formulas.

Coverage is `COMPLETE`, `PARTIAL`, `INSUFFICIENT`, or `UNKNOWN`. Only `LIVE + COMPLETE` is generally safe to calculate. Partial confirmed historical observations may remain displayable, but gaps are never interpolated. Portfolio versus IMOEX exposes exact paired-point count, missing segments and latest common paired date.

## Metric eligibility

`resolveMetricEligibility` supports reusable requirements for live source, complete coverage, mature history, dated cashflows and paired benchmark points. TWR/risk maturity, XIRR cashflows and relative IMOEX calculations can therefore fail closed without changing their formulas. Payout coverage remains a quality input, never an amount; incomplete coverage closes the forward payout surface while received history remains separate.

## Integrated domains

- Portfolio snapshot: missing total value rejects the live response; only verified live zero positions can be an empty portfolio.
- Portfolio history and IMOEX: separate point counts, exact pairs, last paired date, gaps and freshness.
- Passive income/payouts: availability, stale flag, eligible/resolved asset coverage and errors gate forward presentation.
- Asset history: source, range endpoint, series coverage and point sufficiency.
- Fundamentals: official source, loading/unavailable/error and optional timestamp are mapped explicitly; identity-only fallback stays unavailable.

No source timestamps are invented. No candles, benchmark points, payout amounts or fundamentals are synthesized. Existing TWR, XIRR, IMOEX, risk, tax, bond and broker normalization methodologies remain unchanged except that a missing portfolio total now fails closed instead of becoming a live zero.

## Async safety

Portfolio refreshes use monotonic request sequence ownership, so an older request cannot overwrite a newer response and a late fallback cannot replace newer confirmed live data. Existing component active guards and AbortController cleanup remain in Asset Workspace; payout snapshot retains its canonical store. The last successful live request timestamp is retained separately from source timestamps.

## UI, mobile and accessibility

A compact shared trust indicator uses visible text as well as color and exposes a screen-reader status sentence with source and age. It is shown in the shell, Income, Asset History and Fundamentals without creating a badge wall. At 360px text remains 10px or larger, metadata truncates rather than widening the page, and no nested scrolling is introduced.

## Isolation and gated work

`v2/src/features/world/**`, `v2/src/features/dna/**`, Pixi, Living World assets/runtime and Living World progress checkpoints are untouched. Metric drill-down is not present in this base and was not recreated. Fundamentals without an official usable response remain unavailable. No new financial feature or polling was introduced.

## Review passes

- QUANT: missing is not zero/live; fallback and stale cannot satisfy live-only eligibility; missing IMOEX/payout points are never neutral values; formulas unchanged.
- CODE: one pure typed evaluator plus thin domain adapters; sequence ownership prevents stale refresh writes; UI receives no broker error object.
- MOBILE: compact wrapping-safe status, textual semantics, readable 360px sizes, no new scroll owner.
- RELEASE: clean origin/main branch; no Living World/DNA files or binary artifacts; budgets and security gates unchanged.

## Validation results

Complete local gate passed: clean `npm ci`, high-severity audit (0 vulnerabilities), full core suite, API regressions, TypeScript/Vite build, syntax and diff checks. Build produced with main JS 440.32 kB raw / 133.97 kB gzip, CSS 144.79/25.22 kB, Asset 15.51/5.49 kB and deferred Pixi 505.94/145.07 kB. Real Samsung Internet validation remains required for truncation, TalkBack status wording and stale/error copy.
