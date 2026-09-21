# QVANIX v3 — mobile data-trust disclosure

Date: 2026-09-21

## Why this pass
The canonical trust chip had evolved from a passive status badge into an expandable evidence control, but an older CSS rule still left `pointer-events:none` on it. On touch devices that made the visible disclosure affordance non-interactive. The fixed evidence panel also needed a mobile presentation that did not visually merge with the workspace underneath.

## Changes
- Restore pointer interaction on the canonical data-state button.
- Add a descriptive accessible label reflecting open/closed state.
- Add explicit backdrop dismissal and Escape dismissal.
- Present trust evidence as a bounded bottom sheet on narrow phones above persistent navigation.
- Bound/contain panel scrolling so deep evidence does not take ownership of the workspace scroll.
- Keep source, coverage, age, source/fetch timestamp, reasons and manual refresh intact.
- Preserve all LIVE/PARTIAL/STALE/FALLBACK/ERROR/UNAVAILABLE semantics and fail-closed financial gates.

No financial methodology, trust classification, freshness threshold or broker contract changed.
