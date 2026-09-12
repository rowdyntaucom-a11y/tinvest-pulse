# QVANIX — Advanced Investor Feature Audit

Purpose: prevent the product from becoming a set of pretty but shallow screens. This is the working checklist for Portfolio / Analytics / Income / DNA, based on the user's reference materials and the current approved QVANIX architecture.

Status legend: DONE = implemented in current v2 shell or accepted deterministic runtime boundary; ACTIVE = current build phase; GATED = correct to wait for more data / legal / monetization; LATER = valid product feature but not required for the deterministic shell milestone.

## 1. Portfolio

### DONE
- Current capital and monetary result.
- Current positions with weights and values.
- Asset-class structure.
- Mobile-first layout.
- Position drill-down: quantity, acquisition basis, current price/value, portfolio share and broker unrealized P/L.
- Current broker P/L attribution by holding and asset class, explicitly separated from TWR / alpha / historical return attribution.
- Compact data context: source, reported timestamp age, price/cost-basis coverage and history coverage.
- FIGI / instrument UID preserved in normalized position snapshots for deterministic cross-feature matching.

### ACTIVE / next depth pass
- Verified account context: IIS / brokerage account type, status/open date/access level using the existing read-only accounts endpoint.
- Transaction markers on history charts only where operation type/date/instrument identity is reliable enough to avoid misleading reconstruction.
- Better compact movers / largest exposures presentation only if it adds information beyond existing P/L sorting and Analytics concentration.
- Income contribution inside position drill-down only where payout-to-position linkage is unambiguous.

### GATED
- Historical/TWR contribution by position until trustworthy position-level return history and external-flow treatment exist.

### LATER
- Multi-account / multi-broker aggregation.
- Multi-currency reporting with historical FX basis.
- Arbitrary/non-traded assets.
- Short / leverage / futures support.

## 2. Analytics

### DONE
- TWR.
- XIRR.
- IMOEX normalized benchmark with coverage/integrity.
- Max drawdown.
- Annualized volatility.
- Sharpe.
- Sortino.
- HHI and effective number of positions.
- Transparent versioned Health Score.
- Drift vs configured target allocation.
- Monte Carlo block bootstrap v2 with P10 / median / P90, 5-trading-day blocks and strict short-history gating.
- Rolling return / volatility / drawdown / benchmark diagnostics with 20 / 60 / 120 / 252-trading-day data gates.
- Portfolio-vs-IMOEX excess return, Tracking Error, Information Ratio, Beta and correlation with paired-history gates.
- Historical one-day VaR 95% / CVaR (Expected Shortfall) with strict sample gating.
- Per-asset correlation matrix from real T-Bank daily histories with paired-return coverage.
- Sourced historical stress scenarios with class coverage and explicit methodology; unsupported assets remain unshocked.
- Current broker P/L contribution / attribution by holding and asset class.
- Rebalancing diagnostics for existing capital / explicit additions / explicit withdrawals.
- Drawdown recovery diagnostics with completed-vs-active episode separation and short-history gate.
- Risk-only Pro/Terminal allocation calculation boundary: equal weight, long-only minimum variance and equal-risk-contribution on one common real-return sample; no expected-return assumptions.

### ACTIVE / next depth pass
- Side-by-side deterministic strategy scenario comparison beyond the current rebalancing modes, only when inputs are explicit and methodology is distinct.
- Compact Pro/Terminal information architecture once enough advanced modules justify a separate mode; do not overload the default mobile shell.
- Further correlation/stress depth only from validated live coverage and versioned sourced scenarios.

### GATED by data quality / sample length
- 12M rolling metrics on histories shorter than 12 months.
- Stable Beta / Tracking Error / Information Ratio until benchmark overlap reaches the configured gate.
- Mature VaR / CVaR until return-history quality reaches the configured gate.
- Historical/TWR attribution by position until position-level return histories are trustworthy.
- Markowitz / Black-Litterman expected-return optimization until assumptions, constraints and sensitivity handling are explicit; risk-only allocation diagnostics may exist earlier.

## 3. Income

### DONE
- Real received dividends + coupons.
- Confirmed 12M payout schedule.
- Fact vs forecast separation.
- Payout calendar.
- Source breakdown by asset.
- Schedule coverage / integrity states.
- YoC 12M only where a real current-position cost basis exists.
- FIGI-first payout-to-position matching for cost-basis / YoC linkage, with ticker/name only as fallback and match basis exposed.
- Realized income history by observed month/year without treating unobserved periods as zero.
- Exact comparable-period diagnostics across matched complete months; no short-history annualization.
- Realized income-source concentration, HHI/effective sources and top-source share.
- Coupon vs dividend realized split.
- Compact explicit annual net-income goal input; progress opens only after a complete realized 12-month calendar year.
- Asset and month drill-down already present; category split is represented by coupon/dividend/other fact history.

### ACTIVE / next depth pass
- Upcoming-payment risk/status labels only when an official source exposes a defensible status field.
- Deeper goal scenarios only if every reinvestment/contribution/return assumption is explicit and testable.

