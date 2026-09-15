# Living World — Cinematic Atmosphere v2

Date: 2026-09-15

## Purpose

The current Living World already responds to time of day and reviewed weather, but weather mostly read as particles placed over one base palette. This pass deepens the scene through the existing atmosphere boundary without changing Pixi ownership or adding new assets.

## Base / isolation

Fresh branch from `main` at `8c90648f78eabc6a34453c19e5d20e0ab921e3bb`.

Parallel Codex Data Trust recovery remains isolated. This pass changes only Living World atmosphere presentation, its regression registration/test and this checkpoint.

## What changed

- Atmosphere presentation version advanced to `0.2`.
- Dawn, day, sunset and night palettes were refined for stronger visual separation and depth.
- Dawn/sunset retain a warmer horizon and residual stars; night receives deeper sky/mountain separation and a stronger star field.
- Reviewed cloudy/rain/storm states now darken the already-selected time-of-day palette in a bounded deterministic way.
- Rain/storm continue to use existing cloud/rain/storm channels; no new runtime layer was introduced.
- Settlement lamp color is intentionally not weather-shaded, preserving local contrast during darker weather.
- `neutral` still means no reviewed weather signal: no clouds, rain, shade or storm flash are invented.

## Data honesty

Weather is never inferred from portfolio performance, money, returns, broker data, XP, rewards or user behavior.

This boundary only receives the already-resolved `timePhase` and `weather` from `WorldRenderSnapshot` and maps them to visual parameters.

## Runtime / performance

No changes to:

- Pixi `Application` ownership;
- ticker count or cadence;
- canvas count;
- scene layer ownership;
- deferred Pixi loading;
- reviewed asset pipeline.

The new color shading is pure integer arithmetic and adds no dependency.

## Regression coverage

New `worldAtmospherePresentation.test.ts` verifies:

- deterministic output;
- neutral fail-closed weather behavior;
- clear weather does not recolor the phase palette;
- cloudy/rain/storm progressively darken the palette;
- rain/storm channels remain bounded;
- celestial visibility reduces with weather severity;
- night/dawn/sunset star hierarchy;
- weather does not dim the settlement lamp color;
- no financial/XP fields enter presentation output.

Registered in `test:core`.

## Release gate

Do not merge until full PR-triggered security/build/test/runtime/API gates pass and final diff remains Living World-only. Bundle/security/test thresholds must not be increased or weakened.
