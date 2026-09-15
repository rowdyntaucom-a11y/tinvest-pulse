# Living World — Work-chain Choreography Policy v1

Date: 2026-09-15

## Purpose

After ambient residents, carts, semantic caravans and destination arrival micro-scenes landed, the next gap is actor meaning: the procedural fallback inhabitants still move mostly as generic silhouettes. This pass defines a deterministic visual grammar for the approved Living World work cycle:

**ДОБЫЧА → ДОСТАВКА → СТРОЙКА**

It is policy-only. Renderer integration is intentionally deferred to the next gated pass.

## Base / parallel isolation

Fresh branch `chatgpt/living-world-work-chain-policy-v1` was created directly from `main` at `455de050b4fd0fdaae791c48585d5ee18300a5f1`.

The parallel Codex Data Trust clean-recovery task is not touched. No API, portfolio, analytics, navigation, Data Trust, Metric Drill-down or shared app files are changed.

## What changed

Added `worldAmbientActorChoreography` with four presentation-only actions:

- `idle`
- `walk`
- `carry`
- `work`

Role grammar:

- miner works at the mine endpoint and walks the route between work zones;
- hauler carries a visible load on the outbound delivery leg and returns without load;
- builder works around the construction endpoint;
- keeper alternates yard work and restrained idle/walk phases;
- resident pauses at route endpoints and otherwise walks.

The output exposes only renderer-safe action metadata: action, local action progress, load/work cue visibility and a locomotion scale.

## Reduced motion

Reduced-motion keeps the semantic action/pose but forces `motionScale` to zero. This lets the renderer show that a hauler is carrying or a worker is working without continuous locomotion.

## Data honesty

This choreography does not model or read:

- inventory;
- production output;
- capital;
- transaction values;
- portfolio values;
- rewards;
- XP amounts;
- broker/API fields.

It does not mutate WorldState and does not acknowledge events.

## Regression coverage

The existing Living World presentation regression now verifies:

- miner work vs walk phases;
- hauler outbound carry vs return walk;
- builder work phase;
- reduced-motion semantic pose with zero locomotion;
- deterministic output for identical inputs;
- bounded action progress;
- no amount/inventory/reward/XP fields in the policy output.

## Next gated pass

If CI is green, connect this choreography to the active single Pixi ticker so procedural actors gain work sparks, carried loads and role-specific pauses without creating another runtime or simulation model.

## Release gates

Pending PR CI at checkpoint creation. Bundle, security and test thresholds must not be weakened.
