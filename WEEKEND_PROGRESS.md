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

### 20:59 MSK autonomous pass — sourced historical stress v1
- Added `STRESS` mode to Risk Workspace using the existing fail-closed stress engine; no new broker/backend route or secret-bearing boundary is required.
- Historical scenario catalog v1 is source-versioned and stores period, methodology, source URL and verification date with every scenario.
- Bank of Russia total-return observations used as explicit shocks: Q1 2020 MCFTR -17.4% / RGBITR -0.7%; 9M 2022 MCFTR -47.1% / RGBITR -1.8%.
- MCFTR is labelled as an equity proxy for current share/stock positions, not an instrument-level replay. RGBITR applies only to explicitly recognized OFZ positions.
- Corporate/unknown bonds and other unsupported classes remain unshocked and lower coverage; they never inherit an invented OFZ shock.
- UI reports covered-value P&L, coverage ratio, class-level shock and source methodology. Stress results are explicitly diagnostic and do not claim to forecast future losses.
- Existing repository `v2 build` workflow remains the single pre-merge TypeScript/Vite gate; a duplicate workflow drafted during the pass was removed before merge.

### 21:03 MSK autonomous pass — realized income history primitives
- A parallel stress-framework PR was closed without merge after `main` independently received the sourced stress implementation; duplicate analytics code was intentionally avoided.
- Added `v2/src/features/income/incomeHistory.ts` through PR #49 and squash-merged as `a81997befcec59a18c7424bdd4d301130ff56999`.
- Realized history consumes only payout events explicitly marked `FACT` and positive finite net amounts; it aggregates month/year totals and coupon/dividend/other splits without mixing forecast events into history.
- Income-source concentration is calculated from realized net payouts only using HHI, effective source count and top-source share.
- Passive-income goal progress requires a user-supplied positive annual net target and a complete 12-month realized calendar year. Short history is not annualized, no goal date is invented and no reinvestment assumption is silently applied.
- Quant methodology pass: fact/forecast separation preserved; no payout-growth extrapolation, no personalized recommendation and no invented return assumption.
- Code-quality pass: standalone strict TypeScript 5.8.3 compile succeeded against the current payout-event shape.
- Mobile-UX pass: no UI/layout changes; this is a runtime-isolated calculation primitive pending a later compact Income integration pass.
- Release pass: one new imported-by-nobody module only; no routes, broker calls, secrets, payment/legal content or existing render paths changed.
- Render status could not be queried in this run because the connector requires an explicitly selected workspace and autonomous mode cannot safely choose one. Auto-deploy was not manually triggered.

### 21:58 MSK autonomous pass — Portfolio P/L attribution groundwork
- Added `v2/src/features/portfolio/portfolioAttribution.ts` on branch `qvanix-portfolio-attribution-v1` as a deterministic current-position attribution primitive.
- Attribution consumes only broker-reported `expectedYield` from current positions; it does not reconstruct TWR or claim historical performance contribution without per-position return history.
- Position contribution uses `abs(position P/L) / sum(abs(position P/L))` so offsetting winners and losers cannot create unstable or misleading shares when net P/L is near zero.
- Positive P/L, negative P/L, net P/L and gross absolute P/L are exposed separately; asset-class grouping is deterministic and reuses the existing share/bond/fund/currency/future taxonomy.
- Quant methodology pass: this is explicitly unrealized broker P/L attribution, not return attribution, alpha, TWR or Brinson attribution.
- Code-quality pass: module is pure, side-effect free, has no API/network/storage dependency and uses finite-number guards on broker values.
- Mobile-UX pass: no UI change in this batch; primitive is groundwork for a later compact drill-down, avoiding another full widget.
- Release pass: isolated new module + documentation only; no existing rendering path, broker route, secret, legal text or deployment configuration changed.
- Local strict TypeScript 5.8.3 compile passed for the attribution boundary against the current `PositionSnapshot` type; runtime assertions passed for totals, winner/loser cancellation, class-share additivity and zero-P/L gating.
- PR #55 was squash-merged to `main` as `ea633c9c8098a67c1bab1d36465f7fc79e60462b`.
- Render `tinvest-pulse-v2-preview` deploy `dep-dai503rtqb8s73bl32tg`: `live`.
- Render `tinvest-pulse` deploy `dep-dai503rtqb8s73bl3300`: `live`.
- No rollback required; both auto-deploys accepted the same production commit.

