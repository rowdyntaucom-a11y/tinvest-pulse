# QVANIX v3 — guided public demo entry

Date: 2026-09-20

## Why this pass
`QVANIX_MASTER_DIRECTION.md` defines public demo as the first scale/growth step, but the existing `/v3/demo` trust boundary only labelled synthetic data. A first-time visitor still had no compact explanation of where product value lives or a deliberate path from safe demo exploration to the working product.

## Implemented
- Added a three-step, dismissible demo guide layered above the existing synthetic demo.
- The guide explains the Pult-first hierarchy, deeper Assets/Analysis/Income workspaces, and the transition to the working QVANIX surface.
- Added a restrained CTA to `/v3/`; it does not pretend signup/broker-connect exists yet.
- Preserved strict demo isolation: the guide performs no fetches, broker calls, storage writes or deep live drilldowns.
- Added responsive/safe-area treatment for narrow phones and desktop.
- Added regression coverage to the canonical v3 test chain.

## Non-goals
- No analytics SDK or tracking was introduced before privacy/stack review.
- No auth, signup or broker-connect flow was fabricated.
- No financial methodology or data contract changed.

## Next direction
Continue UX/Product Depth. High-value candidates remain Asset Workspace request discipline/data states, adaptive primary navigation including DNA when a canonical v3 ownership boundary is ready, and further first-viewport hierarchy validation on real Android/Samsung captures.
