# QVANIX Weekend Progress

This log is maintained by autonomous development runs. Production changes must remain reviewable and reversible.

## 2026-09-11
- IMOEX benchmark restored and verified live.
- Income Sources: transparent 12M YoC added; payout-growth metric gated until two comparable annual periods exist.
- Drift v1 added for approved 50/50 equities/bonds strategy with explicit tolerance and non-advisory labeling.
- Legal readiness checklist added; final RU/EN legal text remains blocked pending operator requisites and user-supplied source documents.
- Monte Carlo v1 added as historical bootstrap with P10/median/P90 and strict short-history gating; live deployment succeeded.
- Income integrity model added: VERIFIED / STALE / PARTIAL / unavailable are distinct states; coverage now exposes resolved/eligible assets and source errors without mixing fact and forecast.
- Mobile one-screen pass tightened Income and Analytics navigation; five Analytics tabs now fit the mobile grid.
- Production validation: an intermediate Income commit failed because `incomeCompact.css` had not yet landed; the immediately following complete commit fixed the dependency and both Render services returned to `live`. Final accepted commit for that pass: `22c0409ae7a9b72e6c886df2342c20b3087e85d8`.
- XP Engine groundwork added under `v2/src/features/dna/`: current quality signals are separated from persistent accumulated XP; the ledger validates/de-duplicates versioned XP events and never reads RUB capital.
- Anti-gaming rule primitives added with stable event IDs. Contribution-habit rules intentionally have no deposit-amount input, and XP values must come from an explicit reviewed config rather than hidden defaults.
- Compact `WorldState` boundary added for PixiJS: level/xp/quality coverage/time phase/weather/events are passed as resolved state; it does not derive levels from capital or silently derive weather from returns.
- TypeScript/Vite build for the XP/world-state batch completed successfully on Render. Existing build output still reports two moderate npm vulnerabilities; review is pending and no blind `npm audit fix` has been applied.
- Advanced investor depth audit added and made mandatory for autonomous passes so existing Portfolio / Analytics / Income / Bonds screens are deepened before unrelated navigation growth.
- Portfolio depth v1: position sorting by weight / P&L RUB / P&L %, selectable position inspector, quantity, average/current price, current value, weight and broker-reported P&L. Build succeeded.
- Benchmark-relative Analytics v1: Portfolio vs IMOEX mode with common-sample return, excess return, Tracking Error, Information Ratio, Beta and correlation. Complex relative-risk coefficients are gated until at least 60 paired daily returns; 252 paired returns marks mature history.
- Income depth v2 is live on both Render services: realized coupon/dividend split, top confirmed 12M source, source concentration HHI and effective number of income sources.
- Preview deployment for benchmark-relative Analytics built successfully but initially hit a transient Render port-scan timeout after build. A no-code redeploy of the same commit completed successfully and preview returned to `live`; primary was already `live`. No code rollback was required.
- Bond analytics v1 added: current bond positions are enriched only from T-Bank instrument metadata; UI exposes maturity ladder, OFZ share, coupon type, nominal currency, nearest maturity and metadata coverage. YTM/duration remain intentionally gated until price/nominal semantics are verified.
- Initial bond production deploy failed at runtime because the bridge looked for a marker removed earlier by `server-base.js`. The bridge marker was changed to the actual post-transform dashboard marker; hotfix `b07d93886ccaf4ffbfd1734e0ae7b1b4a544cb54` restored both preview and primary to `live`.
- Tail-risk v1 prepared on repaired main: historical one-day VaR 95% / CVaR (Expected Shortfall), worst day and negative-day frequency use daily TWR returns only. VaR/CVaR are unavailable below 126 returns and mature at 252.
- Correlation-matrix primitives use paired daily returns with a 60-return gate. Stress-test primitives accept only explicit sourced class shocks and report coverage; no historical shock numbers are invented.
- Rolling-risk mode added for return / volatility / drawdown with short-history gating; mobile controls were tightened to preserve one-screen density.
- `QVANIX_TERMINAL_DECISIONS.md` and `LEGAL_REVIEW_2026-09-11.md` are now in the current main lineage. The legal review remains a publication blocker checklist, not final publishable wording.

