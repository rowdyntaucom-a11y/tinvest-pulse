# QVANIX Living World — semantic arrival micro-scenes v1 — 2026-09-15

## Context

Continuation of draft PR #342 while the separate Codex UX task remains rate-limited. This pass deepens destination activity without changing financial methodology, broker/API contracts, XP calculation or the single-runtime architecture.

The previous pass already gave semantic event caravans deterministic destinations and an `approach → dwell → depart` journey. This pass makes the dwell phase read as an actual local event rather than a stopped wagon.

## Semantic arrival presentation

Added `worldEventArrivalPresentation.ts`.

It maps only an already-resolved caravan destination into a tiny presentation-only micro-scene:

- mine yard → stockpile drop / worker response;
- workshop → repair bench / keeper response;
- construction yard → material drop / builder response;
- storehouse → treasury unload / keeper response;
- settlement gate → message handoff / resident response;
- town square → celebration gathering / resident response.

The boundary receives only a `WorldEventCaravanPlan`. It never reads transaction amounts, portfolio value, broker operations, returns, raw cashflows, XP totals or reward values.

## Deferred Pixi runtime

`worldEventCaravanRuntime.ts` is now version `0.3`.

During the `dwell` segment the caravan now exposes a restrained destination-specific micro-scene next to the wagon. The existing arrival pulse remains, but the user can also visually distinguish unloading supplies, repairing, delivering building material, treasury unloading, message handoff and celebration.

The micro-scene is deliberately small and procedural. It is a runtime/fallback grammar, not final production art.

Reduced-motion behavior remains fail-safe: the caravan and its arrival micro-scene stay visible at the semantic destination without continuous bobbing or rotation.

The runtime still:

- never acknowledges events;
- never mutates `WorldState`;
- never creates XP;
- never interprets raw financial values;
- remains inside the single deferred Pixi owner/ticker.

## Regression / CI

Added `worldEventArrivalPresentation.test.ts` and registered it in `test:core`.

The regression locks:

- all six semantic destinations have explicit micro-scene mappings;
- destination identity is preserved;
- responder roles are deterministic;
- visual intensity remains bounded;
- no fallback destination silently maps to an unrelated activity.

Code-bearing head `664b1216f0f963c40b0613e4f69dce0ad3a7d2e3` passed **v2 build CI #645** completely:

- dependency security gates: success;
- TypeScript + Vite production build: success;
- full `test:core`: success, including the new arrival presentation regression;
- Living World runtime-state regression: success;
- asset-history regression: success;
- payout/server/production syntax checks: success;
- production runtime/API regression suite: success.

No compiler flag, bundle/security threshold, financial formula, API contract, credential behavior or XP methodology was weakened.

## Still intentionally gated

- final reviewed actor/environment/event art;
- persistent resource/inventory/economy simulation;
- sound design;
- raw broker-operation → world-event interpretation beyond approved semantic events;
- any visual rule that would infer financial meaning inside the renderer.

PR #342 remains draft and isolated from the Codex UX branch.
