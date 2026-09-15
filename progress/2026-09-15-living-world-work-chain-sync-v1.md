# Living World — Work-chain synchronization v1

Date: 2026-09-15

## Purpose

The ambient settlement already had miners, haulers and builders, but their fallback loops used independent clocks. That made the scene feel active without clearly reading as one coherent visual process.

This pass synchronizes only the primary fallback trio so the initial and continuing motion reads as:

**extraction → delivery → construction**

It remains presentation-only. No production, inventory, money, portfolio values, rewards or XP amounts are modelled.

## Base / isolation

The branch was created from current `main` after the reviewed arrival-renderer and work-chain choreography policy were merged.

Parallel Codex Data Trust recovery is isolated. This pass touches only Living World presentation policy, its regression test, v2 test registration and this checkpoint.

No API, portfolio, analytics, navigation, Data Trust, broker or financial methodology files are changed.

## What changed

- Exposed one shared visual pace for the primary miner/hauler/builder trio.
- Exposed deterministic semantic phase anchors:
  - miner starts in its extraction/work phase;
  - hauler starts in its carry/delivery phase;
  - builder starts in its construction/work phase.
- `buildWorldAmbientActivityPresentation` applies those timing anchors only to the primary `*-a` trio.
- Secondary actors keep their independent timings, preserving ambient variety at higher world levels.
- Existing weather/time activity scaling remains unchanged and still slows visible motion during rain/storm/night without affecting DNA progression.

## Data honesty

The work-chain is a visual grammar only.

It does **not** introduce:

- inventory;
- resource quantities;
- production throughput;
- money/capital mapping;
- portfolio-value mapping;
- rewards;
- XP magnitude mapping;
- broker fields.

## Reduced motion

The existing choreography policy still sets continuous motion scale to zero for idle/work poses under reduced motion. This pass does not add a second animation owner, canvas, ticker or requestAnimationFrame.

## Runtime ownership

Canonical rule remains:

**ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.**

This pass does not modify `WorldStage` runtime ownership.

## Regression coverage

New `worldAmbientActivity.test.ts` verifies:

- primary trio shares one pace;
- semantic phase anchors resolve to miner=work, hauler=carry, builder=work;
- secondary trio keeps independent timing;
- rain/storm only reduce activity scale;
- actor presentation does not expose amount/inventory/portfolio/reward fields.

The regression is registered in `test:core`.

## Release gate

Before merge:

- compare against latest `main`;
- confirm only Living World/test/checkpoint files are present;
- run PR-triggered full v2 build, security gates, `test:core`, Living World runtime-state regression and production/API checks;
- do not raise bundle/security/test limits.
