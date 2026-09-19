# QVANIX v3 — DNA first-class workspace

## Intent
Restore DNA as a first-class v3 destination without reintroducing the old capital-threshold level model or a second renderer/runtime.

## Implementation
- Added `dna` to the canonical v3 workspace model and primary navigation.
- Added a lazy-loaded v3 DNA workspace that mounts the existing canonical v2 `WorldSessionStage` / `WorldStage` renderer rather than forking the world engine.
- The v3 adapter is deliberately fail-closed: level 1, XP 0, neutral weather, no invented events. Portfolio value/profit/expectedYield are not used to create game progress.
- Local time controls the visible world phase; the canonical renderer retains its single-owner runtime, visibility pause and DPR/performance behavior.
- Added a responsive immersive surface and a six-destination mobile navigation treatment, including <=359px density handling.
- Added a regression contract proving DNA remains lazy, neutral and independent of absolute capital.

## Next depth boundary
Do not fabricate XP in v3. Connect progression only when the approved relative XP inputs (discipline, verified health/performance, passive-income development) are available through a canonical deterministic adapter.
