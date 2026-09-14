# QVANIX · daily movers data-boundary audit

Date: 2026-09-14
Starting main: `eb7f192073a4b2704bae300c9885f08659f23d9c`

## Why this audit

The current visualization priority includes truthful daily movers only if QVANIX has a genuine daily-change source. This audit checks the current normalized Portfolio boundary before any movers UI is built.

## Finding

`v2/src/lib/portfolioApi.ts` normalizes each current position with:
- current price;
- current value;
- average acquisition price / cost basis;
- broker `expectedYield`;
- portfolio weight;
- verified identity and bond metadata.

It does **not** expose a verified daily absolute or daily percentage change for each current position.

The existing `expectedYield` field is cumulative broker unrealized P/L relative to acquisition basis. It is not a one-day market move and must never be labelled or styled as `за день`, `daily mover`, `today gain/loss`, or equivalent.

The portfolio-history series is portfolio-level. The existing `/api/asset-history` boundary is designed for selected/top-position historical analytics and does not currently provide a normalized all-current-position daily-change field suitable for a complete movers list.

## Product decision

Daily movers remain **GATED** for the current shell.

Do not implement them by:
- relabelling cumulative `expectedYield`;
- comparing acquisition price with current price;
- using incomplete top-N asset-history coverage as if it covered the whole portfolio;
- inventing a previous close from missing data.

A future movers pass may proceed only after a deterministic boundary exposes, for every eligible current position:
1. stable instrument identity;
2. current/last market price with timestamp/source;
3. verified previous-session close or an explicitly defined official daily-change field;
4. common trading-date semantics and stale/missing state;
5. coverage across the displayed universe.

## Release impact

Documentation/data-honesty audit only. No runtime, broker route, financial formula, UI, dependency, legal/payment, DNA or trading behavior change.

## Next visualization priority

Proceed to deterministic narrative/presentation for already-calculated Portfolio-vs-IMOEX facts, or richer period/drill-down charting where the historical series is already trustworthy. Keep daily movers blocked until the boundary above exists.
