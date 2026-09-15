# Visual race audit after Board / Goal changes

## Scope
Documentation-only autonomous visual/animation audit on current `main` `c12f1acbda7d8aeae442e8bd7450d5cf70a650d2`.

## Fresh-main finding
The Samsung device-QA issue that motivated PR #328 has already been addressed on current main by the later Board device-density pass in `v2/src/boardReadability.css`: Board rail status lines wrap to two lines on compact viewports and the six-module region has a reduced minimum height. Re-applying PR #328 through `mobileReadability.css` would duplicate selector ownership and create avoidable CSS layering.

## Parallel-change finding
PR #332 is open and introduces a broad Asset Intelligence workspace plus holdings explorer and backend fundamentals bridge. PR #289 is also still open for Board/Q-LENS copy. Because #332 touches runtime UI integration and #289 touches the same Board copy surface, this audit deliberately makes no runtime/CSS/animation change.

## Decision
- close stale PR #328 without merge
- do not add another blind Board density/readability layer
- do not touch Goal or Asset workspace while parallel runtime work is open
- preserve the real-device Samsung screenshot as the current Board QA reference

## Next visual priority
After parallel runtime changes settle, perform real-device QA on the resulting current main. First inspect Board rail wrapping and six-card vertical density; then inspect any newly landed Asset workspace for narrow-phone overflow/readability. Only open a runtime visual PR when a concrete device-visible gap is confirmed.

## Boundaries preserved
No changes to TWR/XIRR, IMOEX/benchmark arithmetic, Portfolio/Income/Health/Risk/Drift calculations, payouts/tax, broker/T-Invest API, backend/routes/server, storage/schema, access policy, trading behavior, financial/DNA runtime state, navigation state, or data semantics. No synthetic data and no motion added.
