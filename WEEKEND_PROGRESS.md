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

### Current focus
- Validate and deploy tail-risk v1 after branch review.
- Wire per-asset historical series before exposing a portfolio correlation matrix.
- Source and version historical stress-scenario shock tables before exposing stress results.
- Continue bond analytics only with verified source semantics; no guessed YTM/duration.
- Keep legal publication blocked until P0 review issues and real operator/provider placeholders are resolved.
