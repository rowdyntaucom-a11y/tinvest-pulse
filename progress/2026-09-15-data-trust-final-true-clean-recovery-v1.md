# QVANIX — Data Trust final current-main recovery v1

Date: 2026-09-15
Status: selective recovery complete on factual current `main`; local release gates passed; replacement PR must remain unmerged pending project-lead review.

## Factual base and recovery boundary

This recovery does not trust the ancestry claim in PR #366's progress note. Immediately before creating the branch, `git fetch origin` and `git rev-parse origin/main` confirmed factual `main` at `532e1a804bae139d081a690907ff4605515cdb91` (Living World #367). The new branch `qvanix/data-trust-final-current-main-recovery-v1` was created directly from that commit.

PR #366 was not continued or rebased, and aggregate commit `89114b17` was not cherry-picked. Only the approved Data Trust file delta was selectively restored. `v2/package.json` was edited manually to register `tests/dataTrust.test.ts` while preserving every current-main test, including `tests/worldReviewedTerrainGround.test.ts`.

The compare contains no changes under `v2/src/features/world/**` or `v2/src/features/dna/**`, no Living World progress/tests, no Pixi/runtime/assets, and no `v2/src/main.tsx` change.

## Canonical trust semantics

- Canonical states are `LOADING | LIVE | PARTIAL | STALE | FALLBACK | ERROR | UNAVAILABLE`.
- `verifiedLive` is true only for the final exact `LIVE` state.
- Explicit staleness remains `STALE` even without a timestamp; unknown timestamps remain `UNKNOWN` rather than being invented.
- Fallback, error and unavailable provenance cannot be promoted to confirmed live state.
- A confirmed empty portfolio requires `LIVE` plus `COMPLETE`; missing or invalid portfolio value fails closed instead of becoming zero.
- Latest-request ownership protects both asynchronous success and error paths from stale races.

## Observation and metric eligibility

- A date-only history row is not an observation.
- `NaN` and positive/negative infinity are not observations; numeric zero is valid.
- Latest observations are selected independently of input ordering.
- Portfolio, benchmark and paired counts remain distinct; an IMOEX pair requires two finite numeric values.
- TWR and Health require confirmed portfolio history and coverage.
- IMOEX comparison requires confirmed paired coverage.
- XIRR fails closed because the current UI contract does not expose auditable dated cashflows.
- Payouts, official fundamentals and asset history use their own provenance, coverage and freshness evidence.

No financial formula or Health methodology was changed. Broker `expectedYield` remains cumulative unrealized P/L context, never a daily move.

## UI and accessibility

The shared Data Trust indicator presents explicit textual status, source, freshness and coverage context with an accessible combined label. Its narrow-layout presentation wraps rather than forcing page-level horizontal overflow. Board, Income and Asset surfaces consume the same canonical policy instead of inventing local trust states.

## Local release validation

- `cd v2 && npm ci`: passed; 132 packages audited, 0 vulnerabilities.
- `cd v2 && npm audit --audit-level=high`: passed; 0 vulnerabilities.
- `cd v2 && npm run build`: passed without budget changes. Main JS: 443.91 kB / 135.09 kB gzip; Pixi DNA lazy chunk: 505.94 kB / 145.07 kB gzip; main CSS: 147.19 kB / 25.72 kB gzip.
- `cd v2 && npm run test:core`: passed, including Data Trust and the current Living World terrain-ground regression without modifying world tests.
- `npm run test:api`: passed.
- PR-workflow-equivalent production/runtime/security gates passed: root production dependency audit; Living World runtime-state composition regression; asset-history syntax/regression; payout/server/production v158–v162 syntax checks; `git diff --check`.

## Release posture

The replacement PR is intentionally not to be merged by Codex. After PR-triggered CI passes and ancestry/scope are reverified against fetched `origin/main`, stop for project-lead review.

## Final project-lead fixes

- Board TWR now uses one eligibility decision for both the numeric value and its history sparkline: when the history contract is not eligible, neither surface visualizes it.
- Board future payout content now uses the canonical `evaluatePayoutTrust` policy. The next amount, date and event remain closed for stale, partial, loading or unavailable snapshots, and the Board no longer describes those calendars as confirmed. Historical realized income remains independently governed by its own observation contract.
- A shared application `trustNow` advances once per minute, is cleaned up on unmount, and reevaluates portfolio, history, payout, asset-history and fundamentals trust without changing financial data or adding a Pixi/runtime timer.
- Focused regressions cover the TWR value/sparkline gate, complete-versus-stale/partial/loading/unavailable payout eligibility, the independent historical-income path, and transition of an unchanged history payload from fresh to stale as time advances.

Final local gates passed: `npm ci`, `npm audit --audit-level=high`, v2 production build, `npm run test:core`, and root `npm run test:api`. No bundle guard was changed. The final build produced main JS **444.64 kB / 135.22 kB gzip**, Pixi DNA **505.94 kB / 145.07 kB gzip**, and main CSS **147.19 kB / 25.72 kB gzip**.
