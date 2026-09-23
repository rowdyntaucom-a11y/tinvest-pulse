# QVANIX v3 — reviewed theme infrastructure integration

Date: 2026-09-23
Base: `5231c1f951b03f2f14f768218b48157231194a1b` (#573).

Codex PR #575 was reviewed but not merged because it was conflict-dirty and its cleanup dropped the shell material boundary for deep Analytics cards. The useful infrastructure work was replayed onto a fresh branch from canonical main instead.

## Integrated
- final responsive/performance owner in `mobilePerformance.css`;
- workspace material tokens consolidated into `workspaceWorldFinish.css`;
- obsolete duplicate workspace material generation removed from `shellWorlds.css`;
- final cascade ownership regression guard;
- no-blur/mobile overflow/touch safeguards consolidated;
- existing #573 shell composition remains canonical.

## Blocking fix added during review
The material selector explicitly retains `.v3-benchmark`, `.v3-class-map`, `.v3-bond-lens`, `.v3-breadth` and `.v3-market-context`. This prevents Nord/Imperium/Zen Analytics depth from falling back to unrelated dark legacy surfaces after the cleanup. Regression coverage now locks those surfaces.

DNA/Pixi, finance methodology/formulas, broker/API, Data Trust, Pulse and fal.ai are unchanged.
