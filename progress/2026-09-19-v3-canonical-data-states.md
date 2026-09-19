# QVANIX v3 — canonical data-state checkpoint

Date: 2026-09-19

## Why
v3 previously collapsed every `safeToDisplay` trust result into UI state `live`. That could label STALE/PARTIAL/FALLBACK data as confirmed even though the canonical v2 trust model explicitly distinguishes those states.

## Change
- Added a pure adapter from canonical `DataTrustStatus` to seven v3 presentation states: loading/live/partial/stale/fallback/error/unavailable.
- v3 deterministic financial surfaces now become trusted only when `verifiedLive && safeToCalculate`; stale, partial and fallback snapshots cannot silently enter the calculation path.
- Data-state copy and visual semantics distinguish partial, stale, fallback, unavailable and error states.
- The state detail explicitly explains the fail-closed boundary.
- Added regression coverage for all seven canonical states and the verified-live calculation gate.

## Methodology boundary
No financial formula changed. This pass only fixes trust/state propagation and presentation. Pulse remains reachable only through trusted Home state and therefore cannot export a stale/partial/fallback snapshot as verified.

## Validation target
Run full v3 tests, TypeScript/Vite build, security audit and relevant GitHub CI before merge. Exact merged SHA must be confirmed on Render before this checkpoint is considered deployed.
