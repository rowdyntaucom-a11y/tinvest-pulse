# QVANIX — Information Architecture 2.0 + Asset Depth Epic

Date: 2026-09-15
Starting supplied HEAD: `ff3af24679a879c66590bc869813c2d5c45ef1ce`
Branch: `work` (the environment resumed the existing review branch; no `main` ref or Git remote is configured)
Final branch SHA: resolve the commit containing this checkpoint; hosted merge SHA is unavailable locally.

## Decision: first screen answers; depth may scroll
The universal one-screen/no-scroll constraint is retired. Pult remains compact; Portfolio, Analytics, Income, Goal and Asset use the shell's single content scroll owner. DNA retains its immersive overflow model. Horizontal scrolling is limited to navigation/tabs/chip rails. A deterministic `ПУЛЬС` output mode preserves the original one-phone-viewport screenshot goal.

## Audit findings / Samsung root causes
- The mobile shell locked `html/body/root`, `.app-shell` and `.app-view` while several workspace styles also forced `height:100%` and `overflow:hidden`. Deep content was clipped or competed for scroll ownership.
- Top navigation used a fixed grid designed for fewer items; six destinations could wrap, shrink to unreadable text, or isolate DNA on another row.
- Initial `EMPTY` snapshot was rendered as genuine zero capital/zero positions while the broker request was pending.
- Asset UI was code-split correctly, but its fallback did not surface already-known position data; no intent/idle prefetch existed.
- Asset history requested only the endpoint's top-six portfolio positions, so a valid selected instrument outside that ranking could honestly normalize but never appear.
- Selected Asset stored an old position object and did not follow the 60-second live portfolio refresh.
- Unknown backend `/api/*` paths could reach the SPA wildcard and return HTML; legacy `/api/portfolio` now has an explicit JSON 404 outcome if no supported route exists.

## Architecture and implementation
- Added a final IA stylesheet: one mobile `.app-view` vertical scroll owner, local horizontal navigation rails, no root horizontal overflow, readable touch targets, safe-area padding, reduced-motion handling, and explicit DNA exception.
- Added a compact screenshot/Pulse dialog using only the current verified portfolio snapshot.
- Added `LOADING/LIVE/FALLBACK` presentation state. Loading now renders placeholders and explanatory text, never real-looking `0 ₽`.
- Goal and Asset lazy chunks preload together during browser idle time. Asset fallback immediately renders ticker/name/current value from the existing position snapshot, avoiding a blank shell.
- Asset secondary requests start independently with their own loading states and shared AbortController; there is no fundamentals→history waterfall.
- Asset history accepts an optional exact instrument UID. Production ranks top six only for portfolio analytics; a targeted asset request fetches that verified current position independently and has a separate cache key.
- Added exact UID-first/FIGI-fallback `resolveCanonicalAsset`. Ambiguous/missing identity fails closed, while exact selections update from each live portfolio snapshot.
- Fundamentals UI distinguishes loading, official no-metrics, unsupported identity and API/network failure at the boundary. Zero remains missing.
- Added reusable terminal API catch-all policy before SPA fallback. Every unmatched `/api/*`, including unsupported legacy `/api/portfolio`, returns JSON 404 with `no-store`; it cannot return `index.html`.
- CI now runs the API policy regression and watches the policy module.

## Data contracts / gated features
- Fundamentals remain official T-Invest only: current exact instrument UID → instrument metadata asset UID → `GetAssetFundamentals` → exact asset response.
- History remains T-Invest daily candles; duplicates/conflicts/invalid prices use the existing fail-closed normalizer. No portfolio-history substitution or interpolation.
- Income remains FIGI-safe and reuses Income core. Received and scheduled values remain separate.
- Daily movers, VWAP, asset VaR, YTM/duration/yield-to-call and QVANIX fundamentals score remain gated.
- The targeted-history cache is 15 minutes; live position values remain on the uncached 60-second portfolio refresh.

## Council review
- **Quant:** no financial formula changed; missing never becomes zero; expectedYield is still cumulative unrealized broker P/L, not a daily move.
- **Code:** secondary asset calls are parallel/cancellable, selected positions refresh by exact identity, credentials remain backend-only, API wildcard is JSON-only, Pixi ownership is untouched.
- **Mobile:** 360/375/390/430 rules use a one-line scrollable top rail, 40px top-level targets, a single content scroller, safe areas and no page horizontal overflow. Deep fixed-height overrides are neutralized.
- **Release:** bundle limits were not changed; Asset, Goal, Holdings and Pixi remain deferred. No trading, entitlement or security gate was weakened.

## Tests and bundle
- `npm run test:api`: pass; JSON/no-store 404 and no HTML regression.
- `cd v2 && npm run test:core`: pass; adds live identity refresh/ambiguity tests, targeted history URL encoding, explicit fundamentals state tests.
- `cd v2 && npm run build`: pass. Main JS 460.38 kB raw / 140.02 kB gzip; Pulse 1.55/0.80 kB; Asset 14.12/4.91 kB; Holdings 4.65/2.01 kB; Goal 15.26/4.71 kB; Pixi 505.95/145.54 kB. Existing budget unchanged.
- `node --check production-v162.js`, `git diff --check`: pass.
- Browser screenshots could not be captured because this container exposes no Chromium/WebKit binary.

## CI / automated review / Render
The provided checkout has no Git remote and no `main` ref, so a real GitHub PR number, hosted CI, automated review comments, merge SHA and Render API state cannot be truthfully obtained. No merge or manual deploy was attempted. Render service IDs retained for continuation: preview `srv-dahsuejm8hqs73d8ufk0`, primary `srv-daf6i6pt0dsc73cpk5r0`. Both must be verified live on the same future merged main SHA.

## Remaining risks / recommended next Epic
- Validate exact `GetAssetFundamentals` response coverage and targeted candle behavior against a credentialed supported share, bond and fund in preview.
- Replace the compact asset bar history with the existing chart visual language plus touch point selection, axes, periods and verified transaction markers.
- Add an automated Playwright responsive matrix when a browser-enabled CI job is available, including 360/375/390/430 portrait, landscape and text scaling.
