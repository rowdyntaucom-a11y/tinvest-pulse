# QVANIX — Advanced Investor Feature Audit

Purpose: prevent the product from becoming a set of pretty but shallow screens. This is the working checklist for Portfolio / Analytics / Income / DNA, based on the user's reference materials and the current approved QVANIX architecture.

Status legend: DONE = implemented in current v2 shell; ACTIVE = current build phase; GATED = correct to wait for more data / legal / monetization; LATER = valid product feature but not required for the deterministic shell milestone.

## 1. Portfolio

### DONE
- Current capital and monetary result.
- Current positions with weights and values.
- Asset-class structure.
- Mobile-first layout.

### ACTIVE / next depth pass
- Position drill-down: acquisition basis, current value, unrealized result, share of portfolio, income contribution where available.
- Performance contribution / attribution by position without confusing price P&L with TWR.
- Transaction markers on history charts where operation data is reliable.
- Account context: IIS / account type / source / data freshness.
- Better compact 'movers / concentration / largest exposures' presentation without duplicating Analytics.

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
- Monte Carlo historical bootstrap with P10 / median / P90 and strict short-history gating.

### ACTIVE / next depth pass
- Rolling-window views (where enough history exists): return, volatility, drawdown and benchmark spread.
- Portfolio-vs-benchmark excess return and tracking diagnostics once the shared history is long enough.
- Contribution / attribution by holding and asset class.
- Rebalancing scenarios as diagnostics: rebalance with existing capital / add new capital / withdraw capital; no direct personalized trade command.
- Side-by-side strategy scenario comparison ('what if') using deterministic inputs.
- Bond-specific analytics screen: maturity ladder, issuer concentration, coupon type and currency/nominal dimensions where source data is trustworthy.
- Recovery diagnostics after drawdowns when enough history exists.

### GATED by data quality / sample length
- 12M rolling metrics on histories shorter than 12 months.
- Stable Beta / tracking error / information ratio until benchmark overlap is sufficiently long.
- VaR / CVaR until return-history quality is adequate; never show fake precision from a tiny sample.

## 3. Income

### DONE
- Real received dividends + coupons.
- Confirmed 12M payout schedule.
- Fact vs forecast separation.
- Payout calendar.
- Source breakdown by asset.
- Schedule coverage / integrity states.
- YoC 12M only where a real current-position cost basis exists.

### ACTIVE / next depth pass
- Income history by month / year with comparable-period views.
- Goal widget for passive income with explicit assumptions.
- Income-source concentration.
- Coupon vs dividend split.
- Asset / month / category drill-down.
- Upcoming-payment risk/status labels only when official source supports them.

### GATED
- Payout growth: require two comparable realized annual periods; no annualization of short history.
- Dividend reliability score: only after a defensible deterministic issuer-data model exists.
- Ex-dividend calendar: only from a reliable official/market source.
- Goal-date forecast using XIRR/reinvestment only after assumptions are explicit and testable.

## 4. Bond analytics

Reference materials explicitly call out bond diversification by maturity / issuer / currency / coupon type. QVANIX should not treat bonds as a generic pie slice.

### ACTIVE / planned deterministic widgets
- Maturity ladder.
- Issuer concentration.
- Fixed / floating / other coupon-type split where metadata exists.
- Nominal currency split.
- Coupon cash-flow calendar link to Income.
- Duration / yield metrics only when source semantics are verified.

## 5. Reports / export

### LATER but retained in roadmap
- User-selectable period / assets / categories.
- CSV/Excel export first.
- PDF report after the mobile shell and deterministic metrics stabilize.
- Every exported metric must carry the same calculation version/methodology as the UI.

## 6. DNA / XP

### ACTIVE
- XP independent of absolute capital.
- Deterministic event ledger with idempotency / anti-gaming rules.
- Compact world-state boundary.
- Relative signals only: TWR, consistency, Health, income growth when valid.
- World events / level / weather separated from rendering.

### GATED / later
- Final XP weights and long-term level economy require validation against real user behavior.
- Full art/world rebuild after deterministic shell quality is strong enough.

## 7. AI / advanced assistant

The reference set includes in-app AI, live market search, natural-language screeners and MCP-style access. These remain intentional later-stage features.

### GATED by monetization / security / legal readiness
- Portfolio-aware AI chat.
- Live-web explanation layer over deterministic numbers.
- Natural-language screener translation.
- Broker-report parsing from unstructured files.
- External assistant / MCP access with explicit permissions and confirmation for write actions.

Rule: LLM is never the source of financial numbers.

## 8. Social / public layer

### LATER
- Public portfolios / share cards.
- Popular assets / public discovery.
- Blog/community layer.

Not a blocker for the private analytical terminal milestone.

## 9. Product quality bar

A tab is not 'done' because it has no empty pixels. It is done only when:
1. It answers a distinct investor question.
2. Core widgets use real data or are explicitly gated.
3. No metric is duplicated as a full widget on multiple tabs.
4. Advanced detail is available through compact drill-downs / subviews rather than endless scrolling.
5. Every non-obvious metric exposes methodology, source and sample-quality state.
6. Mobile remains usable on the primary Samsung/Android target.
7. No placeholder, fake forecast or decorative-only analytics is presented as fact.

## Immediate build queue
1. Complete Portfolio depth pass: attribution + position drill-down + transaction/context signals.
2. Add Analytics rolling/excess-return/attribution views with short-history gating.
3. Add bond-specific analytics foundation.
4. Deepen Income history / concentration / goal framework without fabricating payout growth.
5. Complete XP event persistence boundary and then proceed to DNA world events.
