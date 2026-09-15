# Living World — Arrival Renderer Integration v1

Date: 2026-09-15

## Purpose

The previous Living World pass established a pure destination-to-micro-scene policy for semantic caravans. This pass connects that reviewed policy to the active v2 Pixi world so arrivals read as small local actions instead of a generic glow.

## Base / parallel isolation

Fresh branch `chatgpt/living-world-arrival-renderer-v1` was created directly from current `main` at `4af7e92114f0fe812966a4c64258cf3a46ff74ef`.

The parallel Codex Data Trust clean-recovery task is intentionally isolated. This pass changes only Living World renderer/presentation regression files plus this checkpoint. No portfolio/API/Data Trust/Metric Drill-down/navigation files are changed.

## What changed

- Added pure `worldEventArrivalMotion` policy for arrival visibility/emphasis/motion.
- `WorldStage` now renders destination-specific arrival cues already defined by `worldEventArrivalPresentation`:
  - mine yard → stockpile unloading;
  - workshop → repair bench;
  - construction yard → material drop;
  - storehouse → treasury unloading;
  - settlement gate → message handoff;
  - town square → celebration gathering.
- A small responder silhouette is paired with the local cue so an arrival reads as an interaction rather than a marker.
- Arrival scenes are visible only during caravan `dwell`.
- `prefers-reduced-motion` keeps the semantic scene visible and static at the destination.

## Runtime ownership

No new canvas, Pixi `Application`, ticker, `requestAnimationFrame`, observer or state owner was introduced.

Canonical rule remains:

**ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.**

All arrival motion is evaluated inside the existing world ticker.

## Data honesty

The renderer receives only already-resolved semantic caravan plans and the existing presentation policy. It does not read transaction amounts, portfolio values, returns, holdings, payout amounts, broker fields, `expectedYield`, XP totals or reward magnitudes. No event is acknowledged or mutated.

## Regression coverage

The existing `worldEventPresentation` regression now also verifies:

- no arrival scene outside dwell;
- deterministic static reduced-motion output;
- bounded animated alpha/scale/offset/rotation;
- deterministic output for identical inputs.

## Visual status

This remains procedural fallback rendering, not the final production-art target. It improves semantic life and choreography while preserving the reviewed asset pipeline for future production sprites/materials.

## Release gates

Pending PR CI at checkpoint creation. Do not weaken bundle/security/test budgets to obtain green. Before merge, verify clean diff against latest `main` and confirm no parallel Codex files entered the branch.
