# QVANIX — Data Trust final true clean recovery v1

Date: 2026-09-15
Status: implementation and local release gates complete; PR must remain unmerged pending CI/review.

## Why PR #364 was blocked

PR #364 was not based on the factual latest `main`: its compare was ahead 1 / behind 2, with merge-base `cd465f025…` while `main` was already `c2170b392…`. Its delta consequently repeated already-landed Living World files. This recovery does not reuse that branch history or cherry-pick its aggregate commit.

## Clean base and selective recovery

The repository was fetched, `main` was fast-forwarded, and the new `qvanix/data-trust-final-true-clean-recovery-v1` branch was created directly from then-current `origin/main` SHA `c2170b39255f5d8614a96c7e263da4c151b6e17a`. The mandatory pre-publication fetch then found a newer Living World main commit, so the uncommitted selective delta was reapplied over factual final base SHA `65721fdfd0055de7492f7688ddcd9dbd7c98756b`; final merge-base is that SHA and behind count is zero.

Only Data Trust changes were transferred selectively: the pure trust policy, shared indicator, App/Board/Income/Asset trust wiring, fail-closed portfolio-value normalization, and focused regression coverage. No Living World/DNA commit or file was transferred.

## Canonical trust semantics

- Canonical states are `LOADING | LIVE | PARTIAL | STALE | FALLBACK | ERROR | UNAVAILABLE`.
- `verifiedLive` is true only when the final status is exactly `LIVE`.
- Explicit staleness remains `STALE` without inventing a timestamp; unknown time remains `UNKNOWN`.
- Fallback/error/unavailable provenance cannot be promoted to confirmed live state.
- Confirmed empty portfolio requires `LIVE` plus `COMPLETE`; missing or invalid total portfolio value fails closed rather than becoming a live zero.
- Latest-request ownership prevents an older asynchronous success or error from overwriting a newer request.

## History and metric eligibility

`evaluateHistoryTrust()` counts a row only when portfolio or IMOEX contains a finite numeric observation. Date-only rows and `NaN`/positive or negative infinity cannot update freshness. Latest observations are selected independently of input order. Portfolio-only and benchmark-only counts remain separate; a paired point requires both finite values, zero remains valid, and no benchmark pairs are interpolated or fabricated.

TWR and Health require confirmed portfolio history/coverage; IMOEX comparison requires confirmed paired coverage. XIRR fails closed because the current UI contract does not expose auditable dated cashflows. Payout schedules, official fundamentals and asset history are gated by their own source, coverage and freshness evidence. Existing return/profit formulas remain unchanged, and broker `expectedYield` remains cumulative unrealized P/L rather than a daily move.

## UI, accessibility and isolation

The shared Data Trust indicator always renders a textual status plus readable source/freshness context at a minimum 12px. It wraps on narrow layouts instead of causing horizontal overflow and retains an accessible combined label. It is integrated as a compact trust/explanation layer rather than a new dashboard-card family.

The compare contains zero changes under `v2/src/features/world/**` or `v2/src/features/dna/**`, zero Living World progress/test changes, and no renderer, sprite-binding, Pixi, scene, asset, navigation, bundle-ownership, Metric Drill-down, Pulse identity, or Asset Workspace identity-contract changes.

## Local validation

- `cd v2 && npm ci`: passed; 132 packages audited, 0 vulnerabilities.
- `cd v2 && npm audit --audit-level=high`: passed; 0 vulnerabilities.
- `cd v2 && npm run build`: passed with existing budgets. Main JS 443.91 kB / 135.08 kB gzip; Pixi DNA lazy chunk 505.94 kB / 145.07 kB gzip; main CSS 147.19 kB / 25.72 kB gzip.
- `cd v2 && npm run test:core`: passed, including the registered Data Trust regression suite and existing world regressions without modifying them.
- `npm run test:api`: passed.
- Production-workflow runtime/security checks passed: root production dependency audit, world runtime-state composition, asset-history core test, and syntax checks for payout/server/production v158–v162 boundaries.
- No binary files are introduced.