### 23:00 MSK autonomous pass — Portfolio data context boundary
- Added `v2/src/features/portfolio/portfolioDataContext.ts` through PR #61 and squash-merged as `ecb32f4aa4c5c3e5f35cb25f0ab58e770dded455`.
- The boundary exposes account label, actual data source, reported timestamp/age, history date coverage and count of positions with observable price/cost-basis fields.
- No arbitrary freshness SLA is invented: age is numeric and timestamp state is only `REPORTED / MISSING / INVALID`.
- Quant/code review caught and removed a misleading planned `expectedYield` coverage counter before merge because `portfolioApi` normalizes a missing broker value to numeric zero, making source-field presence unknowable at this layer.
- Strict TypeScript 5.8.3 `--noEmit` validation passed against the current `PortfolioSnapshot` shape; runtime assertions passed for reported/missing/invalid timestamp handling and coverage counts.
- Mobile-UX pass: no UI/layout change in this batch; this is a compact data boundary for a later Portfolio context row rather than a new full widget.
- Release pass: one side-effect-free module only; no API route, broker call, credential, legal text, renderer or deployment configuration changed.
- Render `tinvest-pulse-v2-preview` deploy `dep-dai5sse1egvs73a2ekl0`: `live`.
- Render `tinvest-pulse` deploy `dep-dai5sse1egvs73a2ekng`: `live`.
- No rollback required.

### 00:00 MSK autonomous pass — drawdown recovery diagnostics
- Added `v2/src/features/analytics/recoveryDiagnostics.ts` through PR #67 and squash-merged as `f74f7e440a0e4b972a6a234b7d9279852251c52d`.
- Recovery diagnostics consume only the normalized portfolio TWR index. They do not use portfolio RUB value, benchmark prices or an LLM-derived number.
- A recovery episode closes only when the index regains the previous peak. Peak-to-trough, trough-to-recovery and total calendar durations are reported separately; an active drawdown remains open and is never counted as recovered.
- Fail-closed sample gate: fewer than 60 daily return observations returns `available=false`; 60–251 is `DEVELOPING`; 252+ is `MATURE`.
- No future recovery date, expected return or personalized action is forecast.
- Quant methodology pass: reviewed episode state transitions, depth formula `1 - trough / peak`, separation of active vs completed drawdowns and short-history behavior.
- Code-quality pass: strict TypeScript 5.8.3 compile passed; runtime assertions passed for the 59/60 observation gate, completed-episode depth/dates and active-drawdown separation.
- Mobile-UX pass: no UI/layout change; module is calculation groundwork only, so Samsung/Android density and widget duplication are unchanged.
- Release pass: PR diff is one pure analytics module plus methodology README; no backend route, broker call, secret, payment/legal text, renderer or deployment configuration changed.
- GitHub `v2 build` workflow run #90 completed successfully, including Vite build and `payouts-core.js` syntax check.
- Render `tinvest-pulse-v2-preview` deploy `dep-dai6odnqj5pc73bll4ig`: `live`.
- Render `tinvest-pulse` deploy `dep-dai6odnqj5pc73bll4g0`: `live`.
- No rollback required; both services accepted the production commit. No manual deploy was triggered.

## 2026-09-12

