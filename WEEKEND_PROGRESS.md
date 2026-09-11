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
- Advanced investor audit added as `ADVANCED_INVESTOR_AUDIT.md`; autonomous work now treats old tabs as depth work, not finished decorative screens.
- Portfolio depth v1 implemented and merged to `main`: position sorting by weight / broker P&L RUB / P&L %, selectable position drill-down, quantity / average price / current price / value / broker expectedYield result and compact mobile inspector. The production TypeScript/Vite build succeeded; Render rollout had not yet promoted at the time of this log update.
- Benchmark-relative analytics v1 implemented and merged to `main`: Risk now has Portfolio / VS IMOEX modes. Relative mode includes same-window portfolio return, IMOEX return, excess return, Tracking Error, Information Ratio, Beta and correlation. Advanced ratios are explicitly gated until at least 60 paired daily returns and mature at 252.
- Income depth v2 prepared on `qvanix-income-depth-v2`: realized coupon/dividend split, 12M top income source and effective number of income sources (1/HHI) based only on confirmed gross schedule. This package is intentionally not merged until the current Render rollout queue clears.

### Current focus
- Wait for the current Render rollout to become healthy before merging Income depth v2.
- Then add deterministic bond analytics only where trustworthy instrument metadata exists; do not invent maturity/issuer/coupon-type fields.
- Continue rolling/benchmark-relative diagnostics as sample history grows.
- Connect deterministic XP rule inputs only when the required monthly contribution/income-history data is available.
- Define transaction/payout world events and persistence boundary without exposing capital.
- Review dependency audit safely before changing package versions.
- Keep subjective DNA art-direction changes blocked until user review.
