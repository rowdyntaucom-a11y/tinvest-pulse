# Living World — Settlement Rhythm v1

Date: 2026-09-15

## Purpose

The settlement already had time-of-day atmosphere and ambient inhabitants, but actor cadence remained almost uniform apart from one global activity multiplier. This pass makes the same population feel different across dawn, day, sunset and night using only the existing actor presentation model.

## Base / isolation

Fresh branch from `main` at `d82aa644a16824eece59c8679fa882b5daf8e342`.

Parallel Codex Data Trust work remains isolated. No Data Trust, API, portfolio, navigation, financial-core, DNA-state or broker files are changed.

## What changed

- Added deterministic role cadence multipliers per time phase.
- The primary miner/hauler/builder trio always receives the same phase multiplier, preserving the reviewed extraction → delivery → construction synchronization.
- Residents are visually more active around sunset and restrained at night.
- Keepers remain comparatively present into sunset/night without introducing a new shift/economy state.
- Existing inhabitants are never removed solely because of time of day; rhythm changes cadence, not population truth.
- Existing weather activity scaling remains the outer multiplier.
- Cart density is restrained to one visible cart at night or during an explicitly reviewed storm; this is presentation density only, not production throughput.

## Data honesty

This pass does not model or imply:

- working hours;
- productivity;
- production capacity;
- inventory;
- capital flows;
- portfolio performance;
- broker state;
- rewards or XP amounts.

Time phase and weather are already-resolved Living World inputs.

## Runtime / performance

No change to Pixi application ownership, ticker count, canvas count, scene layers, deferred Pixi loading or asset pipeline. The renderer already consumes actor `pace`, `activityScale` and `cartCount`, so the pass is visible without adding runtime machinery.

## Regression coverage

Extended the existing `worldAmbientActivity.test.ts` to verify:

- primary trio remains synchronized under sunset cadence;
- resident cadence rises at sunset and is restrained at night;
- night/storm cart density is bounded;
- time-of-day cadence does not remove inhabitants;
- weather continues to reduce global activity scale;
- no financial/inventory/reward fields enter actor presentation.

## Release gate

Before merge: confirm clean diff against latest `main`, run full PR-triggered security/build/test/runtime/API gates, and keep existing bundle/security/test budgets unchanged.
