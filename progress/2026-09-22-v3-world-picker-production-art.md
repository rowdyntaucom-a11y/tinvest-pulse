# QVANIX v3 world picker production art — 2026-09-22

Starting main: `fcf661286c4d72f8c8c043dc2ebf2c3c6be6cc6e`.

The six worlds are now visually recognizable inside the shell control itself. The picker previously used simple gradient swatches, which made the menu feel disconnected from the actual full-screen worlds and made similarly dark/light shells harder to distinguish at a glance.

This pass reuses the already approved 1088×1920 retina masters:
- Samurai, Cosmos, Neon, Zen, Nord and Imperium each show their real world artwork in the picker card.
- The compact currently-selected-world icon also uses the active world's real artwork.
- Crops are tuned independently so the tiny preview still shows the world identity instead of an arbitrary edge of the portrait image.
- No new fal.ai generation or credits were used; the same production URLs already used by the application are reused.
- No animation was added.
- No financial/data/navigation-state/DNA behavior changed.

Samsung check after deploy: open the world picker on Home and on at least one deep workspace, verify all six thumbnails are visually distinct, readable, and do not cause menu jank.
