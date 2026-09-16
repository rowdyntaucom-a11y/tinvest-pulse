# Samsung DNA fallback routing runtime recovery

## Factual base

- Base: `cd8b04813a1fe7023d8d3e8141e151d17f9163c1`.
- Fresh branch: `fix/dna-fallback-routing-runtime`.
- Real-device Samsung QA: the raised DNA action is visible but the Living World does not appear while the portfolio source is `LOCAL_FALLBACK`.

## Root cause

`App.tsx` currently evaluates portfolio `LOADING` / `FALLBACK` / `ERROR` and unconfirmed-empty gates before workspace rendering. A DNA navigation click can therefore update `tab` correctly while the broker-state panel continues to win the render branch.

This is a routing/data-boundary defect, not evidence that the DNA button needs smaller typography or another z-index pass.

## Required recovery

- DNA must remain a first-class workspace during broker `LOADING`, `FALLBACK`, and `ERROR`.
- Portfolio-dependent workspaces must keep their current fail-closed Data Trust behaviour.
- No fallback portfolio values may be promoted to confirmed financial facts inside DNA.
- Existing WorldState quality inputs remain the only financial-signal boundary for the renderer.
- No Pixi ownership/ticker/application changes.

## Regression

`v2/tests/dataStateUx.test.ts` now requires explicit DNA exemptions on the portfolio-state gates. The regression is intentionally red until the runtime branch is changed, preventing a documentation-only or CSS-only change from being mistaken for the Samsung fix.
