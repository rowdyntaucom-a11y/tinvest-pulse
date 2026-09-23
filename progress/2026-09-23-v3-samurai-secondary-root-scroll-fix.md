# 2026-09-23 — Samurai secondary root-scroll fix

Source: Samsung recording `1000031413.mp4`.

## Recording finding

The previous viewport pass improved the secondary chapter composition, but the white browser scrollbar was still visible on Assets / Analysis / Income / Goal.

The chapter canvases themselves were already clipped correctly. The remaining overflow came from the document/root layout:
- the sticky Samurai topbar declared a 48px height but still used content-box sizing, so its vertical padding/border increased its real footprint;
- the document remained scrollable even for fail-closed cockpits that were intended to be viewport-locked.

## Fix

- Make the Samurai topbar a true 48px border-box.
- When a fail-closed Assets / Analysis / Income cockpit or empty Goal path is active, lock the root document and app shell to 100dvh.
- Preserve exact `calc(100dvh - 48px)` chapter height below the sticky topbar.
- Leave trusted/detail pages and Samurai Home unaffected; those retain their normal internal/document scrolling behavior.

No data, finance, API, trust, navigation or DNA behavior changed.
