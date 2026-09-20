# QVANIX v3 — Guided public demo tour

Date: 2026-09-20

## Why
The public demo foundation is now isolated from live broker data, but a first-time visitor still has to infer what to inspect and why the numbers are safe to explore. The canonical roadmap calls for a guided demo tour, clear privacy copy and progressive onboarding before scale work.

## Implemented
- Added a three-step demo-only introduction covering Pult hierarchy, analytical depth and the demo privacy/trust boundary.
- Explicitly states that demo values are synthetic, not investment advice, and that the demo does not use a broker token or load a personal portfolio.
- Preserved the existing hard boundary: the guide is mounted only by `DemoRoot`; live mode is unchanged.
- Added keyboard navigation (`←`, `→`, `Esc`), modal semantics, focus entry/restoration, 44px controls and a persistent `Как смотреть демо` reopen action.
- Added responsive phone/short-viewport presentation without compressing explanatory copy into the old microscopic density pattern.
- Added a regression that prevents network/data-loader/storage behavior from entering the guide and locks the demo-only wiring.

## Boundaries
No signup/auth/broker-connect CTA is invented because the multi-user identity/connect flow is not implemented yet. This pass improves comprehension without pretending that unavailable product infrastructure already exists.
