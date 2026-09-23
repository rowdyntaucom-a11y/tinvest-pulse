# 2026-09-23 — Samurai Samsung video polish

## Trigger
A new ~13-second Samsung recording exposed three concrete issues after the large Samurai workspace passes:
- the lazy Analysis transition could briefly become a full-screen generic “Открываем аналитику…” blocker;
- the inherited two-column page-header layout forced long Russian explanatory copy beside the large title and made it spill across the phone;
- on Home, the fixed Samurai command dock again hid too much of the Formation deck below Capital Path;
- Goal with no target looked visually unfinished because the authored hero ended above a large empty dark field.

## Implemented
- Added a compact reusable workspace transition panel instead of full-screen generic lazy fallbacks.
- Added Samurai idle preloading for Analysis and Asset Workspace to reduce visible chunk-load transitions.
- Converted Samurai secondary page headers to a single-column phone stack and reduced their first-screen footprint.
- Added a purposeful no-target Goal path explaining the three deterministic steps without inventing performance or forecasts.
- Reclaimed roughly 50 CSS px on Samurai Home by tightening the hero and Capital Path chart so Formation can re-enter the first viewport above the fixed command dock.
- Kept reduced-motion support and the final mobile performance ownership file last.
- No financial methodology, broker/API, trust-state or DNA behavior changed.

## Visual rule
Large art remains a framing device; it must not create dead screens, hide navigation, push the first answer below the fold, or force text into unreadable side-by-side layouts.