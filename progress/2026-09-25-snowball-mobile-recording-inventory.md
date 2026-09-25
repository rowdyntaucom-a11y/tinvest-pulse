# QVANIX — Snowball mobile recording inventory

Date: 2026-09-25

Source: user-provided mobile recording `1000031720.mp4` (~3m40s).  
Purpose: expand the Snowball functional benchmark for QVANIX. This is an observed-product inventory, not a claim about every Snowball feature outside the recording.

## Permanent product rule

Snowball is the **minimum functional breadth benchmark**, not a UI template.

QVANIX should:
- cover at least the investor questions and workflows observed below;
- exceed them where QVANIX already has stronger deterministic/risk methodology;
- keep QVANIX shell identity, progressive depth and data-honesty rules;
- not compress ordinary workspaces to one screen merely for visual cleanliness;
- let each tab continue downward through as many functional chapters as needed;
- keep Pulse/Screenshot as the deliberate one-screen exception.

## 1. Portfolio / Home — observed

The recording shows a portfolio home that combines:
- total portfolio capital;
- total profit in money and percent;
- daily change;
- portfolio return/yield;
- passive-income yield and money amount;
- long-horizon / "through N years" goal/scenario entry;
- missing-event / corporate-action detection with add/delete and "add all";
- allocation donut;
- category-level table with current value / invested / result;
- individual assets with logos/tickers and current P/L;
- near-term events;
- future payouts / calendar entry;
- received-dividend history;
- goal/scenario chart;
- blog/community content.

Observed portfolio management actions:
- share portfolio;
- edit portfolio;
- clone portfolio;
- download deals;
- delete portfolio.

QVANIX implication:
- Home may remain more atmospheric, but the above investor questions need reachable functional homes.
- Missing corporate actions are especially important because incorrect events can corrupt analytics.

## 2. Income / payouts — observed

The recording shows:
- nearest payout events with date, issuer, amount/share and expected portfolio amount;
- future payouts;
- 12M future payout total;
- monthly average future payout;
- received-dividend total;
- received-dividend chart by month;
- selectable time window / aggregation;
- passive-income diversification by asset;
- dividend contribution by security;
- dedicated payout calendar;
- broad-market dividend calendar, not only current holdings;
- announced and forecast dividend events;
- record-close date;
- "buy before" date;
- issuer/ticker filters;
- market/universe filter (example: Russian MOEX shares).

QVANIX implication:
- current FACT vs schedule separation remains correct;
- dedicated Calendar must eventually expose date/status/provenance and drill-down;
- broad-market calendar is a separate discovery feature from the user's own portfolio-income calendar.

## 3. Portfolio analytics — observed

Snowball exposes multiple analytics subviews/tabs rather than one monolithic dashboard. In the recording these include:
- Growth;
- Metrics;
- Report;
- Bonds;
- Diversification;
- Dividends / income-oriented analysis.

Observed analytics:
- selectable benchmark (example: IMOEX);
- portfolio vs benchmark comparison;
- outperformance shown both in money and percent;
- quick periods: 7D, 1M, 3M, 6M, YTD, 1Y, 5Y, All;
- custom date selection;
- portfolio-value / benchmark chart;
- asset diversification donut;
- passive-income diversification;
- portfolio P/E;
- portfolio beta / volatility positioning relative to market;
- per-security/category breakdowns.

QVANIX implication:
- QVANIX already goes deeper on several deterministic risk metrics (TWR, XIRR, drawdown, volatility, Sharpe, Sortino, HHI/effective positions, benchmark excess, tracking error, IR, beta, correlation, VaR/CVaR, stress, allocation diagnostics).
- Those advanced metrics should be surfaced as progressive chapters rather than remaining hidden in technical depth.
- Fundamental portfolio metrics such as P/E require verified fundamental data and remain source-gated until that boundary is defensible.

## 4. Bonds — observed

Dedicated bond analytics show:
- current yield;
- yield to maturity;
- effective yield;
- "per deal" yield values;
- filter by category/asset;
- dedicated bond view inside Analytics.

QVANIX implication:
- current QVANIX bond diversification / maturity / issuer / coupon-type work remains valuable;
- YTM/effective yield must stay gated until nominal, cash-flow, amortization, clean/dirty price and call semantics are verified end-to-end;
- do not fake parity by displaying a broker field with unclear semantics.

## 5. Goals / scenarios — observed

The recording shows:
- a long-horizon goal/projection;
- current portfolio trajectory;
- an alternative scenario;
- target markers / target-date style visualization;
- scenario comparison on the same chart.

QVANIX implication:
- Goal Lab direction is confirmed;
- QVANIX should exceed this with explicit user-authored assumptions, inflation, contributions, indexation, payout yield, reinvestment and benchmark scenario;
- future paths remain scenarios, never promises.

## 6. Portfolio management / data hygiene — observed