### 20:00 MSK autonomous pass — XP persistence boundary
- Added `xpPersistence.ts` on branch `qvanix-xp-persistence-v1` as a storage-agnostic deterministic boundary for XP event persistence.
- Persisted documents fail closed when schema/version is invalid; corrupt payloads cannot manufacture XP.
- Event normalization validates known event kinds, non-negative finite XP, stable IDs, rule versions and ISO timestamps.
- Merge is idempotent: existing event IDs always win, retries cannot double-count or rewrite earlier awards, and event ordering is deterministic.
- The persistence layer has no browser-storage, account-id, broker-token or RUB-capital dependency; production storage remains a future authenticated backend concern.
- DNA README updated with persistence, retry/idempotency and backend-storage rules. Final XP weights/level economy remain gated on validation and are not invented in this pass.

### Validation / release notes
- Quant methodology pass: no new financial calculation or wealth-based XP logic introduced; persistence only stores already-awarded versioned events.
- Code-quality pass: TypeScript 5.8.3 strict `--noEmit` compile passed against the existing XP schema shape; runtime assertions passed for duplicate retry, invalid event rejection, fail-closed version mismatch and prevention of XP rewrite.
- Mobile-UX pass: no UI/layout changes in this batch.
- Release pass: runtime diff is isolated to DNA groundwork plus documentation; no broker/backend route changes, no secrets, no legal text publication.
- PR #44 was squash-merged to `main` as `ccd4674b9321293868c0ac3907ccfb20850393a8` after diff review.
- Render `tinvest-pulse-v2-preview` deploy `dep-dai393uk1f9s73eqfn9g`: `live`.
- Render `tinvest-pulse` deploy `dep-dai393uk1f9s73eqfn6g`: `live`.
- No rollback required; both services accepted the same production commit.

### 20:28 MSK autonomous pass — per-asset correlation history
- Added an isolated `/api/asset-history` boundary backed by T-Bank `MarketDataService/GetCandles` with a fixed 365-day daily window, top-six current positions and a 15-minute server cache.
- Endpoint output is intentionally narrow: instrument key/label plus price history only; broker token, quantity, current capital value and trading actions are not exposed.
- Added mobile `CORR` mode to Risk Workspace. Pearson correlation is calculated from overlapping daily returns, not price levels, and remains unavailable below 60 paired returns.
- Correlation matrix surfaces the lowest/highest mature pair and keeps incomplete pairs fail-closed instead of inventing coefficients.
- PR #45 was squash-merged as `4be20d372844776bd737cf0efc6619ba2e0c0e26` after TypeScript checks and runtime assertions for +1/-1 correlation and the 60-vs-59 return boundary.
- The first primary deploy of #45 built the Vite bundle successfully but failed during `node server.js`: nested template escaping in `production-v159.js` emitted an invalid token while dynamically compiling the v15.8 wrapper. Existing production remained live and was not cut over.
- Hotfix PR #46 replaced the nested template delimiter with JSON-serialized injected source and was squash-merged as `fcffdbaaaecc34c5099caae8d314aaa11b709918`.
- Render `tinvest-pulse-v2-preview` deploy `dep-dai3lj2d0e5s73beill0`: `live`.
- Render `tinvest-pulse` deploy `dep-dai3lj2d0e5s73beilng`: `live`; startup log confirms local Russian Trusted CA load and server listening on port 10000.
- No rollback was required. The failed deploy and hotfix are retained here as release history.

### Current focus
- Keep XP persistence storage-agnostic until an authenticated multi-user backend persistence boundary is approved.
- Correlation matrix now has real per-asset market history; next deepen it only after validating live sample coverage and UX density.
- Source and version historical stress-scenario shock tables before exposing stress results.
- Continue bond analytics only with verified source semantics; no guessed YTM/duration.
- Deepen passive-income history / concentration / goal framework without fabricating payout growth.
- Keep legal publication blocked until all P0 review issues and real operator/provider placeholders are resolved.