### 00:57 MSK autonomous pass — verified bond risk dimensions
- Confirmed current `main` already contains the compact Portfolio data-context integration from PR #69, so no duplicate Portfolio widget/change was introduced.
- Added `v2/src/features/portfolio/bondRiskDimensions.ts` on branch `qvanix-bond-risk-dimensions-v1` and merged PR #70 as `3cf9e4531a9f7642f639ff68ec7ed61b971b0de8`.
- Country-of-risk and sector concentration primitives consume only existing verified T-Bank bond metadata. HHI, effective count and top share are computed only inside the covered subset, while metadata coverage is reported separately.
- Issuer concentration remains explicitly unavailable because the current normalized snapshot contains no verified issuer identifier; sector/country are not relabelled as issuer concentration.
- No YTM, duration, expected return, stress assumption, LLM-derived number or personalized buy/sell output was added.
- Quant methodology pass: incomplete metadata cannot masquerade as full bond concentration because `coverageRatio` and `shareOfCovered` are separate quantities.
- Code-quality pass: the module is pure and side-effect free; GitHub `v2 build` workflow run #94 passed, including `tsc -b`, Vite build and `payouts-core.js` syntax check.
- Mobile-UX pass: no rendering/layout change in this batch; Samsung/Android density and no-duplication rules are unaffected.
- Release pass: one new calculation primitive only; no broker/backend route, renderer, secrets, legal/payment text or deployment config changed.
- Render auto-deploy was not manually triggered. Deploy status could not be queried because the Render connector requires a user-confirmed workspace and autonomous mode must not choose one implicitly.
- Legal publication remains blocked; no RU/EN offer, privacy or consent wording was published.

### 01:57 MSK autonomous pass — compact bond risk UI integration
- Integrated the existing verified country-of-risk and sector concentration primitives into the existing `BondAnalytics` split block through PR #72; no additional full-size widget was introduced.
- Each dimension shows metadata coverage separately from the leading category's share of the covered subset, plus the effective category count (`Nₑ = 1 / HHI`). This prevents partial T-Bank metadata from looking like complete portfolio coverage.
- Issuer concentration remains explicitly gated because the current snapshot has no verified issuer identifier; sector/country are not relabelled as issuer risk.
- YTM, duration, expected-return assumptions and personalized trade outputs remain absent.
- Quant methodology pass: verified that concentration percentages are labelled as shares of covered metadata and that coverage is visible alongside them.
- Code-quality pass: PR #72 changed only `BondAnalytics.tsx` and `bondAnalytics.css`; GitHub `v2 build` workflow run #96 completed successfully (`tsc -b`, Vite build and existing syntax checks).
- Mobile-UX pass: the new diagnostics reuse the existing two-column compact block, with 5.2px mobile labels and ellipsis rather than adding vertical cards or another scrolling section.
- Release pass: PR #72 was squash-merged to `main` as `b3da84473ef50321a93d693ada5868307a7c3705`; no backend route, broker call, credential, legal/payment text or deployment configuration changed.
- Render auto-deploy was not manually triggered. Status could not be queried because the Render connector requires a user-confirmed workspace and autonomous mode must not choose one implicitly.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.

### 02:59 MSK autonomous pass — passive-income comparable periods
- Added `v2/src/features/income/incomeComparables.ts` through PR #74 and squash-merged as `14ffbde94fe797fa09721212332c5bd95abef8b3`.
- The comparison uses only realized `FACT` history already normalized by `incomeHistory`: latest observed year versus the exact same fully observed calendar months of the preceding year.
- Partial or unobserved months are excluded rather than treated as zero. Fewer than 3 exact month pairs stays unavailable; 3–11 pairs is `PREVIEW`; 12 pairs is `MATURE`.
- Current/prior net totals and coupon/dividend subtotals are exposed. Percentage change is withheld when the prior comparable total is zero, avoiding an undefined growth rate.
- No short-history annualization, payout forecast, reinvestment assumption, goal date, personalized recommendation or LLM-derived financial number is introduced.
- Quant methodology pass: checked exact-month pairing, zero-base behavior and maturity gates; comparable-period output is explicitly a realized historical diagnostic rather than payout-growth forecasting.
- Code-quality pass: the module is pure TypeScript and type-only imports the existing history shape; GitHub `v2 build` workflow run #98 passed, including `tsc -b`, Vite build and `payouts-core.js` syntax check.
- Mobile-UX pass: no rendering/layout change in this batch, so Samsung/Android density and no-duplication rules are unchanged.
- Release pass: one new deterministic calculation module only; no backend/broker route, renderer, credential, legal/payment text or deployment configuration changed.
- Render auto-deploy was not manually triggered. Deploy status could not be queried in this pass because the Render connector requires a user-confirmed workspace and autonomous mode must not choose one implicitly.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.

