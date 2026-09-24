# 2026-09-24 — Samsung 1000031510 cross-shell legibility

Real-device recording `1000031510.mp4` reviewed after Samurai, Cosmos, Nord/Aurora, Zen, Neon and Imperium signature work.

## What the recording exposed

- Samurai and Cosmos preserve the intended first-screen hierarchy and remain readable.
- Neon is visually strong and readable; its empty states can be better integrated with the authored deck.
- Zen's new dark garden instruments were still inheriting the former light Horizon ink tokens, making deep metrics and notes too faint on a real Samsung display.
- Nord/Aurora had the same semantic-token mismatch: its dark polar answer cards could render dark ink, most visibly on Goal.
- Workspace titles could wrap in the middle of words on some shells at the narrow Samsung width.
- Imperium's bright palace art and fail-closed copy were too close in luminance, making the empty composition feel washed out.
- Generic fail-closed empty copy could float directly over artwork in non-Samurai shells.

## Fix

- Keep light paper/frost workspace headers for Zen and Nord, but switch their deep instrument tokens to explicit light-on-dark contrast.
- Preserve shell-specific semantic gain/loss colors.
- Prevent mobile workspace title word wrapping.
- Give fail-closed empty states an authored shell material rather than raw copy over art.
- Strengthen Imperium art contrast and ivory reading surfaces without replacing its palace art.
- Do not alter any financial calculation, broker access, trust decision, navigation ownership, DNA renderer, or data contract.

This is a presentation-only real-device regression pass.
