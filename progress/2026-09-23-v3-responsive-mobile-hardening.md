# QVANIX v3 — responsive/mobile architecture hardening

Date: 2026-09-23
Factual starting main: `97eb1ef5de95a29fc65cc44c1b481a3360190d76` (#576).

## Initial state and audit scope

The audit covered the V3 application/cascade, Home, Portfolio, Analytics, Income,
Goal, canonical Asset Workspace, world picker, six-item bottom navigation and the
Data Trust disclosure. The Living World renderer was inspected only to verify its
ownership/performance guards; its scene, camera, content and artwork were not changed.

The accepted cascade already had a useful ownership boundary: foundation/workspace
styles load first, shell materials and authored composition follow, and
`mobilePerformance.css` is the final responsive/performance correction owner. The
pass preserves that order instead of adding another visual override layer.

## Breakpoint map

- `359px` and below: narrow/foldable fallback for crowded grids and controls.
- `430px` and below: the dominant legacy phone-density breakpoint used by workspace
  styles, Data Trust, charts and scene framing.
- `699px` and below: canonical shell-composition and phone-performance boundary.
- `767px` and below: fixed bottom-navigation/safe-area boundary.
- `768px+`: tablet bounded workspace.
- `1024px+`: desktop navigation rail and wider analytical workspace.
- `1440px+`: large-desktop width/rhythm adjustment.
- Height queries are limited to fixed screenshot/demo surfaces. Reduced motion and
  increased contrast remain capability/preferences queries rather than width rules.

## Technical debt found

- Root overflow containment existed only on `.v3-app`; intrinsic widths could still
  propagate through `html`, `body` or `#root`.
- Long Russian copy, asset names/identifiers and unusually large signed financial
  values did not share a final intrinsic-sizing/wrapping safeguard.
- Phone blur suppression enumerated components, so a new/deep card or overlay could
  accidentally retain `backdrop-filter` on Samsung/Android.
- Bottom-nav clearance was owned by `navigation6.css`, but later workspace rules could
  override it, and its compositing transform was unnecessary for a static fixed nav.
- Data Trust's phone chip and evidence metadata fell below the established readability
  floor even though the control itself is important and interactive.
- Some narrow two-column value groups had no final 320–359px collapse.
- Responsive rules are distributed across workspace files at `359/430`, shell files
  at `699`, navigation at `767`, and desktop at `768/1024/1440`. This is intentional
  ownership, but the 430/699 overlap remains a maintenance risk and should not grow.

No `transition: all` was found. The existing decorative shell effects are gated by
motion preference; this pass adds no animation, filter, canvas, viewport listener,
interval or requestAnimationFrame loop.

## Corrections

- Extended final viewport containment to the document root, with `overflow: clip`
  where supported and a hidden fallback.
- Added final `min-width: 0`, `overflow-wrap: anywhere` and tabular-number protections
  for realistic long-content cases without changing production data.
- Made phone blur suppression future-safe across every non-DNA descendant and pseudo
  element. DNA remains outside this ownership boundary.
- Centralized final phone bottom clearance using the stable navigation footprint plus
  `safe-area-inset-bottom`; navigation retains six equal, readable identities and no
  longer forces its own compositor layer.
- Enforced 44px targets for shell mode/world controls, world options, navigation,
  section selectors, Asset back and Data Trust recovery.
- Raised mobile Data Trust text/metadata to readable sizes and made the status control
  itself 44px tall.
- Collapsed only the vulnerable value grids at the narrow breakpoint. Shell-authored
  Samurai asymmetry, Cosmos deck, Neon poster, Zen bands, Nord utility and Imperium
  ledger composition remain intact at phone width.

## Regression coverage

`responsiveArchitecture.test.ts` protects:

- final responsive stylesheet order;
- root overflow/intrinsic-size guards;
- phone-wide no-backdrop-filter enforcement outside DNA;
- bottom-navigation safe-area, stable height and content clearance;
- touch-safe critical controls;
- six shell identities and their phone composition boundary;
- no `transition: all` in V3 styles;
- one DNA workspace, one Pixi `Application` and one ticker callback;
- reduced-motion preservation.

Existing V3 tests continue to protect first-screen hierarchy, workspace depth,
navigation, theme ownership, financial semantics and DNA runtime architecture.

## Samsung/mobile decisions

The implementation uses CSS only. It introduces no scroll-linked JavaScript, live
filter, persistent blur, new shadow stack or renderer work. Phone workspaces may grow
vertically instead of shrinking labels or clipping values. The fixed navigation keeps
a constant 64px box while device insets are handled as external placement and reserved
content clearance, avoiding tab-to-tab height jumps.

## Remaining risks

- Static CSS guards cannot replace real Samsung, foldable, WebKit and landscape visual
  recordings; those remain required review evidence.
- Legacy workspace styles still contain compact 8–9px metadata outside the critical
  first-answer and Data Trust paths. A future typography pass should address these by
  semantic role, not a global size override.
- The `430px`, `699px` and `767px` boundaries are historically justified but close
  together. Future work should avoid introducing another phone breakpoint and should
  migrate rules only when the responsible component is being changed.
- Pulse is a deliberately viewport-fixed screenshot surface and remains governed by
  its own compact contract rather than ordinary workspace scrolling.

## Locked-area confirmation

No financial methodology/formula, CAGR/XIRR/TWR/benchmark/passive-income logic,
broker/API adapter, Data Trust semantics, Pulse calculation, read-only security model,
fal.ai pipeline or production finance fixture was changed. No buy/sell behavior was
added. Living World/Pixi scene, camera, artwork, settlement, wanderer and update loop
were not modified.
