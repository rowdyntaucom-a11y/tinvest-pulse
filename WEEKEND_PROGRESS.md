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
- Production validation: an intermediate Income commit failed because `incomeCompact.css` had not yet landed; the immediately following complete commit fixed the dependency and both Render services returned to `live`. Final accepted commit for this pass: `22c0409ae7a9b72e6c886df2342c20b3087e85d8`.

### Current focus
- Deterministic XP Engine v1 groundwork: normalized current quality signals separated from persistent accumulated XP.
- Define event/state boundary for later world events without tying level to RUB capital.
- Keep subjective DNA art-direction changes blocked until user review.
