# V3 fal.ai production art pipeline — 2026-09-22

## Scope
Replaces the unsafe idea of browser-side generation with a server-only, budget-gated production art path for the approved QVANIX theme quartet.

## Delivered
- Added `@fal-ai/client` only to the server runtime boundary.
- Added `GET /api/art/health`, which reports configuration booleans without revealing secrets or spending credits.
- Added `POST /api/art/generate`, protected by a separate `QVANIX_ART_TOKEN`; requests without the gate cannot spend fal credits.
- Model allow-list is intentionally narrow: `fal-ai/flux-2/turbo`.
- Output is one WebP per request with bounded dimensions, safety checking and prompt expansion.
- Locked the approved Samurai / Cosmos / Light / Aurora art direction in `art/theme-prompts.json`.
- Added a regression contract that rejects embedded FAL secrets and guards the four-theme prompt set.

## Data / finance boundary
No financial methodology, broker data contract, analytics formula or canonical Asset Workspace behavior changed.

## Next production step
Use the protected route to generate low-cost portrait candidates, review them as art assets, commit only approved files under `public/assets/themes/`, then remove the rejected CSS-drawn Samurai geometry and map the four approved worlds to the existing shell system.
