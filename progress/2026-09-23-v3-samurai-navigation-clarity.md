# 2026-09-23 — Samurai navigation clarity after 1000031422

Source: Samsung recording `1000031422.mp4`.

## Findings

- The new internal-scroll secondary chapters are working as intended.
- Assets, Analysis, Income and Goal now have substantially more visual breathing room.
- The fixed grey Samsung Edge handle remains device chrome, not QVANIX scroll UI.
- One UX ambiguity became obvious: the second Home story page was titled `Аналитика` while the persistent bottom navigation still correctly highlighted `Главная`. This visually looked like a navigation-state bug even though it was only the second act of Home.
- Because secondary workspaces intentionally hide scrollbars, their new depth needed a subtle authored affordance.

## Changes

- Rename the second Home act from `Аналитика` to `История портфеля`.
- Rename its scroll CTA from `БОЛЬШЕ АНАЛИТИКИ` to `ИСТОРИЯ И РЕЗУЛЬТАТ`.
- Keep the real top-level `Анализ` destination semantically distinct.
- Add a quiet `НИЖЕ · МАРШРУТ ПРОВЕРКИ` cue between the main Samurai instrument and lower fail-closed detail.
- Preserve hidden browser/internal scrollbar chrome, touch scrolling, bottom navigation and all financial/data semantics.

No finance/API/trust/DNA methodology changed.
