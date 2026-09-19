# QVANIX v3 — guided public demo tour

Date: 2026-09-20

## Why
The credential-free public demo existed, but a new visitor still had to infer the product hierarchy alone. The immediate UX roadmap prioritizes comprehension before scale work.

## Implemented
- added a four-step guided tour over the existing isolated demo;
- explains the product in the intended order: Pult → Portfolio → Analytics → Income/Goal;
- keeps synthetic-data disclosure explicit and repeats that demo data is not broker-connected;
- explains the non-advisory boundary and that Goal scenarios are not forecasts;
- provides a restrained CTA to `/v3/` for opening the user's live portfolio path;
- tour can be closed and reopened without persistence or tracking;
- mobile layout respects safe areas and remains above the bottom navigation;
- no broker requests, analytics SDK, storage, financial methodology or Pulse permissions were added.

## Validation gate
Dependency security check, production build and the complete v3 regression suite must pass in CI before merge. After squash merge, verify the exact merged SHA on Render.
