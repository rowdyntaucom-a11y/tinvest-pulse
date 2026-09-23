# 2026-09-23 — Samurai trust canvas / secondary chapter refinement

## Trigger
The latest Samsung recording showed that the chapter cockpit is cleaner, but the locked Assets / Analysis / Income screens still read like compact cards floating over a large dark remainder. The repeated red cinematic header also still made the secondary chapters feel too similar.

## Decision
Keep Home as the cinematic Samurai poster. Secondary workspaces become instrument panels. When finance is unavailable, the entire remaining viewport becomes a purposeful locked cockpit rather than an empty page.

## Implemented
- Replaced the repeated secondary red-art treatment with distinct procedural instrument surfaces:
  - Assets: formation / roster grid;
  - Analysis: radar / sight geometry;
  - Income: treasury / ledger rings;
  - Goal: path / torii geometry.
- Reduced secondary page-head height again to move useful state content upward.
- Rebuilt Samurai trust gates as full-height cockpit canvases with a vertical, readable three-step route.
- Added a real “Проверить источник” action wired to the existing refresh pipeline; it never creates or substitutes financial values.
- Added a large low-opacity chapter watermark to use otherwise dead visual space without adding fake data.
- Untrusted Assets / Analysis / Income now stay within a single mobile viewport above the command dock.
- Kept fail-closed semantics, finance formulas, broker/API behavior and DNA untouched.
- Added reduced-motion-safe signal treatment and regression coverage.

## Quality bar
Locked states should feel intentionally designed and operational, not like broken dashboards. They may explain and retry the data pipeline, but must never fabricate portfolio values, performance or income.