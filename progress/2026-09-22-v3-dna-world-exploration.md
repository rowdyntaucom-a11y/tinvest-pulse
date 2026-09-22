# QVANIX v3 DNA world exploration — 2026-09-22

Starting main: `b3d554d45fd13f5d0fcfe7357ba9a3ec6c45d936`.

This pass continues the Living World after the phase/shell framing work and adds a truthful interaction layer without changing the canonical Pixi renderer.

- Four authored scene landmarks are now directly explorable: workshop, wanderer, mine and distant settlement.
- Landmark copy describes visible world/atmosphere only; it does not infer portfolio progress, rewards, XP or financial state.
- Interaction is keyboard/touch reachable through real buttons with pressed state, explicit labels and a polite live description region.
- The exploration layer sits above the existing renderer and therefore preserves single-owner runtime, reviewed-asset loading, event caravans and atmosphere lifecycle.
- Landmark emphasis uses the existing `--dna-mark` shell token, so all six shells retain their identity without duplicating theme state.
- No fal.ai credits were used: the current reviewed scene art is sufficient for this interaction pass.
- Financial calculations, broker data, navigation, Pulse and asset-workspace contracts are untouched.

Real-device follow-up after merge: validate landmark hit targets and description placement on the current Samsung capture path; if visual fidelity of the wanderer remains the limiting factor, use the approved server-side fal.ai pipeline for a reviewed candidate rather than adding unreviewed art directly.
