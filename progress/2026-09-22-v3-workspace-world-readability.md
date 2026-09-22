# QVANIX v3 workspace world readability — 2026-09-22

Real Samsung recording after PR #555 confirmed the stacking regression is fixed and the selected world now survives across Home, Assets, Analysis, Income and Goal. The same recording also showed the next polish target: deep workspaces still need stronger art identity at the top without sacrificing metric readability.

- Added theme-specific global grading instead of one dark grade for every shell.
- Light worlds (Zen, Nord, Imperium) now fade through pale theme-matched tones instead of being dirtied by a generic black veil.
- Dark worlds (Samurai, Cosmos, Neon) keep richer saturation/contrast while still fading into the canonical workspace background.
- Raised/reframed the portrait masters on mobile deep workspaces so focal artwork remains visible above the first card stack.
- Reduced the workspace veil in the upper viewport, then increases it progressively through the content region.
- Kept Home's dedicated cinematic composition authoritative and unchanged.
- Kept the mobile no-blur performance budget: no new backdrop-filter, animation or generated asset.
- No financial methodology, broker/data contract, navigation semantics or DNA renderer ownership changed.

Samsung validation after deploy: switch all six worlds and check Assets → Analysis → Income → Goal for (1) readable page titles, (2) visible art in the upper viewport, (3) no washed-out light shells, (4) no scroll jank, (5) no black fallback.
