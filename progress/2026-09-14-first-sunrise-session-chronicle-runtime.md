# QVANIX DNA · first sunrise → session Chronicle runtime

Date: 2026-09-14
Starting main: `9f8eb77821b6e7fe5825ff1500997ba0b446766e`
Branch: `qvanix-first-sunrise-runtime-chronicle-v1`

## User instruction preserved

Continue QVANIX autonomously and keep saving what was done, the important conversation outcome, development steps, failures, live state and what remains.

## Scope

- Connect the already-reviewed `world:first-sunrise` lifecycle candidate to an actual runtime Chronicle path.
- Keep Chronicle session-only for now: no localStorage, no browser-permanent history and no second durable source of truth before backend persistence is approved.
- Preserve the existing live local-time phase clock as the observation source.
- Keep Pixi as a pure renderer: lifecycle/Chronicle composition happens in React before `WorldStage` receives state.
- Preserve the new configurable QVANIX launch board that landed on current main; no board/preferences code is removed or rewritten.

## Implementation

- Added `WorldSessionStage.tsx` around the existing `WorldStage` with no extra DOM/layout wrapper.
- While DNA is mounted, the component owns an in-memory canonical `WorldChronicleDocument` for the current app session.
- On an already-resolved `dawn` phase, it calls the existing `buildFirstSunriseWorldEvent(...)` adapter against Chronicle. If the stable ID already exists, no event is emitted.
- Accepted lifecycle candidates are appended only through existing `mergeWorldChronicleEntries(...)`, so Chronicle keeps stable-ID ownership and no retry can rewrite accepted history.
- Added dependency-free `worldSessionEventPolicy.ts` to merge existing runtime/XP events with Chronicle entries before Pixi. Runtime events have stable-ID precedence; malformed rows fail closed; output ordering is deterministic.
- `App.tsx` now renders `WorldSessionStage` instead of `WorldStage` directly. No financial calculation, board navigation, UI preferences, CSS or Pixi scene code changed.

## Council review

- Quant/product: first sunrise has no XP, RUB, return, weather, recommendation or trading meaning.
- Code: Chronicle remains canonical for lifecycle history; event merge is deterministic and fail-closed. Session state deliberately resets on full page reload until a real persistence owner exists.
- Mobile: an initially planned diagnostic wrapper `<div>` was removed before PR because it could alter `world-frame` sizing/flex behavior. Final component adds no layout element.
- Release: frontend composition only; no broker/backend route, secret, payment/legal publication, dependency or infrastructure change.

## Regression coverage

Existing mandatory `worldLifecycleEventPolicy.test.ts` now also verifies session-event merge behavior:
- runtime/base event wins on duplicate stable ID;
- malformed Chronicle rows are rejected;
- intensity is normalized/clamped;
- deterministic ordering is preserved.

Normal repository `v2 build` / `test:core` remains required before merge.

## Known deliberate limitation

Chronicle is not durable across full page reloads yet. This is intentional: the project currently has no approved authenticated Chronicle persistence backend, and browser-local permanent storage must not become an accidental second source of truth. The next persistence pass should define an explicit storage owner/API rather than silently promoting session state.

## Next safe step

After this pass is live, expose renderer-neutral persistent-memory/scar eligibility signals derived from canonical Chronicle history without selecting sprites, colors, particle effects, scar size or other subjective art mapping. Backend Chronicle persistence remains a separate architecture decision.