Dedicated menu/workflows include:
- Assets;
- Operations;
- Payout calendar;
- My goal;
- Report;
- Currency;
- Categories;
- Corporate actions.

The app also detects missing portfolio events/corporate actions and prompts the user to add them.

QVANIX implication:
- operations history and event integrity deserve a first-class drill-down;
- category/currency views should be explicit dimensions rather than hidden chart filters only;
- corporate-action correctness should be treated as analytics data quality, not cosmetic metadata.

## 7. Rebalancing and portfolio tools — observed

Snowball Tools includes:
- Rebalancing;
- Top dividend stocks;
- Dividend payout calendar;
- Portfolio Laboratory;
- Search for "fallen" assets.

Observed Portfolio Laboratory positioning:
- create a strategy from scratch;
- copy from current portfolio;
- test on historical data;
- compare to a benchmark;
- calculate dividend yield;
- compare diversification;
- compare metrics.

QVANIX implication:
- risk-only allocation and explicit user-authored strategy scenarios already point in this direction;
- future backtesting must retain QVANIX look-ahead / survivorship / corporate-action controls before being called a backtest;
- no system-generated "best strategy" ranking or personalized trade recommendation.

## 8. "Fallen assets" / technical discovery — observed

The tool shown in the recording:
- compares current price to a moving-average reference;
- visible example: "average over 200 days";
- ranks / visualizes portfolio assets below the selected reference;
- has an option related to hiding assets without a target share;
- table view shows current price and distance vs moving averages.

QVANIX implication:
- accepted daily-OHLCV indicators already cover SMA/EMA/RSI/ATR/MACD/Bollinger/Stochastic;
- a similar discovery panel can be built deterministically from verified daily history;
- label it as market/technical diagnostics, not a buy signal.

## 9. Dividend-stock screener / discovery — observed

The recording shows:
- a list of dividend stocks;
- country;
- sector;
- sorting / expanded filters;
- larger result universe behind subscription tiers.

QVANIX implication:
- user-authored screener boundary already exists;
- Russian fundamental/dividend screeners need verified fundamentals/data rights;
- QVANIX should expose classical metrics and transparent filters rather than a black-box "best dividend stock" verdict.

## 10. Popular assets / social discovery — observed

Community/product-discovery features include:
- Community home;
- Public portfolios;
- Popular assets;
- Blog;
- popular stocks, bonds and ETFs;
- popularity expressed as share of users holding the asset.

QVANIX implication:
- this is part of Snowball's total product breadth but **not a current financial-core blocker**;
- social/public features remain after the private analytical terminal is strong;
- if implemented later, popularity must never be treated as investment quality.

## 11. Search / navigation / account — observed

The recording also shows:
- global search;
- favorites;
- quick add;
- portfolio navigation;
- account page;
- subscription management;
- private data;
- public profile;
- security;
- notifications;
- account deletion;
- privacy messaging.

QVANIX implication:
- authentication/account/privacy becomes relevant for the future multi-user product;
- secure read-only broker connection remains a core architectural requirement.

## 12. Priority comparison against current QVANIX

### Already equal/deeper in methodology
- TWR / XIRR / CAGR;
- drawdown;
- volatility;
- Sharpe / Sortino;
- benchmark coverage and excess-return diagnostics;
- tracking error / IR / beta / correlation;
- VaR / CVaR;
- correlation matrix;
- sourced stress scenarios;
- HHI / effective positions / top-N exposure;
- risk-only allocation diagnostics;
- explicit strategy-scenario comparison;
- deterministic technical indicators;
- current bond maturity / issuer / coupon / currency diversification;
- FACT vs scheduled income separation.

### Need stronger visible product surface
- portfolio operations/event history;
- full payout/calendar UX;
- broad-market dividend calendar;
- category and currency drill-down;
- corporate-action integrity workflow;
- richer report views;
- visible benchmark period controls;
- portfolio-level fundamental metrics once verified;
- bond yield/YTM/effective-yield layer once verified;
- technical "fallen assets" discovery;
- rebalancing workflow UI;
- Portfolio Laboratory / historical strategy comparison;
- richer Goal scenarios;
- user-facing screener UI.

### Later / non-core parity
- public portfolios;
- popularity rankings;
- community feed/blog integration;
- subscription/account/public-profile surfaces.

## Product interpretation

The recording reinforces an important distinction:

Snowball's strength is not one "killer dashboard". It is the **breadth of connected investor workflows**:
1. portfolio truth;
2. data hygiene / events;
3. income;
4. analytics;
5. bonds;
6. goals;
7. tools / rebalancing / laboratory;
8. discovery / screeners;
9. social/public layer;
10. account/subscription infrastructure.

QVANIX should not reproduce that information architecture literally. The target is to cover the same investor jobs while presenting them as shell-specific, progressively disclosed vertical chapters with stronger methodology transparency.
