# QVANIX v3 — theme infrastructure hardening

Date: 2026-09-23  
Starting main: `d791b989` (`feat(v3): make six shells complete design systems (#572)`).

## Audit map

The loaded cascade had grown chronologically rather than by ownership:

1. `v3.css` — foundation plus the oldest Home, shell, atmosphere and navigation rules.
2. Feature CSS — workspace structure and component-local presentation.
3. `shellWorlds.css` — world art, global grading and shell material tokens, but also a complete older generation of deep-workspace overrides.
4. `readability.css` / `adaptiveDesktop.css` / `navigation6.css` — accessibility, responsive desktop and six-destination navigation corrections.
5. `workspaceWorldFinish.css` — later deep-workspace material and first-answer corrections.
6. `fullShellSystems.css` — final typography, geometry and shell composition.

The dangerous conflict was concrete: the `Workspace material coherence v14` tail in `shellWorlds.css` styled the same cards, chrome, controls and mobile blur policy as the later `workspaceWorldFinish.css`. It contained 50 `!important` declarations and made workspace behavior depend on import order. Mobile blur suppression was separately repeated in `shellWorlds.css`, `workspaceWorldFinish.css` and `fullShellSystems.css`.

## Ownership after this pass

- **Foundation:** `v3.css` keeps shared layout, semantics, base accessibility and historical primitives. Its remaining legacy shell blocks are deliberately retained because removing them requires visual-diff coverage beyond this safe pass.
- **Workspace:** feature styles own structure; `workspaceWorldFinish.css` is the single owner of deep-workspace material tokens and the compatibility boundary over older feature surfaces.
- **Shell:** `shellWorlds.css` owns artwork/global world grading; `fullShellSystems.css` owns the six systems' typography, geometry, borders, shadows, density and navigation/hero signatures.
- **Responsive/performance:** new last-loaded `mobilePerformance.css` owns financial-workspace phone blur suppression, page overflow containment, touch-action behavior and reduced-motion scroll behavior. DNA is explicitly excluded from this boundary.

## Cleanup and guards

- Removed the superseded `Workspace material coherence v14` declaration/override generation from `shellWorlds.css` and moved only its still-live material token definitions to the workspace owner. This removes 119 lines and 50 `!important` declarations without changing computed token values.
- Removed duplicate mobile no-blur selector lists from two late presentation files and established one final mobile guard.
- Added a lightweight architecture regression that locks final import order, six identities, unique typography/workspace token owners, no `transition: all`, horizontal overflow containment, touch behavior, mobile no-blur policy and the existing single React DNA workspace boundary.
- Existing deterministic calculations, source contracts, broker/API, Pulse, fal.ai and Pixi runtime files are unchanged.

## Deliberately retained debt / future migration

- `v3.css` and the first 432 lines of `shellWorlds.css` still contain chronological Home/world generations and high-specificity compatibility rules. They remain because they include approved art framing and Samsung fixes; deleting them without computed-style screenshot comparison would be a blind rewrite.
- `workspaceWorldFinish.css` still uses `!important` as a compatibility boundary over numerous feature files. Future work should migrate each workspace family to shared surface tokens before removing that boundary, rather than weakening it piecemeal.
- Historical internal shell ids (`core`, `carbon`, `horizon`, `aurora`, `minimal`) remain mapped to the public Neon, Cosmos, Zen, Nord and Imperium identities. Renaming them would be a preference/schema migration, not CSS cleanup.
- DNA retains its own mobile blur rules and runtime ownership because Living World is frozen and intentionally outside this pass.
