# QVANIX · verified instrument badges UI v1

Date: 2026-09-14
Starting main: `eee954a52794479bff851f21a258de5973ffebb2`
Branch: `qvanix-instrument-badges-ui-v1`

## Why

Complete the approved real instrument/issuer badge priority after the v16.1 runtime rollback. The earlier pass established the T-Invest brand-metadata boundary, but did not render it and its nested runtime wrapper was rolled back. This pass keeps v16.0 composition as the reviewed base and adds the badge boundary through one direct v16.2 composition rather than loading v16.0 and v16.1 together.

## Implemented

- Current position rows and the selected-position inspector render T-Invest brand artwork matched only by exact FIGI, then exact instrument UID.
- Artwork URLs are pinned client-side to the reviewed `invest-brands.cdn-tinkoff.ru` host; API payloads cannot redirect image requests elsewhere.
- Missing metadata, a failed endpoint and a failed image all fall back to deterministic asset-class marks for shares, bonds, funds, currency, futures and unknown instruments.
- Logo images are lazy-loaded, decorative to assistive technology, and carry human-readable badge context on the wrapper.
- The badge module is a small separate bundle so the established non-DNA application budget remains green.
- v16.2 restores the route from the validated v16.0/v15.8 composition path without reusing the failed nested v16.1 runtime wrapper.

## Integrity / release review

- No portfolio, P/L, income, risk, goal or other financial formula changed.
- No logo is guessed from ticker/name and no financial data is synthesized.
- Without broker credentials the route fails closed with an empty v1.0 payload; the UI remains usable through class fallbacks.
- T-Invest availability is not treated as a grant of public redistribution rights. Brand/data licensing still requires review before multi-user commercial launch.

## Validation

- Vite/TypeScript production build and bundle budget.
- Full `test:core`, including new matching/CDN/fallback regression coverage.
- Living World runtime-state policy and legacy asset-history regression.
- Syntax checks for the production runtime chain.
- Local runtime smoke: `/v2/` served successfully; `/api/instrument-badges` returned the expected fail-closed payload without credentials.

## Next roadmap checkpoint

Continue with the approved visual payout calendar and explicit event provenance, without estimating or inventing payout dates.
