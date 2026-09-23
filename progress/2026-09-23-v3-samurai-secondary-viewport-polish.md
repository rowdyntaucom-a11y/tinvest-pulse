# 2026-09-23 — Samurai secondary viewport polish

Source: Samsung recording `1000031412.mp4`.

## What the recording confirmed

- The Home cinematic scene and its Analytics floor are now in a good direction.
- The Assets → Analysis → Income → Goal transitions no longer show the old disruptive black transit flash.
- The remaining visible issue is vertical efficiency on secondary chapters: fail-closed pages still stack a 48px global Samurai topbar + their own full 100dvh canvas, which creates browser-level overflow/scroll indicators.
- Assets / Analysis / Income also repeat chapter identity twice: once in `SamuraiWorkspaceChrome` and again inside the authored trust gate.
- The duplicated strip costs atmosphere and vertical space without adding information.

## Patch

- Secondary fail-closed Samurai pages now occupy `calc(100dvh - 48px)`, i.e. the viewport remaining below the sticky topbar.
- Hide the redundant workspace chapter strip on untrusted Assets / Analysis / Income.
- Let the authored trust gate become the single chapter header and give the recovered space to the formation/radar/ledger instruments.
- Strengthen the small top data-state chip enough to remain readable against the world.
- Apply the same outer-viewport correction to the empty Goal path using `:has(.sam-goal-empty-path)`; once a target exists, Goal reverts to its normal scrollable content behavior.
- Fixed bottom navigation remains unchanged.

No finance, API, trust, goal math, navigation destinations or DNA logic changed.
