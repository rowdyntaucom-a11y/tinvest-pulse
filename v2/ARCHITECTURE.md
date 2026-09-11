# TInvest Pulse 2.0 — target architecture

This document turns the product concepts from the HADL / Intelinvest / Snowball analysis and the «Ладья» technical architecture into an implementation plan for TInvest Pulse.

## Product layers

### 1. Data layer

Goal: a broker-independent source of truth.

Planned modules:
- `users`
- `portfolios`
- `broker_connections`
- `transactions`
- `import_batches`
- `assets` / `instruments`
- `cash_flows`
- `market_snapshots`

Rules:
- T-Invest is adapter #1, not the domain model.
- Every imported operation keeps its source and raw payload for replay/reprocessing.
- Read-only broker credentials are encrypted on the backend and never returned to the client.
- Imports are batch-based and reversible.

### 2. Intelligence layer

The assistant operates on normalized portfolio data, not scraped UI state.

Capabilities:
- portfolio Q&A with exact figures;
- payment/coupon/dividend calendar answers;
- market-context retrieval;
- natural-language screeners;
- explanation of portfolio health and risk;
- import preview before any write.

The AI layer cannot silently trade or mutate financial records.

### 3. Analytics layer

Core analytics services:
- TWR;
- XIRR;
- CAGR;
- volatility;
- maximum drawdown;
- Sharpe ratio;
- concentration;
- allocation by asset class / issuer / sector / maturity / currency;
- passive-income history and forecast;
- benchmark comparison;
- later: ETF/fund look-through.

`Portfolio Health` is a composite presentation layer over these independently testable metrics, not a magic single formula embedded in UI code.

### 4. Action layer

Scenario engine instead of automatic trading advice:
- `REBALANCE` — redistribution inside the portfolio;
- `CONTRIBUTE` — where a new deposit changes target weights;
- `WITHDRAW` — how a withdrawal changes balance;
- tax / long-hold constraints can lock assets from a scenario.

Every scenario returns before/after weights and consequences. Execution stays outside the tracker unless a future regulated/explicit integration is designed separately.

### 5. Life-context layer

Optional modules, not required by the investment core:
- personal budget;
- financial goals;
- coverage of monthly expenses by passive income;
- business-finance module;
- public portfolios/community;
- adviser / B2B mode.

They must be switchable so the normal private investor UI stays compact.

## Runtime architecture

### Web / PWA

- React + TypeScript + Vite initially.
- Responsive component system shared by phone/tablet/desktop.
- PWA packaging after core screens stabilize.

### DNA WORLD

- PixiJS/WebGL isolated from financial UI.
- Fixed logical world coordinates (initially 1600x900).
- Renderer scales to viewport while preserving aspect ratio.
- One ticker only.
- Static scenery redraws only when the DNA level/world state changes.
- Motion budget is capped independently from world complexity.
- Offscreen/hidden tab => renderer stops.
- Asset atlases and level manifests replace generations of ad-hoc scripts.

### Backend evolution

Phase A: reuse the current working Node/T-Invest API.

Phase B: modularize into:
- Auth
- Portfolio
- Broker adapters
- Imports
- Market data
- Analytics
- AI gateway
- Billing (later)

Start as a modular monolith. Split services only when load/ownership justifies it.

### Persistence target

- PostgreSQL — source-of-truth financial data.
- Redis + BullMQ — broker sync, imports, market refresh, AI jobs.
- S3-compatible object storage — uploaded reports and generated reports.
- key-management service / vault — encryption keys for broker secrets.

## Performance gates

A v2 release cannot replace v1 until all are true:

- dashboard scrolling remains smooth on target Android hardware;
- DNA level 11 has comparable frame pacing to level 1;
- no hidden renderer/timer after DNA is closed;
- world renderer pauses in background tabs;
- mobile DPR is capped;
- scene complexity does not scale the number of animation loops;
- desktop keeps the same world proportions instead of stretching a phone layout.

## Migration order

1. v2 shell + DNA engine foundation.
2. Connect current live portfolio API.
3. Rebuild dashboard metrics and history chart.
4. Build analytics domain services and tests.
5. Replace preview DNA shapes with production asset pipeline and level manifests.
6. Add AI assistant over normalized API.
7. Introduce PostgreSQL model and broker-adapter boundary.
8. PWA installable release.
9. Mobile wrapper / React Native decision based on product needs, not before.

## Production rule

The existing v1 remains available until v2 is objectively better in data correctness, FPS, responsive layout and feature parity. v2 development must not mutate v1 production routes unless explicitly migrated.
