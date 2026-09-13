# QVANIX DNA · Living World scene layers

Date: 2026-09-13
Starting main: `2237d69cc5d92bc9d20423442c3372578746def2`.

## Scope

- Introduces a stable renderer z-order contract for Living World: background, atmosphere, terrain, structures, actors, logistics and effects.
- Mounts the existing temporary Pixi placeholder geometry into those containers without changing the approved art direction or adding new subjective visuals.
- Keeps one root world container, one Pixi application and one ticker; no duplicate renderer/update loop is introduced.
- Exposes only layer version/count as DOM diagnostics for later asset-pipeline verification.
- Does not route financial metrics or XP amounts directly into layers.

## Council

- Quant/product: no financial calculation, XP award, progression threshold, recommendation or weather inference changed.
- Code: scene structure is a small deterministic contract; existing placeholder objects are reassigned to stable containers while ownership/lifecycle remain unchanged.
- Mobile: no new visible widget or layout block; same 1600x900 fitted scene and current DPR/FPS limits remain.
- Release: frontend/Pixi structure only; no backend, broker API, credentials, legal/payment, trading, dependency or infrastructure changes.

## Validation

- Existing `worldRenderSnapshot` core regression now also fixes the layer order/version/uniqueness contract.
- Requires the normal `v2 build` before merge.
- Merge only while both Render services are settled on current main.

## Next

Use the stable layer contract as the destination for reviewed Figma/Pixi assets and later versioned time/weather/event visual mappings. Subjective asset selection remains a separate reviewed step.
