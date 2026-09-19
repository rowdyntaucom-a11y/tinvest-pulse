# QVANIX v3 — live refresh and recovery

Date: 2026-09-19

## Why
The v3 runtime loaded the portfolio only once at mount. That contradicted the product requirement for automatic freshness and left transient broker/network failures without a user-controlled recovery path.

## Implemented
- refresh current portfolio/trust state every 60 seconds;
- refresh after returning to a visible/focused app when the previous attempt is old enough;
- prevent concurrent refreshes and ignore stale request completions;
- preserve the last confirmed snapshot in memory when a later refresh is partial/stale/fallback/error, while keeping financial UI fail-closed until a new verified LIVE result arrives;
- add `Обновить сейчас` to the canonical data-state panel;
- expose last refresh-attempt time and an in-progress state;
- keep the recovery action touch-safe on mobile and shell-aware;
- extend the existing canonical data-state regression with refresh/focus/race/preservation contracts.

## Methodology / trust
No financial calculation, benchmark, payout, history or scenario methodology changed. Non-LIVE states still remove financial values from v3 calculation/presentation inputs. A cached/previous confirmed snapshot is never relabelled LIVE.

## Validation gate
Merge only after the relevant v3 dependency security check, production build and full v3 regression suite are green. Then verify the exact merged SHA on Render.
