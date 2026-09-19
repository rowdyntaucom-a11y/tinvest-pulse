# QVANIX v3 — Historical Depth Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `789a058b67d99bfdade046548a8e810dd92fffa8`
- Branch: `v3/history-depth-pass-v1`
- Trigger: continue the large post-Samsung product pass after PR #454, focusing on a bigger finished cycle rather than isolated cosmetic tweaks.

## Diagnosis
The v3 home chart was still mostly a sparkline. It showed verified history, but users could not inspect meaningful time windows or separate portfolio-value movement from contributed capital. The Analysis benchmark card compared the full available history only, which made period-specific comparison with IMOEX impossible.

## Implemented
1. Added a deterministic history-window model:
   - 3 months / 6 months / 1 year / all history.
   - Window anchor is the latest valid source date, not wall-clock time.
   - Sparse windows fail safely to the last two real dated points instead of fabricating samples.
2. Added a reusable accessible period control with `aria-pressed`.
3. Upgraded Detailed Home history:
   - period selector;
   - invested-capital overlay when verified `invested` points exist;
   - legend;
   - period value delta;
   - min/max range;
   - confirmed invested-capital delta;
   - explicit copy that value change is not portfolio return.
4. Kept Simple Home compact and unchanged in interaction depth.
5. Made Detailed Analysis → Market benchmark period-aware using the same history window boundary, so portfolio and IMOEX remain compared on the same filtered source range.
6. Added shell-aware and 360–430 px responsive styling for the new controls.

## Methodology guarantees
- No broker/API contract changes.
- No financial formulas changed.
- No fabricated daily return, YTM, duration, events or history.
- Value delta remains explicitly distinct from investment return.
- IMOEX comparison still uses only common non-null portfolio/IMOEX points.
- Missing invested-capital history remains unavailable rather than becoming zero.

## Regression coverage
- Extended the history chart contract test.
- Extended the benchmark test with the new period selector.
- Added deterministic history-window logic coverage, including sparse history.
- Registered the new regression in the v3 test command.

## Mobile / accessibility
- Period controls use touch-safe button heights and visible active state.
- Focus-visible is explicit.
- Narrow-phone layout collapses the detailed summary safely below 360 px.
- No new horizontal page-scroll pattern was introduced.
- Reduced-motion behavior remains inherited from the existing v3 shell.

## Validation still required
- Full CI after PR creation.
- Bundle/security gates unchanged.
- Samsung Internet and Chrome Android real-device check:
  1. Simple mode chart stays compact.
  2. Detailed mode period buttons fit at 360–430 px.
  3. 3M/6M/1Y/All switching does not jump layout excessively.
  4. Invested overlay remains visually secondary to portfolio value.
  5. Analysis → Market uses the same selected period for portfolio vs IMOEX.
  6. Bottom nav never overlaps the expanded history summary.
  7. Horizon and Carbon shells keep sufficient contrast.

## Recommended next Epic
After this historical-depth slice is live and device-validated, continue the larger Product Depth track with the canonical Asset Workspace: richer verified instrument history and period detail, preserving exact identity/fail-closed semantics and avoiding duplicate history logic.
