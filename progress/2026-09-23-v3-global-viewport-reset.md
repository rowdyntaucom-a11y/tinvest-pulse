# 2026-09-23 — Global viewport reset after Samsung review

Source: Samsung recording `1000031414.mp4`.

## Finding

The vertical scrollbar was visible not only on secondary Samurai chapters, but also on the cinematic Home screen. That means the issue was broader than a single cockpit.

The V3 document had never reset the browser's default `body` margin. A full-height `100dvh` app inside a body with browser-default vertical margins can make the document taller than the visual viewport even when every app screen is internally sized correctly.

## Fix

- Reset `html`, `body`, and `#root` margin/padding to zero.
- Pin their width to 100%.
- Give `body` and `#root` a stable minimum viewport height.
- Keep horizontal overflow suppressed globally.

This is a foundational viewport fix for every V3 shell and removes the browser-default geometry from the layout equation.

No finance, API, trust, navigation or DNA behavior changed.
