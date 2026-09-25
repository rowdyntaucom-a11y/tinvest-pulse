# QVANIX — Financial Core Sprint to Monday

Date: 2026-09-25
Status: ACTIVE STRATEGY / user-approved direction

## 1. Product priority

Until the Monday desktop review, QVANIX development is focused on the **financial product core**.

**DNA / Living World is frozen for an indefinite period.**
- Preserve the existing code and assets.
- Do not delete the feature.
- Do not spend active development time on world art, characters, XP, scenes, animation or gamification.
- The architecture must keep DNA isolated so it can be added back to an already mature financial product later without rewriting analytics, account or broker domains.

The product must first become a complete, clear investment analytics platform.

## 2. Monday review goal

Before Monday, prioritize:
- deterministic math;
- verified data boundaries;
- financial functions;
- widgets;
- tabs / module grouping;
- charts;
- portfolio and market tools;
- professional read-only analytics.

Do **not** spend the sprint trying to finalize visual widget placement on every breakpoint. Monday is the checkpoint for desktop composition, widget priority and final information hierarchy.

Samurai remains the reference shell. Shared financial engines stay shell-neutral. Other shells receive the finished capability set after the reference product architecture is accepted.

## 3. Information architecture rule

Snowball remains the breadth/usability benchmark, not the visual template.

QVANIX rule:
**simple entry → thematic workspace → professional depth**.

Do not show every deep tool as an equal permanent chapter.

Examples:
- Assets: Overview / Equities / Bonds / Operations.
- Analysis: Return / Risk / Structure / Market / Tools.
- Tools: Rebalance / Portfolio Lab / Drawdown discovery / Screener / Futures and later other professional modules.
- Income: Overview / Calendar / History / Sources / Market discovery.

Mobile shows one task at a time.
Tablet may use two columns.
Desktop becomes a real cockpit with persistent navigation, a central work surface and optional contextual detail.

The semantic path must remain the same across devices.

## 4. Multi-user product is mandatory

The current single T-Invest token is a development bridge only.

Target user flow:
1. registration / sign in;
2. create or choose portfolio;
3. connect broker through a read-only connection;
4. user supplies their own supported broker API credential where OAuth is unavailable;
5. backend validates permissions;
6. credential is encrypted server-side;
7. browser never receives or stores the broker secret;
8. broker sync produces normalized portfolio/account/operation/instrument data;
9. deterministic analytics consume normalized data;
10. user can revoke/rotate the connection.

Never put a broker API key in frontend source, browser localStorage, analytics telemetry or repository files.

## 5. No trading — hard product boundary

QVANIX is an analytics and decision-support product.

Allowed:
- portfolio analytics;
- market screeners;
- futures/derivatives analytics;
- options analytics when verified contracts/data exist;
- order-book / market-microstructure analytics when verified data exists;
- scalping-oriented analytical tools;
- user-authored WHAT IF scenarios;
- rebalancing diagnostics;
- alerts / watchlists;
- historical strategy comparison;
- risk diagnostics.

Not allowed as a product capability:
- submitting an order;
- editing/cancelling an order;
- automatic trading;
- copy trading;
- autonomous portfolio execution;
- broker credential scopes that are broader than required read-only access where a read-only scope is available.

UI and backend architecture must not grow an order-entry path accidentally.

## 6. Instrument / tool breadth target

QVANIX should be able to grow beyond a long-term portfolio tracker while keeping analytical integrity.

### Portfolio instruments
- equities;
- bonds / OFZ / corporates;
- funds / ETFs where supported;
- currencies;
- cash;
- futures;
- options when data/specification coverage is verified;
- later manual/off-market assets under a separate data model.

### Professional market tools
- MOEX screener;
- dividend / payout discovery;
- bond yield / duration / cash-flow analytics;
- futures notional / leverage / basis / scenario P&L;
- options Greeks / payoff / implied-volatility analytics only after a verified market/specification boundary exists;
- order-book / spread / liquidity / turnover diagnostics only with a reliable source;
- scalping/microstructure analytics as observation tools, never an execution terminal;
- technical discovery;
- strategy laboratory / historical comparison;
- rebalance drift and user-authored scenarios.

Missing source data remains missing. QVANIX does not fill holes with invented market values.

## 7. Math rules

All financial math is deterministic and versioned.

- TWR for cash-flow-neutral portfolio performance.
- XIRR/MWR for investor money-weighted experience.
- CAGR only when mathematically appropriate.
- HHI / effective positions for concentration.
- Sharpe + Sortino + drawdown / recovery.
- VaR/CVaR only with visible assumptions and sufficient history.
- Futures scenario P/L is based on explicit contract specification inputs; no liquidation or margin-call estimate without broker/exchange rules.
- Futures basis is descriptive; annualized basis is not a forecast.
- Rebalance tools show target drift and scenario deltas, not buy/sell instructions.
- Forward-looking simulations are always labelled scenarios.

## 8. Responsive product requirement

Phone, tablet and PC are equally valid QVANIX environments.

- Phone: progressive disclosure, one main task at a time.
- Tablet / small laptop: two-column working layout where useful.
- Desktop: persistent primary navigation + current-workspace navigation + central analysis area + optional context/detail panel.
- Do not stretch mobile cards across a monitor.
- Do not create separate information architectures for mobile and desktop.
- Dense tables and charts may use desktop space; mobile gets an adapted representation of the same tool.

## 9. Current sprint implementation sequence

1. Save this direction in canonical context.
2. Reduce permanent deep navigation by grouping professional tools.
3. Add deterministic read-only derivatives foundation (futures first).
4. Continue missing Snowball-parity financial engines and discovery modules.
5. Improve graph contracts / period selection / source coverage.
6. Build module registry / ownership rules so Monday composition can move widgets without duplicating calculations.
7. Keep registration / broker-connection security architecture ready for the multi-user phase.
8. Monday: desktop + mobile composition review, widget priority, then cross-shell transfer.

## 10. Definition of success

By Monday the question should no longer be “what functions are missing?” but primarily:
- where should each function live;
- what belongs above the fold;
- what is mobile vs desktop presentation;
- which widgets deserve permanent visibility;
- how each shell expresses the same shared capabilities.

The financial core should remain usable even if DNA is never enabled.
