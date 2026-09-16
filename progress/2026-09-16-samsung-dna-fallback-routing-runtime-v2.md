# Samsung DNA fallback routing runtime v2 — 2026-09-16

## Factual base
- Fresh branch from post-Data-Trust `main` at `14c4a1ecb57bfbfda991db44d45de32c714d4f46`.
- PR #385 is merged; Data Trust coordination gate is closed.
- Stale pre-merge Samsung branch/PR #386 was closed without merge and is not reused.

## Confirmed defect
Real Samsung QA showed that the raised DNA action can be tapped while `LOCAL_FALLBACK` is active, but `App.tsx` evaluates portfolio `LOADING/FALLBACK/ERROR` presentation before the DNA workspace branch. Navigation state can therefore change without Living World becoming visible.

## Runtime boundary
`resolveWorkspacePresentation` makes the intended ownership explicit: DNA is a first-class workspace independent of broker availability; broker-dependent workspaces retain LOADING/UNAVAILABLE fail-closed states.

## Guardrails
- No financial formulas or broker/API changes.
- No six-column mobile navigation.
- Existing five-column primary rail + distinct raised DNA action remains the architecture.
- No Pixi ownership/ticker/application changes.
- No bundle/security/test weakening.
- Broker-derived values inside Living World must remain fail-closed when trust is unavailable.

## Release gate
Wire the policy into `App.tsx`, register the regression in `test:core`, run full v2 CI/security/build/test/bundle gates, race-check latest main, then merge and verify Render before Samsung device QA.
