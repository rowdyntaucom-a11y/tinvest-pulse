# QVANIX Light Core Analytics Depth v25 — 2026-09-29

## Scope
Second tranche of the large light-Core financial-depth pass. This builds on the promoted portfolio / market / tools workspaces from v24 and closes the biggest remaining shallow area: Analytics.

## Product changes
- Analytics gains a fourth **Глубина** mode while keeping the fast concentration / breadth / quick-risk first answers.
- New CoreAnalyticsDepth composes the canonical shared financial engines without shell-specific Samurai/Cosmos/Nord chrome:
  - TWR, volatility, Sharpe, Sortino and rolling windows;
  - max drawdown, historical VaR/CVaR and downside frequency;
  - current risk contribution and pairwise correlations from verified asset history;
  - effective risk/capital contributor counts and diversification ratio;
  - portfolio vs IMOEX, excess return, tracking error, information ratio, beta and correlation.
- Risk-free rate, source date and next rate meeting now flow from the trusted portfolio snapshot into the light Core analytics contract.
- Benchmark window selection reuses the canonical history-window model.
- Heavy analytics depth is lazy-loaded and prefetched only after trusted first paint.
- Deep analytics keeps asset drill-down where exact identity exists.
- Mobile typography overrides remove the old 7px analytical microtype from risk/correlation rows.

## Income depth added in the same product tranche
- Income gets a third **Глубина** mode while retaining the compact overview and fast calendar.
- Full canonical income workspace is reused:
  - trusted 12M payout schedule;
  - realized FACT/NET monthly history;
  - income stability and quality;
  - source concentration and exact-FIGI source rows;
  - bond schedule linkage and 12M bond cash-flow profile;
  - separate market TTM dividend discovery.
- Dividend discovery is explicitly available in the light Core and remains separate from current-portfolio income.
- Deep income chunk is prefetched only after trusted first paint.
- Old dark material and 6.5–7px mobile labels are overridden with the light Core material and 9px+ mobile information floors.

## Review hardening carried from v24
- Promoted Market Intelligence owns bounded automatic recovery (2.5s / 6s) plus explicit manual retry.
- Mobile screener/discovery identity and financial context are raised to readable 9–11px floors.
- The stale v24 review threads are addressed on fresh main rather than reopening the already-merged branch.

## Guardrails
- No order creation or trade execution.
- VaR/CVaR, beta, correlation, excess return and futures scenarios are descriptive/WHAT IF, never recommendations.
- Missing or conflicting history fails closed.
- No fabricated benchmark, fundamentals or risk values.
- No frontend credential storage.
- Live World / DNA untouched.