### 04:03 MSK autonomous pass — compact income comparable-period UI
- Integrated the existing `calculateIncomeComparablePeriod` result into `Income → Источники` through PR #76 and squash-merged runtime commit `f08bc94f272cda02a3b521c1876f06c3a4a62765`.
- The existing fourth profile card is reused: when at least 3 exact complete month pairs exist it shows realized comparable-period change; otherwise the existing stability diagnostic remains in place. No new full-size widget or vertical section was added.
- Percentage change is shown only when the previous comparable-period net total is positive. A zero prior base falls back to absolute RUB change rather than displaying an undefined growth percentage.
- The detail label states the exact matched-month count and current/previous years; 3–11 pairs remain a partial comparable-period preview and are not presented as a full-year YoY result.
- Quant methodology pass: preserved exact-month pairing, FACT-only history, zero-base behavior, ≥3 availability gate and no annualization/reinvestment/forecast assumptions.
- Code-quality pass: GitHub `v2 build` workflow run #100 completed successfully, including `npm run build` and `node --check ../payouts-core.js`.
- Mobile-UX pass: reused the existing four-card `income-profile-grid`; no CSS expansion, extra navigation or new scrolling block was introduced.
- Release pass: runtime diff was limited to `IncomeWorkspace.tsx`; no backend/broker route, credential, legal/payment text or deployment configuration changed.
- Render auto-deploy was not manually triggered. Deploy status could not be queried because no Render workspace is selected/confirmed for this automation context; the connector explicitly requires user-confirmed workspace selection and autonomous mode must not guess.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.

### 05:04 MSK autonomous pass — deterministic rebalancing scenario groundwork
- Added `v2/src/features/analytics/rebalanceScenarios.ts` through PR #78 and squash-merged as `85dd0ca803ba4af6f0bac80c28885fbfe3310b31`.
- Scenarios reuse the existing drift strategy but operate only on the strategy-assigned equity/bond sleeve. Assets outside that sleeve are not redistributed or silently folded into the 50/50 target; their unassigned weight remains explicit.
- `REBALANCE_EXISTING` computes class-level target deltas with zero external flow.
- `ADD_CAPITAL` requires an explicit positive user-supplied amount and never assumes reductions of existing classes. It reports whether the exact target is reachable with additions only and the minimum add-only flow needed when it is not.
- `WITHDRAW_CAPITAL` requires an explicit positive user-supplied amount, must leave a positive assigned sleeve, and never assumes purchases/increases. It reports whether the exact target is reachable with withdrawals only and the minimum withdrawal required when it is not.
- Invalid target configurations fail closed; target weights are never silently normalized. Full-liquidation scenarios remain outside this diagnostic.
- Output is a deterministic class-level scenario, not a personalized buy/sell recommendation and not an execution instruction.
- Quant methodology pass: checked assigned-sleeve accounting, one-direction feasibility gates and minimum-flow formulas; no expected-return assumption or invented market value is introduced.
- Code-quality pass: GitHub `v2 build` workflow run #102 completed successfully, including `npm run build` and `node --check ../payouts-core.js`.
- Mobile-UX pass: no UI/layout change in this batch; Samsung/Android density and no-duplication rules are unchanged.
- Release pass: one pure TypeScript calculation module only; no backend/broker route, credential, legal/payment text, renderer or deployment configuration changed.
- Render auto-deploy was not manually triggered. Deploy status could not be queried because no Render workspace is selected/confirmed for this automation context; autonomous mode must not guess a workspace.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.

