# Income hero mobile readability v1

## Scope

Presentation-only mobile readability adjustment in `v2/src/mobileReadability.css`.

## Finding

The direct supporting line inside `.income-hero` was still forced to `6.9px` under the mobile breakpoint, below the newer readability floor used by surrounding secondary labels.

## Change

- raise `.income-hero > small` from `6.9px` to `7.2px`
- add `line-height: 1.2` to keep the supporting line compact
- no layout, spacing, data, semantic color, animation, calculation or runtime-state changes

## Boundaries preserved

No changes to TWR/XIRR, IMOEX/benchmark arithmetic, Portfolio/Income/Health/Risk/Drift calculations, payouts/tax, broker/T-Invest API, backend/routes/server, storage/schema, access policy, trading behavior, or financial/DNA runtime state.

Parallel Board/Q-LENS PR #289 remains untouched.

## Merge gate

Merge only after full v2 CI is green and a final race-check confirms `main` is still the branch base or the change has been safely refreshed onto current `main`.
