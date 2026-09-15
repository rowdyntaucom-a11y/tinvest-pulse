# Living World — Arrival Micro-scenes v1

Date: 2026-09-15

## Why this pass

Ambient actors and semantic caravans are now in `main`, but a caravan reaching a destination still reads mostly as movement plus a generic arrival glow. The next useful layer is a small destination-specific visual grammar so semantic events feel like they actually affect the settlement without creating an economy simulation.

## Base

Fresh branch created directly from `main` at `379662e7cefd9ccfd9af0cda368e574562b5aaee`.

No commits were cherry-picked from stale PR #342. Its old implementation was used only as a design reference.

## What changed

Added pure `worldEventArrivalPresentation` policy.

It maps an already-resolved caravan destination to one restrained presentation-only micro-scene:

- `mine-yard` → `stockpile-drop`
- `workshop` → `repair-bench`
- `settlement-gate` → `message-handoff`
- `storehouse` → `treasury-unload`
- `construction-yard` → `construction-drop`
- `town-square` → `celebration-gathering`

Each result contains only renderer-safe presentation metadata: destination, activity, responder, accent colour and restrained emphasis.

## Data honesty / methodology

This boundary does not inspect:

- transaction amounts;
- portfolio value;
- returns;
- holdings;
- payout amounts;
- broker payloads;
- `expectedYield`;
- XP totals or reward magnitudes.

No financial formula or broker/data contract changed. No event is acknowledged or mutated.

## Architecture

`WorldEvent` semantic channel → caravan destination → arrival micro-scene presentation.

The arrival policy is intentionally independent from Pixi. This first pass does **not** change `WorldStage` or scene ownership. Renderer integration is a separate gated pass after this policy is green.

## Reduced motion

No new animation policy is introduced here. Existing caravan reduced-motion behavior remains canonical: semantic arrival remains visible while continuous movement is suppressed.

## Parallel Codex isolation

The parallel Codex Data Trust / Metric Drill-down work is untouched. This branch changes only Living World presentation policy, its existing regression test, and this checkpoint.

## Tests

Extended the existing `worldEventPresentation` regression suite to verify:

- all six semantic destinations map to the intended micro-scene;
- responder roles remain deterministic;
- emphasis stays bounded to `(0, 1]`;
- no amount/reward/XP fields leak into the arrival presentation;
- existing caravan and generic-event behavior remains unchanged.

## Release gates

Pending PR CI at checkpoint creation. Bundle/security/test thresholds must not be changed to obtain green status.

## Next gated pass

If CI is green, integrate these micro-scenes into the existing single Pixi ticker and existing scene layers. No new canvas, ticker, requestAnimationFrame owner, financial state, or event mutation should be introduced.
