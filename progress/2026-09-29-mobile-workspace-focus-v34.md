# QVANIX Mobile Workspace Focus v34 — 2026-09-29

## Basis
The latest Samsung recording confirmed that v33 improved hierarchy, but two interaction costs remained:
1. after choosing a deep tool, the selector/catalog still occupied too much vertical space above the actual workspace;
2. numeric entry in Rebalance/Lab/Futures competed with the Android keyboard and bottom navigation.

Bond depth also still exposed too many secondary blocks at once.

## Patch

### Focused tools
- Tool catalog starts expanded.
- After selecting a tool, the catalog collapses automatically.
- A compact sticky focus card remains with the selected tool, purpose and “Change tool” action.
- Choosing another tool scrolls the stage to the top without smooth-bounce.
- Only the active workspace renders.

### Keyboard-safe forms
- Light Core now tracks focused input/select/textarea fields.
- The Visual Viewport API is used to measure keyboard occlusion.
- Focused fields are scrolled to the center after the soft keyboard begins opening.
- Bottom navigation hides while typing so it does not compete with Android IME controls.
- Main content reserves the measured keyboard inset while input is active.
- Existing decimal inputMode contracts in Rebalance/Lab/Futures are preserved.

### Bond depth
- Headline bond metrics remain immediately visible.
- Rate scenarios, maturity ladder and per-issue diagnostics become separate closed disclosures.
- No calculation/source behavior changed; only presentation order changed.

## Boundaries
No trading or order entry.
No financial formula changes.
No fake values.
No DNA work.
Active product remains the light QVANIX Financial Core.
