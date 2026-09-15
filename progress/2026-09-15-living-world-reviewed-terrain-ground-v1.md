# Living World — reviewed terrain ground v1

## Base
- Fresh `origin/main`: `65721fdfd0055de7492f7688ddcd9dbd7c98756b`.
- Open Codex/Data Trust PRs were inspected and left untouched.

## Scope
- Added one text-only local SVG for `terrain.ground`: `/assets/world/terrain-ground-v1.svg`.
- Registered it as `reviewed-local` with explicit provenance in the canonical reviewed asset registry.
- Added a regression covering manifest admission, canonical readiness, local SVG safety and the 1600×900 scene contract; registered it in `test:core`.

## Guardrails
- This pass deliberately does not mount the terrain sprite yet. The existing procedural ground therefore remains the production fallback until a separate renderer-binding pass proves canonical readiness + mount-decision + successful browser-native loading.
- No `Assets.load(...)`; no Pixi runtime changes; no new Application/ticker/runtime owner.
- No semantic actor changes, financial/XP inputs, Data Trust, broker/API, Metric Drill-down or v1 changes.
- SVG is repository text, has no script/foreignObject/remote href/url and no binary payload.

## Visual review
- Terrain is a restrained layered rocky foreground: broad ground plane, mid-ridge, rock accents and deep foreground shadow bands.
- Palette is intentionally dark/low-saturation so semantic actors and work lights retain priority.
- Full-scene viewBox matches the existing 1600×900 world coordinate system.

## Previous blocker retained
- Do not restore Pixi `Assets.load(...)` in reviewed asset binding: the earlier renderer attempt grew `pixi-dna` to 554.1 KiB against the hard 525 KiB budget. Current browser-native `loadWorldAssetEntries(...)` + caller-owned `Sprite.from(...)` remains canonical.

## Next
- After green CI and merge, mount `terrain.ground` through the existing reviewed binding path. Only `reviewed-asset` after successful browser-native load may create the Sprite; every other state keeps procedural ground visible.
