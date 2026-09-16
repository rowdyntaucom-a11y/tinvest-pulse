# QVANIX — DNA mobile touch recovery

Date: 2026-09-16

## Context
Real-device Samsung QA confirmed that the visible DNA / Living World action did not respond to touch. The earlier PR #380 was based on pre-Data-Trust main and became non-mergeable after Data Trust recovery merged.

## Factual base
This clean recovery branch starts from factual main `cd8b04813a1fe7023d8d3e8141e151d17f9163c1`. No stale branch history was rebased or broad-cherry-picked.

## Fix
- Keep the five ordinary destinations in the readable bottom rail instead of shrinking six labels into microtype.
- Keep DNA as a first-class explicit action above the rail, with a 72x48px minimum touch target.
- Give the DNA action an explicit hit-test layer (`z-index`, `pointer-events:auto`, `touch-action:manipulation`).
- Move personalization control to the opposite side on portrait mobile so it cannot compete with the DNA hit target.
- Preserve a six-row touch-safe landscape rail where space is vertical.
- Preserve safe-area padding and page content clearance.

## Scope
Presentation CSS only plus this checkpoint. No financial formulas, Data Trust policy, broker/API, Living World runtime, Pixi ownership/ticker/loading, Metric Drill-down, or v1 changes.

## Release gate
Run the full PR v2 workflow. Merge only after current-main race-check and green CI, then verify Render before asking for Samsung device QA.