### Current focus
- Keep XP persistence storage-agnostic until an authenticated multi-user backend persistence boundary is approved.
- Correlation matrix now has real per-asset market history; deepen it only with validated live sample coverage and mobile density.
- Expand historical stress only with versioned sourced return data; do not convert OFZ yield-bp moves into price shocks until duration semantics are verified.
- Bond country/sector concentration is now compactly surfaced; issuer concentration stays gated until a verified issuer identifier is added to the broker metadata boundary. YTM/duration remain gated.
- Portfolio data context is now compactly surfaced in the existing Portfolio shell; account type remains gated until the backend exposes a verified account-type field.
- Broker P/L attribution remains clearly labelled current unrealized contribution; historical/TWR attribution stays gated on trustworthy per-position history.
- Recovery diagnostics are deterministic but should remain out of the UI until the live sample gate is met.
- Income exact-month realized comparable-period diagnostics are now compactly surfaced only when the ≥3 paired-month gate is met; goal progress remains gated until the user supplies an explicit target.
- Rebalancing now has deterministic class-level scenario groundwork; future UI integration should remain compact and accept only explicit user-authored add/withdraw amounts.
- Keep legal publication blocked until all P0 review issues and real operator/provider placeholders are resolved.

### 05:59 MSK autonomous pass — compact rebalancing scenario drill-down
- Integrated the existing deterministic rebalancing engine into the current `Analytics → DRIFT` panel through PR #80, squash-merged runtime commit `2d861262e02820bef360a5c70d058fe2d9fd9a38`.
- The integration is a collapsed-by-default `<details>` drill-down rather than a duplicate full widget. Existing-capital, add-capital and withdraw-capital modes reuse `calculateRebalanceScenario`; add/withdraw amounts are entered explicitly by the user and QVANIX never invents them.
- Output remains at strategy-class level and is labelled as target deltas, not order instructions. Assets outside the strategy sleeve remain unchanged and visible through the existing drift context.
- Quant methodology pass: no new formula was introduced in the UI layer; feasibility, minimum-flow gates and assigned-sleeve accounting remain owned by the already-reviewed deterministic scenario engine.
- Code-quality pass: latest GitHub `v2 build` workflow run #105 completed successfully, including `npm run build` and `node --check ../payouts-core.js`.
- Mobile-UX pass caught a clipping risk before merge because the DRIFT panel uses `overflow:hidden` on ≤620px. The accepted CSS keeps the normal collapsed DRIFT one-screen, but enables local vertical scrolling only while the user explicitly opens the scenario drill-down.
- Release pass: runtime diff is limited to `App.tsx`, one new React drill-down component and `drift.css`; no backend/broker route, credential, payment/legal wording, world renderer or deployment config changed.
- Render auto-deploy was not manually triggered. Deployment status could not be read through the connector because no user-confirmed Render workspace is selected in this autonomous context; a public endpoint probe also did not provide a reliable deployment-state signal, so no live status was invented.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.
- Next safe focus: deepen Portfolio attribution/drill-down without conflating broker unrealized P/L with historical TWR contribution, or continue data-gated risk analytics where live sample coverage already passes existing thresholds.

### 07:02 MSK autonomous pass — render-neutral DNA world-event boundary
- Added `v2/src/features/dna/xpWorldEvents.ts` through PR #87 and squash-merged as `364c6b4773af6c688e912b8623bdc9f06269522f`.
- The adapter converts only already-awarded, versioned XP events into compact semantic `WorldEvent` records for the future PixiJS world. It does not calculate XP, inspect RUB capital, derive progression, select biome/weather/art, or generate financial numbers.
- Invalid timestamps, unknown XP kinds, missing rule versions, negative/non-finite XP and duplicate source IDs fail closed. World-event IDs are stable (`xp:<event-id>`), timestamps are normalized to ISO and ordering is deterministic.
- `intensity` remains `null` intentionally: no arbitrary mapping from awarded XP to animation strength was invented. Renderer/art-direction choices remain a separate user-reviewed concern.
- Quant/product pass: no new financial methodology, forecast, personalized recommendation or wealth-based DNA level logic was introduced.
- Code-quality pass: GitHub `v2 build` workflow run #118 completed successfully; `npm run build` and `node --check ../payouts-core.js` both passed.
- Mobile-UX pass: no UI/layout/rendering change; Samsung/Android density and no-duplication rules are unchanged.
- Release pass: one pure TypeScript DNA adapter only; no backend/broker route, credential, legal/payment wording or deployment config changed.
- Render auto-deploy was not manually triggered. Deployment status still cannot be read safely because no user-confirmed Render workspace is selected in this automation context; no live state is guessed.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.
- Next safe focus: wire persisted XP events into a render-neutral world-state input boundary, or continue remaining Portfolio/Analytics depth where source-data gates already pass.

