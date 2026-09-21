# QVANIX v3 — DNA renderer architecture guards

Date: 2026-09-21

## Why now
Real-device passes have reached the point where adding more Pixi primitives gives diminishing visual returns. Before authored hero/building assets grow, the renderer needs enforceable ownership and layer boundaries so art cannot recreate the duplicate-renderer problems from earlier Living World iterations.

## Changes
- Centralize Pixi Application creation in `dna/runtime/worldRoot.ts`.
- Move process-local single-renderer ownership into the v3 DNA runtime.
- Extract the canonical z-ordered DNA layer graph from the large stage component.
- Add a versioned performance-budget contract. Mobile DPR is capped at 1.35; target FPS / actor / particle numbers are budgets, not measured claims.
- Add full-suite architecture guards: exactly one `new Application()` under v3 DNA, no DNA imports from financial feature surfaces, duplicate runtime ownership fails closed, and performance caps stay explicit.
- Keep V3WorldStage as the current visual composition while reducing its responsibility for application/layer lifecycle.

## Deliberate boundary
This pass does not implement XP/event-ledger methodology and does not reorganize the whole monorepo into new packages. It adopts the audit's enforceable boundaries incrementally inside the working v3 architecture. Current LIVE visual output and reviewed-asset fallback behavior are intended to remain unchanged.

## Next
With renderer ownership guarded, authored hero/building/vegetation/lighting assets can be promoted into reviewed slots without creating a second world runtime.
