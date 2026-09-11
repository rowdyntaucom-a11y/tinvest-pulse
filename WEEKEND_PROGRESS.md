# QVANIX Weekend Progress

This log is maintained by autonomous development runs. Production changes must remain reviewable and reversible.

## 2026-09-11
- IMOEX benchmark restored and verified live.
- Income Sources: transparent 12M YoC added; payout-growth metric gated until two comparable annual periods exist.
- Drift v1 added for approved 50/50 equities/bonds strategy with explicit tolerance and non-advisory labeling.
- Legal readiness checklist added; final RU/EN legal text remains blocked pending operator requisites, provider choices and final review.
- Monte Carlo v1 added as historical bootstrap with P10/median/P90 and strict short-history gating; live deployment succeeded.
- Income integrity model added: VERIFIED / STALE / PARTIAL / unavailable are distinct states; coverage exposes resolved/eligible assets and source errors without mixing fact and forecast.
- Mobile one-screen pass tightened Income and Analytics navigation; five Analytics tabs fit the mobile grid.
- XP Engine groundwork added under `v2/src/features/dna/`: current quality signals are separated from persistent accumulated XP; the ledger validates/de-duplicates versioned XP events and never reads RUB capital.
- Anti-gaming rule primitives added with stable event IDs. Contribution-habit rules intentionally have no deposit-amount input, and XP values must come from an explicit reviewed config rather than hidden defaults.
- Compact `WorldState` boundary added for PixiJS: level/xp/quality coverage/time phase/weather/events are passed as resolved state; it does not derive levels from capital or silently derive weather from returns.
- Advanced investor depth audit added and made mandatory for autonomous passes so existing Portfolio / Analytics / Income / Bonds screens are deepened before unrelated navigation growth.
- Portfolio depth v1: position sorting by weight / P&L RUB / P&L %, selectable position inspector, quantity, average/current price, current value, weight and broker-reported P&L.
- Benchmark-relative Analytics v1: Portfolio vs IMOEX mode with common-sample return, excess return, Tracking Error, Information Ratio, Beta and correlation. Complex relative-risk coefficients are gated until at least 60 paired daily returns; 252 paired returns marks mature history.
- Income depth v2: realized coupon/dividend split, top confirmed 12M source, source concentration HHI and effective number of income sources.
- Bond analytics v1: current bond positions are enriched only from T-Bank instrument metadata; UI exposes maturity ladder, OFZ share, coupon type, nominal currency, nearest maturity and metadata coverage. YTM/duration remain intentionally gated until price/nominal semantics are verified.
- Historical tail risk uses one-day TWR returns only. VaR 95% / CVaR are unavailable below 126 returns and mature at 252; worst day and negative-day frequency remain descriptive diagnostics.
- Correlation primitives use paired daily returns with a 60-return gate. Stress primitives accept only explicit sourced class shocks and report coverage; no historical shock numbers are invented.
- Rolling-risk mode added for return / volatility / drawdown with short-history gating; mobile controls were tightened to preserve one-screen density.
- `QVANIX_TERMINAL_DECISIONS.md` and `LEGAL_REVIEW_2026-09-11.md` are now part of the current main lineage. The latter remains a publication blocker checklist, not publishable final legal wording.

### 20:00 MSK autonomous pass — XP persistence boundary
- Added `xpPersistence.ts` on branch `qvanix-xp-persistence-v1` as a storage-agnostic deterministic boundary for XP event persistence.
- Persisted documents fail closed when schema/version is invalid; corrupt payloads cannot manufacture XP.
- Event normalization validates known event kinds, non-negative finite XP, stable IDs, rule versions and ISO timestamps.
- Merge is idempotent: existing event IDs always win, retries cannot double-count or rewrite earlier awards, and event ordering is deterministic.
- The persistence layer has no browser-storage, account-id, broker-token or RUB-capital dependency; production storage remains a future authenticated backend concern.
- DNA README updated with persistence, retry/idempotency and backend-storage rules. Final XP weights/level economy remain gated on validation and are not invented in this pass.

### Validation / release notes
- Quant methodology pass: no new financial calculation or wealth-based XP logic introduced; persistence only stores already-awarded versioned events.
- Code-quality pass: new module is pure TypeScript, imports only the existing XP engine, has no runtime side effects and preserves the existing `XpEvent` schema.
- Mobile-UX pass: no UI/layout changes in this batch.
- Release pass: runtime diff is isolated to DNA groundwork plus documentation; no broker/backend route changes, no secrets, no legal text publication.
- TypeScript/Vite build must pass on the feature branch/Render before production acceptance; if build or deploy fails, this batch must not be promoted further.

### Current focus
- Complete XP persistence branch build/release verification, then wire backend persistence only after an authenticated multi-user storage boundary exists.
- Wire per-asset historical series before exposing a portfolio correlation matrix.
- Source and version historical stress-scenario shock tables before exposing stress results.
- Continue bond analytics only with verified source semantics; no guessed YTM/duration.
- Deepen passive-income history / concentration / goal framework without fabricating payout growth.
- Keep legal publication blocked until all P0 issues and real operator/provider placeholders are resolved.
