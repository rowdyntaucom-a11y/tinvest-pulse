# QVANIX v3 workspace material coherence — 2026-09-22

Real Samsung video after the global-world stacking fix showed that world continuity now works across Home, Assets, Analysis, Income and Goal. The remaining visual mismatch was material: the artwork changed, but several analytical surfaces still read as the same dark dashboard, especially Nord over a bright mountain world.

This pass makes the six shells materially distinct on deep workspaces while leaving Home's cinematic composition untouched.

- Samurai: warm lacquer-dark surfaces, amber shell accent and asymmetric corners. Positive/negative finance colors remain semantic rather than being recolored into the theme.
- Cosmos: deep navy/space glass, blue accent and diagonal asymmetric geometry.
- Neon: violet-black surfaces with a purple electric accent and its own corner language.
- Zen: pale sage/cream analytical surfaces with restrained green accent.
- Nord: cold blue-white surfaces and ice-blue accent so the cards belong to the bright snowy world instead of falling back to navy.
- Imperium: warm ivory/bronze surfaces with sharper geometry rather than sharing Zen's treatment.
- Context bar, data-state chip and bottom navigation now inherit the selected world's material vocabulary on non-Home workspaces.
- Advanced analytical cards continue to use existing semantic variables; no calculation, source, or data-state semantics changed.
- Mobile keeps the no-backdrop-filter budget to avoid reintroducing the Samsung scroll jank observed earlier.

Regression coverage now locks all six deep-workspace identities, distinct radius/material contracts, theme-tail colors and the mobile no-blur rule.

No FAL generation, broker/API change, financial methodology change, navigation-state change or DNA renderer change.
