# 2026-09-24 — Workspace scroll reset from Samsung 1564

Evidence: `1000031564.mp4`.

## What the recording exposed
The Samurai first-view composition is now strong, but tab switching can briefly inherit the previous workspace's internal scroll position. Because Assets / Analysis / Income use their own vertical scroll owners, resetting only `window.scrollTo(0,0)` is insufficient.

Visible symptom:
- switching tabs can initially show the verification route over the Ronin artwork;
- after the browser/snap settles, the same tab returns to the intended clean first viewport.

## Fix
- workspace changes now synchronously reset both the browser window and the active workspace scroll owner before paint;
- reset runs for workspace, shell and asset-layer transitions;
- horizontal scroll position is reset too;
- no changes to finance/data logic.

## Rule
Any workspace with an internal scroll owner must reset that owner on primary-navigation changes. Browser scroll reset alone is not enough.
