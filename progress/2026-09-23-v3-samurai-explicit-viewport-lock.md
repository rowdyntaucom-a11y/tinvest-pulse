# 2026-09-23 — Samurai explicit viewport lock

Source: Samsung recording `1000031414.mp4`.

## Recording finding

The right-side Android Chrome scrollbar remained visible even after the previous root/document lock. That means the browser still considered some ancestor scrollable despite the chapter canvas itself fitting.

## Fix

- V3App now exposes an explicit `data-viewport-lock` state for fail-closed Samurai Assets / Analysis / Income / Goal.
- In that state the entire app shell is `position: fixed; inset: 0; height: 100dvh; overflow: hidden`.
- Decorative global layers are pinned to the same viewport.
- Internal secondary pages explicitly suppress browser scrollbar rendering.
- Home is not affected, so its two-stage cinematic → analytics scroll remains intact.
- Trusted pages are not affected, so real data/detail screens may scroll normally when needed.

No finance, API, trust, navigation or DNA behavior changed.
