# 2026-09-24 — Samurai real-device parity 1562

Evidence: Samsung recording `1000031562.mp4`.

## What the recording exposed
The new Samurai parity concept was present, but old high-specificity mobile rules were still winning parts of the cascade on the real device.

Visible regressions:
- Assets / Analysis / Income still showed verification-route content at the top of the first viewport.
- Chapter titles expanded too large and behaved like old cockpit cards.
- Goal was still stretched by legacy `:has(.sam-goal-empty-path)` sizing, so the top Goal block occupied too much of the artwork.
- The intended open central Ronin corridor existed lower in the viewport, but the top third still read as a UI wall.

## Fix
- Added a final real-device cascade layer loaded after the generic mobile owner.
- Per-workspace selectors now outrank old per-kind `!important` rules.
- Verification route is forced below the first viewport.
- Assets / Analysis / Income chapter/status/instrument surfaces are compacted again.
- Goal explicitly overrides legacy `:has(.sam-goal-empty-path)` min-height/margin rules.
- Goal chapter, command plate and path rail are reduced to edge instruments.
- No financial logic, broker data handling or formulas changed.
- No new animation/filter cost added.

## Rule
Real-device footage outranks stylesheet intent. A composition is not considered fixed until the effective Samsung cascade matches the authored layout.