### 08:05 MSK autonomous pass — explicit strategy scenario comparison groundwork
- Audited the transaction-marker queue item first. The current Portfolio chart receives only daily history points, while `server-core.js` does retain reliable T-Bank operation date/type/FIGI during history reconstruction. Markers are therefore feasible only after a deliberate backend contract is added; no frontend reconstruction from indirect data was introduced in this pass.
- Added `v2/src/features/analytics/strategyScenarioComparison.ts` through PR #95 and squash-merged runtime commit `9d9fd421a19d403d6fbca67e532825e9c2583b6c`.
- The comparison accepts only 2–4 explicitly supplied, uniquely identified user strategy scenarios. QVANIX does not generate candidate allocations, rank a winner or attach expected returns.
- Each strategy must contain the complete supported two-class sleeve (`equity` + `bond`), positive finite weights summing exactly to 100%, and explicit non-negative tolerances. Invalid configs fail closed and are never silently normalized.
- Quant methodology review caught a pre-merge denominator mismatch risk for one-class 100% strategies; validator was tightened to require both supported classes before acceptance.
- For each accepted strategy the module reuses existing drift/rebalance math and reports current maximum absolute drift, unassigned weight, tolerance state and class-level existing-capital turnover. Turnover is half the gross absolute target deltas because class increases/decreases offset under zero external flow; unassigned assets are excluded and left unchanged.
- Output is deterministic diagnostics only: no personalized buy/sell recommendation, no instrument order list, no return forecast and no execution path.
- Code-quality pass: GitHub `v2 build` workflow run #130 completed successfully. `npm run build`, `node --check ../payouts-core.js`, `node --check ../server-core.js`, `production-v158.js` and `production-v159.js` all passed.
- Mobile-UX pass: no UI/CSS/rendering changes; Samsung/Android density and no-duplication rules are unchanged.
- Release pass: runtime diff is one pure TypeScript module; no broker/backend route, credential, legal/payment wording, DNA renderer or deployment configuration changed.
- Render auto-deploy was not manually triggered. Deploy status could not be queried because the Render connector has no user-confirmed workspace selected and autonomous mode must not guess one.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.
- Next safe focus: add a deliberate transaction-marker backend contract that exposes only verified date/side/instrument identity, then integrate time-only markers without implying execution-price precision; alternatively continue bond→Income event-identity deduplication if that backend path proves lower risk.

