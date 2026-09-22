# QVANIX v3 main tabs first-answer hierarchy — 2026-09-22

Starting main: `50d34b8c6658b9a3df0e042ba8740100d7f85add`.

After the shell-material and world-picker passes, the next gap was hierarchy rather than another background. The deep workspaces were visually coherent, but Assets still hid the portfolio value in small header copy and several first screens still read as a wall of similarly weighted cards.

This pass applies the canonical rule “FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.”

- Assets now has a dedicated verified portfolio-value hero using the existing sum of current position values. No new data contract or calculation source was introduced.
- Analysis keeps concentration/effective-positions as its primary first-answer signal and gives it stronger hierarchy.
- Income keeps already-received passive income as the dominant answer; its hero number now uses the active shell accent rather than a hard-coded green.
- Goal keeps target capital as the dominant answer and makes its primary action belong to the selected world.
- Secondary metric cards are deliberately quieter so they support rather than compete with the primary answer.
- A small static shell-accent signature is used on the four answer cards. It is decorative only and has no motion.
- The page-title veil is narrowed on mobile so more of the world artwork remains visible.
- Mobile blur remains disabled for these surfaces; no Samsung scroll-performance regression should be introduced.

No financial methodology, broker/data contract, navigation state, Pulse behavior, world assets, fal.ai spend or DNA renderer ownership changed.

Samsung validation after deploy: for each of the six worlds, open Assets → Analysis → Income → Goal and check that the primary answer is obvious within one glance, the background world remains visible, secondary cards do not overpower the hero, and scrolling remains smooth.
