# QVANIX DNA · asset pipeline contract checkpoint

Date: 2026-09-13
Status: refreshed on current main after WorldRenderSnapshot production rollout.

## Decision

The production Живой мир must use a layered asset pipeline rather than a flattened scene or another renderer patch chain. Required boundaries are: WorldState → semantic event queue → WorldRenderSnapshot → one Pixi runtime → versioned asset manifest/layers.

## Contract

- independent background/midground/structures/characters/props/foreground/fx/lighting layers;
- stable ids, logical dimensions/anchors/z-groups and animation metadata;
- no finance/XP semantics inside art filenames or asset manifest;
- fail-closed optional assets and no secondary renderer/ticker fallback;
- Samsung/Android-first composition and profiling before art freeze;
- art direction, weather/event mappings and XP economy remain separately gated for user review.

## Release scope

Documentation only. No runtime, finance, mobile layout, backend, broker API, legal/payment or trading behavior changes.