### GATED
- Payout growth: require two comparable realized annual periods; no annualization of short history.
- Dividend reliability score: only after a defensible deterministic issuer-data model exists.
- Ex-dividend calendar: only from a reliable official/market source.
- Goal-date forecast using XIRR/reinvestment only after assumptions are explicit and testable.

## 4. Bond analytics

Reference materials explicitly call out bond diversification by maturity / issuer / currency / coupon type. QVANIX should not treat bonds as a generic pie slice.

### DONE
- Maturity ladder from verified instrument metadata.
- Weighted calendar term-to-maturity with separate coverage and perpetual/missing-date handling.
- OFZ share.
- Fixed / floating / other coupon-type split where metadata exists.
- Nominal currency split.
- Country-of-risk and sector concentration with metadata coverage and effective-category count.

### ACTIVE / next depth pass
- Verified issuer concentration once the broker metadata boundary exposes a trustworthy issuer identifier; sector/country must not be relabelled as issuer.
- Explicit bond cash-flow linkage to Income without double-counting coupons already present in the payout schedule.

### GATED
- Duration / YTM / yield-to-call metrics until source/price/nominal semantics and amortization treatment are verified end-to-end.
- Price-shock stress from yield-bp moves until duration semantics are verified.

## 5. Reports / export

### LATER but retained in roadmap
- User-selectable period / assets / categories.
- CSV/Excel export first.
- PDF report after the mobile shell and deterministic metrics stabilize.
- Every exported metric must carry the same calculation version/methodology as the UI.

## 6. DNA / XP

### DONE / groundwork
- XP independent of absolute capital.
- Deterministic versioned event ledger with idempotency / anti-gaming primitives.
- Storage-agnostic XP persistence boundary that fails closed on invalid/corrupt payloads.
- Compact world-state boundary separated from Pixi rendering.
- Render-neutral XP-to-world-event adapter with stable IDs and no XP-amount-to-visual-intensity inference.

### ACTIVE
- Connect only reviewed relative signals: TWR, consistency, Health, realized income growth when valid and strategy-adherence events when the rule is explicit.
- Continue world-event semantics / progression persistence before subjective final art changes.

### GATED / later
- Final XP weights and long-term level economy require validation against real user behavior.
- Full art/world rebuild after deterministic shell quality is strong enough and the user reviews subjective direction.

## 7. Pro / Terminal

### DONE / foundation
- Real per-asset daily market-history boundary for the current top positions.
- Correlation/stress primitives and live correlation mode.
- Risk-only allocation diagnostics: equal weight, long-only minimum variance, equal-risk-contribution.

### ACTIVE / next
- Define a separate Pro/Terminal shell only when it can host several real modules without crowding the default Portfolio/Analytics/Income/DNA mobile navigation.
- Technical-analysis foundation may follow using deterministic OHLCV indicators and user-authored alerts only.

### GATED
- Intraday/order-book features pending market-data architecture and cost review.
- Options/IV/Greeks pending a trustworthy option-chain source and model selection.
- Backtesting pending isolated job architecture and look-ahead/survivorship/corporate-action controls.
- Personalized trade signals / real-money execution remain outside the approved product model.

## 8. AI / advanced assistant

The reference set includes in-app AI, live market search, natural-language screeners and MCP-style access. These remain intentional later-stage features.

### GATED by monetization / security / legal readiness
- Portfolio-aware AI chat.
- Live-web explanation layer over deterministic numbers.
- Natural-language screener translation.
- Broker-report parsing from unstructured files.
- External assistant / MCP access with explicit permissions and confirmation for write actions.

Rule: LLM is never the source of financial numbers.

## 9. Social / public layer

### LATER
- Public portfolios / share cards.
- Popular assets / public discovery.
- Blog/community layer.

Not a blocker for the private analytical terminal milestone.

## 10. Product quality bar

A tab is not 'done' because it has no empty pixels. It is done only when:
1. It answers a distinct investor question.
2. Core widgets use real data or are explicitly gated.
3. No metric is duplicated as a full widget on multiple tabs.
4. Advanced detail is available through compact drill-downs / subviews rather than endless scrolling.
5. Every non-obvious metric exposes methodology, source and sample-quality state.
6. Mobile remains usable on the primary Samsung/Android target.
7. No placeholder, fake forecast or decorative-only analytics is presented as fact.

## Immediate build queue — refreshed 2026-09-12
1. Finish verified Portfolio account context and decide whether reliable transaction markers add enough value without clutter.
2. Close remaining bond identity gap: issuer identifier / issuer concentration, otherwise keep it explicitly gated.
3. Keep Income growth / goal-date forecasting gated; only deepen with explicit user assumptions and full comparable history.
4. Mature Pro/Terminal calculation boundaries (risk-only allocation first) before exposing a separate shell.
5. Continue XP world-event semantics/persistence without locking final XP economy or subjective art direction.
6. Keep legal publication blocked until all P0 review issues and real operator/provider placeholders are resolved.
