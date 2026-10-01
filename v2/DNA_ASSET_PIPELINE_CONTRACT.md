# QVANIX DNA · Production Asset Pipeline Contract v0.1

Status: technical contract only. This document does not approve a visual style, biome, character design, XP economy, weather semantics, or event-to-animation mapping.

## Why this exists

The legacy Живой мир repeatedly mixed three different concerns: portfolio/game state, scene ownership, and visual assets. It also relied on monolithic images and renderer patches that were difficult to animate independently. The v2 architecture now separates those concerns:

**financial core / XP rules → WorldState → semantic event queue → WorldRenderSnapshot → one Pixi runtime → production assets**

The asset pipeline must preserve that separation.

## Runtime constraints already fixed in code

- Logical world coordinate space is currently **1600 × 900** in `WorldStage.tsx`.
- The world scales uniformly into the available host area; composition must remain readable when letterboxed/cropped by different phone aspect ratios.
- Mobile Pixi ticker is capped at **45 FPS**; desktop at **60 FPS**. Production art must not assume 60 FPS on mobile.
- Render resolution is deliberately capped above CSS resolution to control mobile GPU cost.
- Pixi is dynamically loaded only when DNA is mounted.
- JavaScript budgets are enforced separately: non-DNA chunks ≤ **450 KiB**, deferred DNA/Pixi chunk ≤ **525 KiB**. Asset weight is not yet given a hard numeric budget; it must be measured separately before a production cap is frozen.
- Exactly one `WorldStage` may own one Pixi `Application` and one ticker at a time.

These are architecture constraints, not art-direction choices.

## Required scene decomposition

A production scene must not arrive as one flattened illustration. Deliver it as independently controllable visual groups. The minimum useful decomposition is:

1. `background/sky` — distant non-interactive background.
2. `background/far` — far mountains/city silhouettes/cloud layers.
3. `midground` — major terrain and world geometry behind gameplay objects.
4. `structures` — buildings/mines/bridges/large objects that can change by world level/state.
5. `characters` — workers/citizens/creatures/vehicles as independent animated entities.
6. `props` — lamps, carts, signs, tools, vegetation, machines and other reusable objects.
7. `foreground` — framing objects that may overlap characters/structures.
8. `fx` — smoke, dust, rain, sparks, fog, glow, water and other transient effects.
9. `lighting` — additive/multiply overlays or masks used for time-of-day/atmosphere.

HUD/UI remains React/CSS unless a specific element is deliberately approved as part of the world. Do not bake portfolio numbers, labels, buttons or legal text into scene textures.

## Asset delivery rules

### Static layers

Prefer transparent raster layers or atlas-ready sprites. Each asset must have:

- stable machine id;
- source group/layer name;
- native pixel dimensions;
- intended logical size in the 1600 × 900 world coordinate system;
- anchor/pivot definition;
- default logical position;
- intended z-order group;
- whether it may be repeated/tiled;
- whether it is optional or required for the base scene.

Do not encode state in filenames such as `final2_really-final.png`. State belongs in the manifest.

### Animated entities

Character/vehicle/FX animation must be delivered as separate frame sequences or sprite atlases, not as a flattened scene video. Each animation needs:

- entity id;
- animation id (`idle`, `walk`, `work`, etc.);
- ordered frames;
- frame duration or FPS;
- loop / one-shot flag;
- anchor/pivot shared across frames;
- logical bounding box;
- optional event marker names only when they describe animation timing, not finance logic.

The art file must not decide that a market drawdown means `storm`, that a deposit means `construction`, or that a dividend means `fireworks`. Those mappings belong to a separate, versioned presentation policy after review.

## Manifest boundary

Production assets should be described by a versioned manifest instead of being hard-wired throughout `WorldStage.tsx`.

Illustrative schema shape (not yet a frozen JSON schema):

```text
manifest.version
scene.logicalWidth = 1600
scene.logicalHeight = 900
atlases[]
assets[]
  id
  source
  width / height
  logicalWidth / logicalHeight
  anchorX / anchorY
  defaultX / defaultY
  zGroup
  required
animations[]
  entityId
  animationId
  frames[]
  frameDurationMs
  loop
```

No RUB amounts, TWR/XIRR, portfolio weights, broker identifiers, XP award formulas or acknowledgement state may appear in the asset manifest.

## Presentation mapping stays separate

`WorldRenderSnapshot` is the renderer input. A later versioned presentation mapper may translate resolved values such as:

- `timePhase`;
- `weather`;
- `level`;
- pending semantic event `kind`;

into asset ids and animations.

That mapper must be deterministic, versioned and testable. It must not calculate financial metrics, award XP, mutate the event cursor or infer an event from capital size.

Until that mapper is explicitly reviewed, production assets may be loaded/tested, but they must not silently introduce new game semantics.

## Fail-closed behavior

The final world must remain usable if an optional asset fails to load.

- Missing optional sprite/FX → omit that visual only.
- Missing optional animation → fall back to a static/idle representation when defined.
- Missing required base asset → show the safe base scene/error state; do not create a second renderer or legacy fallback owner.
- Asset errors must not affect portfolio/analytics/income screens.
- No asset loader may own its own global ticker or canvas.

## Mobile composition requirements

The production composition must be tested first on the Samsung/Android target, not only desktop.

- Critical world focal point must remain visible in the phone viewport.
- Do not place important characters/events permanently at extreme logical edges.
- HUD must not depend on baked-in image labels.
- Assets must tolerate uniform scaling from the 1600 × 900 logical scene.
- Tap targets belong to a separate interaction layer with explicit logical hit areas; do not rely on tiny painted details as touch targets.
- Heavy effects must be optional/quality-scalable so lower mobile GPU headroom does not break the base scene.

## Performance validation before art freeze

Do not freeze a production art pack from appearance alone. For each candidate pack measure at minimum:

- initial DNA asset download size;
- decoded texture memory;
- atlas count and largest texture dimensions;
- average/poor-frame timing on the target Samsung device;
- number of continuously animated entities;
- effect cost with weather + lighting + character animation together;
- mount/unmount behavior and GPU/resource cleanup;
- first-load isolation: Portfolio/Analytics/Income must still avoid loading Pixi/world assets.

The current 45 FPS mobile cap is an upper runtime target, not permission to fill every frame with effects. A concrete texture/atlas/particle budget should be frozen only after profiling one representative production scene.

## What to ask from an artist / Figma / generator workflow

A candidate workflow is suitable only if it can reliably provide:

- the same scene style across repeated generations/edits;
- independently exportable layers or reproducible object-level assets;
- transparent object/character exports;
- consistent character identity across animation poses;
- clean separation of lighting/atmosphere from structural art;
- repeatable dimensions and anchors;
- permission/licensing suitable for our intended product use;
- source files or a reproducible source workflow, not only flattened final JPEGs.

A single beautiful concept image is useful as a visual reference, but **is not a production-ready Живой мир asset pack** by itself.

## Acceptance gate for the first production scene

Before replacing placeholder geometry, the first production scene must pass all of these gates:

1. asset source/licensing is known;
2. scene is layered enough for independent animation;
3. one-owner Pixi architecture remains intact;
4. `WorldRenderSnapshot` remains the only game-state input to the renderer path;
5. no financial/XP calculations are moved into rendering code;
6. mobile performance is profiled on the target device;
7. mount/unmount cleanup is verified;
8. missing optional assets fail closed;
9. visual direction is explicitly reviewed by the user;
10. a rollback to the technical placeholder scene remains possible.

Only after this gate should event/weather/time-of-day presentation mappings be promoted into production.
