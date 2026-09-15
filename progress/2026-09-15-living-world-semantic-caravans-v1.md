# Living World — Semantic Caravans v1

Date: 2026-09-15
Branch: `chatgpt/living-world-semantic-caravans-v1`
Base: `23d89bfc2c6ad26a88dda98f7e6c758f1507c6cc` (`main` after Ambient Activity v1)

## Why this pass exists

Atmosphere and ambient workers now make Living World feel inhabited, but semantic pending DNA events still have no dedicated visual planning boundary. The next safe step is to turn already-resolved `WorldEvent` meaning into a tiny deterministic procession plan without reading raw financial values or mutating event state.

The old draft PR #342 contains a much broader event-caravan implementation, but it is stale/conflicted and was not cherry-picked or revived. This pass is rebuilt from current `main` and deliberately limits scope to the pure semantic presentation policy plus regression coverage.

## What changed

- Added `worldEventCaravanPresentation.ts`.
- Reused the canonical `buildWorldEventPresentation(...)` mapping instead of defining a second event-kind taxonomy.
- Capped visible semantic caravans at 2 so a backlog of pending events cannot flood the world.
- Deterministically maps presentation channels to destinations:
  - discipline → mine yard;
  - health → workshop;
  - performance → settlement gate;
  - income → storehouse;
  - strategy → construction yard;
  - achievement → town square;
  - unknown/future → generic settlement gate.
- Event id is used only as a stable visual seed for direction and phase offset.
- Added deterministic `approach → dwell → depart` journey policy.
- Reduced motion resolves directly to a stationary arrival/dwell state rather than hiding the semantic signal.
- Extended the existing `worldEventPresentation` regression test; no new test runner or package script was required.

## Deliberately not integrated yet

This pass does not yet attach caravan graphics to `WorldStage`. Renderer integration is intentionally kept as the next isolated visual pass so the semantic policy can be reviewed and gated independently first.

No new scene layer is added. When renderer integration lands, it must reuse the existing `logistics` / `effects` ownership and the single existing Pixi ticker.

## Data honesty

The caravan plan consumes only already-semantic pending `WorldEvent` objects.

It does not inspect or expose:
- transaction amounts;
- portfolio value;
- TWR/XIRR/returns;
- holdings;
- payout amounts;
- broker fields;
- XP totals;
- expectedYield;
- recommendations.

The policy never acknowledges, mutates or removes pending events.

## Parallel Codex boundary

Codex is working in parallel on Metric Drill-down + Explainability. This pass does not touch Board, analytics, ContextHelp, metric cards, navigation, Asset Workspace, Pulse, broker/API code or finance methodology.

## Review passes

QUANT
- no finance calculations or data contracts changed;
- no raw amount/value enters the caravan plan;
- no daily metrics or forecasts.

CODE
- canonical semantic event mapping reused;
- deterministic capped output;
- unknown event kinds fail safely to `generic`;
- no duplicate permanent event owner.

MOBILE
- no DOM/layout change in this policy-only pass;
- reduced-motion behavior is explicitly deterministic for future renderer integration.

RELEASE
- branch created from fresh main after Ambient Activity v1;
- no binary artifacts;
- no bundle-budget change;
- no stale #342 history reused;
- no Codex files touched.

## Verification target

Before merge:
- TypeScript/Vite build;
- full `test:core` including updated semantic-event regression;
- dependency/security gates;
- Living World runtime-state regression;
- production/API workflow checks;
- bundle budgets unchanged;
- clean diff against current `main`.
