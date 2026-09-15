# QVANIX Living World — work chain + semantic arrivals v1 — 2026-09-15

## Context

Continuation of draft PR #342 while the separate Codex UX task is rate-limited. This pass remains isolated from financial methodology, broker/API contracts and the information-architecture branch.

The goal is to make the world read as a place where work and already-resolved semantic events happen, without inventing an economy or interpreting raw portfolio data inside Pixi.

## Primary work chain choreography

`worldLivingPresentation.ts` is now version `0.2`.

The first miner → hauler → builder trio now shares one deterministic pace with deliberately staggered phase offsets. Their existing routes already overlap spatially near the mine hand-off and construction yard, so the scene now reads as a restrained visual chain:

`extraction → delivery → construction`

This is presentation choreography only. It does **not** model inventory, production output, RUB value, capital, rewards, XP generation or financial performance.

Secondary workers remain independently phased so the settlement does not look mechanically synchronized.

## Semantic caravan destinations

`worldEventCaravanPresentation.ts` is now version `0.2`.

Already-semantic pending events now receive a presentation-only destination:

- discipline / supply → mine yard;
- health / repair → workshop;
- performance / courier → settlement gate;
- passive-income semantic event / treasury → storehouse;
- strategy / builder → construction yard;
- achievement / celebration → town square;
- unknown future semantic kind → generic courier to settlement gate.

Direction is deterministic from event identity. The visible roster remains hard-capped at 3.

No transaction amount, portfolio value, return, broker operation, raw cashflow or XP total is read by this mapping.

## Arrival choreography

Added a pure deterministic journey resolver:

`approach → dwell → depart`

The deferred Pixi caravan runtime is now version `0.2` and uses that journey. Caravans enter from a deterministic edge, pause at their semantic destination long enough to be readable, show a restrained arrival pulse/unload gesture, and then leave.

With `prefers-reduced-motion`, a caravan is kept stationary at its destination instead of being hidden or animated across the scene.

The runtime still never acknowledges events, mutates `WorldState`, creates XP or interprets finance data.

## Regression and CI

Updated regressions lock:

- Living presentation contract `0.2`;
- primary miner/hauler/builder route order;
- common work-chain pace and deterministic phase offsets;
- event destination mapping;
- deterministic event direction;
- approach/dwell/depart journey semantics;
- reduced-motion freeze at semantic destination;
- malformed journey phase fails closed;
- event roster cap and source immutability remain intact.

Code-bearing head `ca3a2133cf4d73cad30dfe7e19336130660c0837` passed **v2 build CI #640** completely:

- dependency security gates: success;
- TypeScript + Vite production build: success;
- full `test:core`: success;
- Living World runtime-state regression: success;
- asset-history regression: success;
- payout/server/production syntax checks: success;
- production runtime/API regression suite: success.

No compiler flag, bundle/security threshold, financial formula, API contract, credential behavior or XP methodology was weakened.

## Still intentionally gated

- final reviewed production actor/environment/event art;
- persistent resource/inventory/economy simulation;
- sound design;
- raw broker operation → world-event interpretation beyond approved semantic events;
- any visual mapping that would infer financial meaning inside the renderer.

PR #342 remains draft. The next safe world pass can deepen settlement micro-behavior and destination activity while preserving the same single-runtime and presentation-only boundaries.
