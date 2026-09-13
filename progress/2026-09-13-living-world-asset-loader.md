# QVANIX DNA · Living World reviewed-asset loader

Date: 2026-09-13
Starting main: `7a46f092f9df91411524cabfd9fdedcfc66e5641`.

## Scope

- Adds a resilient, deterministic loader for already-reviewed Living World asset-manifest entries.
- Loading is isolated per slot: one broken/missing asset is recorded as failed and cannot abort renderer boot.
- The existing Pixi placeholder scene remains visible until a later reviewed presentation mapping replaces a specific placeholder.
- Production reviewed-asset registry is intentionally empty. Legacy v1/Figma-era SVGs are preserved as composition/provenance history but are not silently promoted into the v2 final art pipeline.
- WorldStage preloads only entries accepted by the existing fail-closed manifest and exposes configured/loaded/failed counts as diagnostic data attributes.

## Council

- Quant/product: no finance, XP awards, level economy, weather inference or recommendations changed.
- Code: one renderer / one update loop is preserved; loading runs independently from renderer boot and failures stay local to a slot.
- Mobile: no visible layout, navigation, density or new widget changes.
- Release: no backend/broker route, secret, legal/payment wording, paid dependency or deployment configuration changes.

## Legacy Figma review

- Historical workflows confirm v14.14 and v14.16 imported master SVGs from Figma MCP into root `public/assets/dna-world/l1`.
- Those legacy SVGs are not activated in v2 because later product review rejected schematic/vector output as the final Living World quality bar.
- Direct Figma master editing remains blocked in the current session by the authenticated View seat.

## Validation

- Existing world regression now covers deterministic load order, successful per-slot loading, isolated thrown-load failure and empty-asset failure.
- Initial `v2 build` #389 correctly failed the deferred-DNA bundle budget: importing Pixi `Assets` expanded the DNA chunk to 553.9 KiB versus the accepted 525 KiB ceiling.
- The budget was not raised. Runtime preload was changed to browser-native `Image`, preserving the same manifest/fallback semantics without pulling the Pixi Assets subsystem into the deferred chunk.
- Repeat normal `v2 build` is required before merge.
- Merge only while both Render queues are healthy/settled.

## Next

- Obtain/review the first production-quality background or terrain export, package it under `v2/public/assets/world`, register provenance, then add a separate reviewed presentation mapping that swaps only the corresponding placeholder after successful load.
