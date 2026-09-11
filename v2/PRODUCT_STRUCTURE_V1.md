# TInvest Pulse 2.0 — Product Structure v1

This file defines the non-duplicating information architecture for the v2 UI before the DNA WORLD rebuild.

## Navigation

1. **ПОРТФЕЛЬ** — what is owned now: capital, monetary result, positions, weights and asset-class composition.
2. **АНАЛИТИКА** — how the portfolio behaves: TWR/benchmark, XIRR, drawdown, volatility, Sharpe, Sortino, HHI, transparent Health Score and target-allocation drift.
3. **ДОХОД** — dividends/coupons only: received passive income, confirmed payout calendar, sources and Yield on Cost where a real cost basis exists.
4. **DNA** — gamification/world state. No RUB thresholds. Future level comes from cumulative XP, while weather/state comes from analytics.

The AI tab is intentionally removed from launch navigation until monetization supports LLM costs.

## No-duplication rule

A metric has one primary home. Other screens may link to it, but do not repeat the same full widget.

- Capital / monetary P&L -> Portfolio
- TWR / XIRR / risk / diversification / Health / drift -> Analytics
- Dividends / coupons / income calendar / YoC -> Income
- XP / level / biome / weather / achievements -> DNA

## Calculation rules

- TWR comes only from the time-weighted history index and is the benchmark-comparable return.
- XIRR is money-weighted and comes from dated external cash flows; it is not interchangeable with TWR.
- CAGR is not used for the whole portfolio while external cash flows exist.
- Volatility uses daily TWR-index returns and annualizes with sqrt(252).
- Max Drawdown uses running peaks of the TWR index.
- Sharpe uses the current available CBR key rate as RUB risk-free input when available; otherwise it is marked unavailable rather than invented.
- Sortino uses downside deviation versus the daily minimum acceptable return derived from the risk-free rate.
- HHI is sum(weight^2) over positive current portfolio weights; effective position count = 1/HHI.
- Health Score is transparent and versioned. v1 follows the accepted weighted model: diversification 25%, drawdown 20%, volatility 20%, asset-class diversity 15%, Sharpe 20%. Every component is shown separately.
- When history is shorter than 12 months, UI must state the actual available period; it must not pretend a 12-month window exists.
- IMOEX is normalized to the same base-100 start as portfolio TWR; benchmark coverage/integrity is explicit rather than silently interpolated from invented prices.
- Drift v1 compares actual asset-class weights with a configured strategy. Current personal strategy is 50% equities / 50% bonds. A diagnostic breach is raised at absolute deviation >= 5 percentage points or relative deviation >= 20%. Drift is a strategy-check trigger, not a buy/sell command.
- YoC 12M uses only confirmed gross payouts divided by the cost basis of the current position (average acquisition price x current quantity). Payout growth remains unavailable until two comparable annual periods exist; short history is never annualized into a fake growth rate.

## Build order

1. Product shell + navigation + one home for every metric. **Done for current MVP shell.**
2. Correct analytics engine and explainable widgets. **Core metrics + IMOEX + drift v1 implemented.**
3. Passive-income module and payout calendar. **Calendar, sources and YoC v1 implemented; payout growth waits for sufficient history.**
4. Rebalancing/targets/Monte Carlo. **Drift/targets v1 done; next is explicit Monte Carlo scenario inputs and bootstrap engine.**
5. XP engine and world-state API.
6. DNA WORLD rebuild in PixiJS with events, layers, biomes and weather.
