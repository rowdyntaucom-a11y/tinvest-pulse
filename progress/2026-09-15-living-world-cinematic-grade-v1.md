# QVANIX · Living World cinematic grade v1

Date: 2026-09-15

## Context

The first reviewed `background.distant-settlement` asset is now mounted through the canonical reviewed-asset pipeline in the existing Pixi runtime. The next safe visual pass should improve how the complete scene reads across local time phases and explicit weather without adding another Pixi loader, renderer, ticker or asset binary.

## Decision

Use a CSS color-grading layer on the existing Living World canvas, driven only by the already-exposed `data-world-time` and `data-world-weather` attributes.

This keeps the renderer architecture unchanged while grading both the reviewed distant settlement and the procedural fallback beneath/around it as one coherent scene.

## Presentation contract

- dawn: slightly warm, gently saturated;
- day: close to neutral daylight;
- sunset: warmer and richer;
- night: darker and quieter;
- clear/cloudy/rain/storm apply progressively stronger explicit weather grading;
- `neutral` has no dedicated selector and therefore adds no weather semantics;
- reduced-motion removes the filter transition while preserving the static visual state.

The CSS composes phase and weather as separate filter variables so explicit weather does not erase the local-time grade.

## Guardrails

- no financial formulas, portfolio values, returns, XP magnitude or broker data enter presentation;
- no Data Trust / Metric Drill-down / Codex files changed;
- no `WorldStage` runtime logic changed;
- no new Pixi import, Application, loader or ticker;
- no binary assets;
- existing reviewed asset mount and procedural fallback remain unchanged;
- bundle/security/test thresholds remain unchanged.

## Regression

`worldAtmospherePresentation.test.ts` now verifies:

- all four time-phase selectors exist;
- explicit clear/cloudy/rain/storm selectors exist;
- no `neutral` weather override exists;
- phase and weather filters are composed on the canvas;
- `prefers-reduced-motion` disables transitions;
- the cinematic grade stylesheet is loaded by the app entrypoint.

## Next priority

If CI and Render stay green, continue production-art depth one reviewed slot at a time. Prefer a visually reviewed terrain/structure layer next rather than replacing semantic actors before a dedicated actor-art pass.
