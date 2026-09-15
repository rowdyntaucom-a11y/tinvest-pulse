# Board rail mobile readability v1

## Scope
Presentation-only device-QA pass for the QVANIX Board context rail on mobile.

## Device finding
The Samsung screenshot after PR #327 confirms the primary navigation fits cleanly, but the four context-rail cards clip meaningful status text into fragments such as the source name and payout/rate notes. The issue is hierarchy/readability, not missing data.

## Change
- keep the existing four-column rail and its data ownership
- reduce rail horizontal padding slightly to recover usable width
- raise the rail kicker/supporting copy above the previous micro-copy sizes
- allow `strong` and `small` status lines to wrap instead of forcing ellipsis
- tighten tracking/line-height so the added readability does not create unnecessary vertical expansion

## Safety boundaries
No changes to Board data, Portfolio/Income/Health/Risk/Drift calculations, TWR/XIRR, IMOEX/benchmark arithmetic, payouts/tax, broker/T-Invest API, backend/routes/server, storage/schema, access policy, trading behavior, navigation state, or financial/DNA runtime state. No new animation or synthetic data.

Parallel PR #289 remains untouched.

## Merge gate
Merge only after reviewing the final diff, full v2 CI success, confirmation that current `main` still matches branch base `1f7bbffa59f16ef2709805438d50f2f218cf426a`, and a final mergeability/race-check.