# QVANIX — Universal Responsive Requirements

Status: HARD PRODUCT REQUIREMENT
Last updated: 2026-09-13

## Product rule

QVANIX must not be designed for one phone, one desktop, one aspect ratio or one fixed resolution. The same product must remain usable on real-world smartphones, tablets, laptops and desktop PCs across narrow, wide, portrait and landscape browser viewports.

Samsung/Android remains an important validation device because it exposed real density problems early, but it is no longer the product boundary. It is one test target inside a universal responsive matrix.

## Required behavior

1. No screen may depend on one fixed pixel width/height to remain usable.
2. Core information must remain visible and legible without horizontal page scrolling.
3. Layout may reflow, stack, collapse, paginate or use an explicit local drill-down when the viewport becomes narrow; it must not solve density by shrinking important text below a readable floor.
4. Wide desktop space must be used intentionally: panels may form additional columns or gain breathing room, but text lines and charts must not stretch to unusable widths.
5. Portrait and landscape orientation must both work.
6. Browser zoom and OS text scaling must not make core navigation or critical financial values unreachable.
7. Touch targets must remain usable on phones/tablets; hover must never be the only way to discover required information.
8. Keyboard navigation/focus must remain usable on desktop.
9. Charts/canvas/Pixi content must resize from the actual container/viewport rather than assuming one device resolution.
10. Safe-area insets, browser chrome and dynamic viewport height must not hide navigation or critical controls.
11. Content overflow must be deliberate. The default shell should avoid page-level horizontal overflow; dense advanced detail may use explicit local scrolling only when reflow/pagination would reduce clarity.
12. Financial semantics, methodology and provenance must not disappear merely because the screen is small. Compact labels may change presentation, not meaning.

## Validation matrix

This is a representative regression matrix, not a device whitelist. Passing only these sizes is not sufficient; the layout must be fluid between them.

- Narrow/foldable phone: ~280–320 CSS px width.
- Common phones: ~360 / 375 / 390 / 412 / 430 / 480 CSS px.
- Tablets/small windows: ~600 / 768 / 820 / 1024 CSS px.
- Laptop/desktop: ~1280 / 1366 / 1440 / 1536 / 1920 CSS px.
- Large/HiDPI/ultrawide: ~2560 / 3440 CSS px and equivalent scaled browser viewports.
- Portrait and landscape where meaningful.
- At minimum, regression checks should include Chromium-family desktop/mobile behavior; Safari/WebKit and Firefox compatibility must not be broken by device-specific CSS assumptions.

## Responsive implementation principles

- Prefer fluid CSS grid/flex layouts, `minmax()`, `clamp()`, intrinsic sizing and container-aware reflow over device-name breakpoints.
- Use breakpoints where content actually becomes constrained, not because a specific handset model has that width.
- Avoid fixed `min-width` on the page/root that forces horizontal scrolling on narrower devices.
- Avoid fixed heights for content-rich panels unless overflow/reflow behavior is explicitly defined and tested.
- Do not use tiny typography as the primary technique for preserving a one-screen layout.
- Desktop is not simply a stretched phone: use available width to improve hierarchy, comparison and scanability while keeping one consistent information architecture.
- Responsive behavior must be tested after every UI/CSS change that can affect shell density or navigation.

## Definition of done for UI work

A UI change is not complete merely because it looks correct on the current Samsung screenshot. It is complete only when:

- no unintended horizontal page overflow appears across the supported viewport range;
- navigation and primary actions remain reachable;
- critical numbers/labels are not clipped or hidden behind ellipsis without another visible/touch-accessible representation;
- core text remains readable;
- layout remains coherent on both narrow mobile and wide desktop;
- any local scroll/pagination/collapse behavior is intentional and does not hide required methodology or data-quality states;
- charts/world canvas resize without distortion or stale dimensions.

## Current known gap to audit

The current v2 stylesheet still contains device-oriented assumptions, including a root `body { min-width: 320px; }` and multiple mobile-specific density compromises. These are not automatically wrong, but they must now be reviewed against the universal requirement. Future responsive passes should remove device-specific constraints when they cause overflow/clipping and add desktop/tablet behavior where the current mobile-first shell merely stretches rather than reflows.