### 09:00 MSK autonomous pass — strict transaction-marker contract groundwork
- Re-read the mandatory product/audit/terminal/legal documents before changes. The immediate audit queue still prioritizes transaction-marker reliability, while legal publication remains blocked.
- Added `v2/src/features/portfolio/transactionMarkers.ts` through PR #97 and squash-merged runtime commit `80ecea3384493335646cb6b33c0a62c88821e88e`.
- The boundary accepts markers only when a stable broker operation ID, valid exact timestamp, explicit supported buy/sell operation type and at least one explicit instrument identity (`FIGI` or instrument UID) are present. Invalid rows fail closed; duplicates are removed by operation ID and output ordering is deterministic.
- Marker data intentionally contains no execution price/Y-coordinate and never infers side from cash sign, so a future chart cannot claim price precision the current history contract does not provide.
- Post-merge council review found that the first allow-list included three broker enum labels not explicitly evidenced by the current server code. A corrective PR #98 narrowed the allow-list to the exact reviewed types already represented in current history logic and squash-merged as `6411ddf321714270039953c10fe0685a21757bab`.
- Quant methodology pass: markers are event annotations only, not return attribution; no trade price, P&L contribution, TWR contribution or recommendation is reconstructed.
- Code-quality pass: `v2 build` run #132 passed before the initial merge; corrective run #134 also passed. Both included `npm run build` plus syntax checks for `payouts-core.js`, `server-core.js`, `production-v158.js` and `production-v159.js`.
- Mobile-UX pass: no rendering/UI change in this batch; chart density remains unchanged until a later reviewed integration pass.
- Release pass: runtime change is one pure TypeScript normalization module; no backend route, broker call, credential, legal/payment text or deployment configuration changed. The correction only narrows accepted enum values.
- Render auto-deploy was not manually triggered. Render deploy state cannot be queried safely because no user-confirmed workspace is selected; the connector explicitly prohibits autonomous workspace selection, so no live status is guessed.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.
- Next safe step: add a narrow backend marker endpoint only if it can expose the same verified operation ID/date/type/instrument identity without account IDs, tokens or price reconstruction; otherwise switch to bond→Income identity/deduplication groundwork.

### 10:10 MSK autonomous pass — verified transaction-marker backend boundary
- Re-read the mandatory project/product/audit/terminal/legal/progress documents before changing production code. A stale first branch/PR was detected after `main` advanced independently; PR #101 was closed unmerged and the change was recreated from the then-current `main` (`a5abc5637b4592c67190a91b04aeb55d5fc7a5f4`) before review.
- Added a narrow `/api/transaction-markers` boundary through PR #102 and squash-merged production commit `dd559dd5ec53fee79be1d453b5f8e4545cd1eb72`.
- The endpoint reuses the executed T-Bank OperationsService cursor feed but returns only validated event identity: broker operation ID, exact normalized timestamp, BUY/SELL side from the reviewed allow-list, FIGI/instrument UID, and positive finite quantity when available. Account ID, broker token, payment amount and execution price are not exposed.
- Duplicate broker operation IDs are removed deterministically. Rows missing operation ID, valid timestamp, supported side or instrument identity fail closed.
- The API explicitly declares `semantics: executed_operation_time_only` and `priceIncluded: false`; it therefore cannot be interpreted as a verified execution-price point for a chart.
- Quant methodology pass caught a coverage-label risk: the shared operations loader uses a rolling 10-year window with a hard cap of 10 pages × 1000 rows. The accepted response now exposes those coverage bounds explicitly instead of implying complete lifetime history.
- Code-quality/release pass caught a CI blind spot before merge: `.github/workflows/v2-build.yml` did not watch or syntax-check the new runtime wrapper. The workflow now includes `production-v160.js` in both path filters and `node --check` validation.
- GitHub `v2 build` PR run #136 passed, including Vite/TypeScript build plus syntax checks for `payouts-core.js`, `server-core.js`, `production-v158.js`, `production-v159.js` and `production-v160.js`. Post-merge `main` run #137 also passed; Smoke Project Shield passed for the production commit.
- Mobile-UX pass: no UI/CSS/chart rendering changed; Samsung/Android density remains unchanged until a separate compact marker-rendering review.
- Release pass: the production change is isolated to the new reversible `production-v160.js` wrapper, one-line `server.js` activation and CI coverage. Rollback remains unambiguous by switching `server.js` back to `production-v159.js` if runtime regression is later attributed to this boundary.
- Render auto-deploy was not manually triggered. Read-only deployment monitoring is still blocked because the connector has no user-confirmed workspace selected and explicitly forbids autonomous workspace selection; no deploy state is guessed.
- Legal publication blocker remains unchanged; no RU/EN offer, privacy-policy or consent wording was published.
- Next safe step: add a typed v2 client adapter for `/api/transaction-markers` and only then integrate compact time-only buy/sell annotations into the existing Portfolio history view, with no Y-position/execution-price claim and with density gating on Samsung/Android.
