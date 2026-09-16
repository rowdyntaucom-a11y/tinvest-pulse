# Samsung DNA fallback routing v3 — 2026-09-16

## Factual base
- Fresh branch from post-Data-Trust `main` `14c4a1ecb57bfbfda991db44d45de32c714d4f46`.
- Superseded PR #386 is closed and its stale ancestry is not reused.
- Real Samsung QA showed that tapping DNA while portfolio data is `LOCAL_FALLBACK` leaves the broker fallback panel visible.

## Root cause
`App.tsx` currently evaluates portfolio `LOADING/FALLBACK/ERROR` and unconfirmed-empty gates before workspace rendering, so `tab === "dna"` is unreachable even after navigation state changes successfully.

## Repair boundary
- DNA is an application workspace, not a broker-value claim, so its route must remain reachable under `LOADING`, `FALLBACK`, and `ERROR`.
- Broker-dependent workspaces remain fail-closed.
- DNA financial-quality inputs must remain fail-closed when their eligibility is not confirmed.
- Preserve one Pixi owner/Application/ticker and existing deferred/mobile/reduced-motion safeguards.
- Preserve five primary mobile destinations plus the distinct raised DNA action; do not restore the rejected six-column microtype layout from #380.

## Regression
`workspaceGate.test.ts` locks the routing policy: DNA resolves to `WORKSPACE` for every portfolio status, while broker-dependent workspaces continue resolving to loading/unavailable gates as appropriate.

## Current implementation
The DNA workspace JSX is extracted into `DnaWorkspace.tsx` so the final App routing change can move the same single renderer ahead of portfolio gates without duplicating Pixi runtime ownership.

Do not merge until App integration, full v2 CI/security/build/test/bundle gates, race-check and Render verification are complete.
