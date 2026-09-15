# QVANIX Data Trust Layer V1 — clean recovery

Date: 2026-09-15
Fresh base: `origin/main` at `455de050b4fd0fdaae791c48585d5ee18300a5f1`

## Why PR #350 was blocked

PR #350 claimed a fresh-main base but its head `626b3346…` had parent `379662e7…`, so its delta reintroduced Living World work already present on main. Review also found five correctness/release blockers: stale zero-position snapshots could look like confirmed LIVE empty portfolios; an explicit payout stale flag was lost without a timestamp; metric eligibility existed without gating TWR/XIRR/Health/IMOEX presentation; the indicator used 10 px mobile text; and async error ownership was not monotonic. Automated review additionally identified payout loading/schedule-specific coverage, complete propagation of payout eligibility, and asset-history observation timestamp issues.

## Clean recovery strategy

A new `qvanix/data-trust-clean-recovery-v1` branch was created directly from fetched `origin/main`. The #350 diff was used only as a source for Data Trust changes; no commit was cherry-picked and no Living World/DNA file or old checkpoint was transferred. The final comparison is audited against current `origin/main`.

## Canonical semantics

- States are `LOADING`, `LIVE`, `PARTIAL`, `STALE`, `FALLBACK`, `ERROR`, and `UNAVAILABLE`.
- Missing remains distinct from zero; fallback, stale, partial, error, and unavailable never become LIVE.
- Unknown source time produces freshness `UNKNOWN`; no timestamp is fabricated.
- A canonical `explicitStale` input is authoritative with or without a timestamp and retains a deterministic reason.
- True empty portfolio presentation requires canonical `LIVE`, verified broker data, complete coverage, and exactly zero confirmed positions. A stale/fallback/error zero snapshot is explicitly described as unconfirmed instead of empty.
- Missing current portfolio total fails closed in both dashboard and legacy normalization.

## Coverage and eligibility

History coverage records portfolio, benchmark, and paired counts, missing segments, and the maximum paired/observation date independent of input order. IMOEX gaps are never interpolated. Asset-history freshness uses the latest returned candle rather than the requested range end; partial range and insufficient samples remain explicit.

Presentation now consumes fail-closed eligibility rather than merely calculating it:
- TWR requires complete verified portfolio history with sufficient points.
- XIRR remains unavailable because the current snapshot contract does not expose the dated cashflows needed to verify the broker-provided value.
- Health Score requires complete verified portfolio history and the existing 365-day maturity boundary.
- Portfolio versus IMOEX requires complete paired history and at least two paired points.

Financial formulas were not changed. Unverified values render as unavailable, never as zero and never as current verified metrics.

## Payouts, fundamentals, and async safety

Payout loading remains `LOADING`. Schedule eligibility follows the server's schedule-specific `integrity.complete`, so fact-only history errors do not invalidate an otherwise complete schedule. When payout trust is not calculation-safe, future events, forecast/source derivatives, bond linkage, and tax forecast consumers receive a closed schedule while confirmed historical facts remain separate.

Only official T-Invest fundamentals can be LIVE; API errors are ERROR and missing official fundamentals are UNAVAILABLE. Refresh ownership uses one monotonic sequence predicate in both success and error paths, so an older failure cannot overwrite a newer success.

## Mobile/accessibility

The shared indicator communicates state with semantic text plus color. Visible status and metadata use a 12 px floor, wrap/truncate within available width, and do not introduce horizontal scrolling at 360/390/430 px. It uses a static accessible label rather than an `aria-live` status, avoiding repeated periodic announcements when meaning has not changed.

## Review passes

- **QUANT:** formulas unchanged; missing→zero, stale→live, fallback→live, and unverified derived metrics are closed.
- **CODE:** deterministic canonical evaluator; ordered-date independence; monotonic success/error ownership; typed generic UI boundary.
- **MOBILE:** compact 12 px+ indicator, wrapping metadata, no new fixed width/nested scroll; deterministic source inspection covers 360/390/430 and landscape/tablet layout constraints. Real Samsung/TalkBack capture remains a project-lead device check because no browser/device is installed in this environment.
- **RELEASE:** Living World/DNA/Pixi files untouched; no binary artifacts; security and bundle budgets unchanged.

## Gates and results

- `cd v2 && npm ci`: passed (132 packages audited during install, 0 vulnerabilities).
- `cd v2 && npm audit --audit-level=high`: passed, 0 vulnerabilities.
- `cd v2 && npm run test:core`: passed, including table-driven Data Trust, LIVE-empty, explicit-stale, paired benchmark, payout, fundamentals, asset-history, missing-total, and request-ownership regressions.
- `cd v2 && npm run build`: passed TypeScript and production Vite build.
- Bundle: initial JS `443.79 kB` (below unchanged 450 kB guard), CSS `144.90 kB`, deferred Pixi DNA `505.94 kB`.
- `npm run test:api`: passed production dashboard identity/fundamentals/API routing regressions and syntax check.
- Root `npm audit --audit-level=high`: not applicable because the root project intentionally has no lockfile; the deployable v2 lockfile audit is clean.
- Browser screenshot/real Samsung verification: not executable locally because no Chromium/Android device is installed; exact follow-up is 360/390/430 portrait, phone landscape, tablet/desktop, Samsung Internet and TalkBack with stale/partial/wrapped source labels.
