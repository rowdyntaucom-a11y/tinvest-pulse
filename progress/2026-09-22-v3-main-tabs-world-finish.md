# QVANIX v3 main tabs world finish — 2026-09-22

Starting main: `9d81549897ce5348ec0470af157c418a97ef77a6`.

Real Samsung evidence plus the post-#557 CSS audit exposed a structural issue: shell-specific material rules lived in `shellWorlds.css`, but several feature stylesheets load after it. That meant late module CSS could partially restore legacy dark/light surfaces even when the selected world had already changed.

This pass adds a deliberately last-loaded, presentation-only boundary for the five financial workspaces and canonical Asset Workspace.

- Assets, Analysis, Income and Goal primary cards now receive the selected shell material after all feature CSS.
- Deep analytics/income/goal/holdings subcards receive a quieter shell-matched submaterial rather than becoming equally heavy cards.
- Section selectors, inputs and selects inherit the active shell instead of reverting to legacy defaults.
- Context bar, data-state chip and persistent bottom navigation remain in the same world.
- Page headings get a local left-side legibility veil that fades to transparent, keeping focal artwork visible rather than covering the whole upper viewport.
- Semantic positive/negative colors remain finance-semantic and are not recolored into decorative shell accents.
- The final mobile layer explicitly disables backdrop blur so this work cannot reintroduce the Samsung scroll jank fixed earlier.
- No animation, new image generation or FAL spend was added.

Architecture: `workspaceWorldFinish.css` is imported after `navigation6.css`; a regression test locks that ordering and the critical workspace coverage.

No financial formulas, broker/data boundaries, navigation state, Pulse behavior or DNA renderer ownership changed.

Samsung validation after deploy: all six worlds across Assets → Analysis → Income → Goal; check title readability, artwork visibility, light-world card coherence, active nav state, selectors/inputs, and scroll smoothness.
