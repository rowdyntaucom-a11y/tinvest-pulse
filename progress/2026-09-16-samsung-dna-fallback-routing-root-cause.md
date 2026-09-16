# Samsung DNA fallback routing — factual root cause

Date: 2026-09-16
Base: `cd8b04813a1fe7023d8d3e8141e151d17f9163c1`

## Real-device evidence

Samsung device QA at 360–412px-class mobile layout shows the accepted five primary destinations plus the distinct raised DNA action. The DNA control is visible and has a normal touch target, but tapping it does not expose Living World while the preview is in `LOCAL_FALLBACK`.

## Root cause

This is not primarily a hit-target-size defect. `PrimaryNavigation` calls `onNavigate('dna')`, and `App.navigateToTab` updates the React tab state. However, `App.tsx` renders `LOADING`, `FALLBACK` or `ERROR` portfolio state before it reaches the workspace switch containing `tab === "dna"`.

Therefore DNA can become the selected workspace while the fallback portfolio panel remains the only rendered content. CSS z-index/pointer safeguards cannot solve this routing gate.

## Required repair

- DNA/Living World must remain navigable when broker data is LOADING/FALLBACK/ERROR.
- Data Trust must remain fail-closed: unavailable broker-derived financial values must not be promoted to LIVE or fabricated for the world.
- Other broker-dependent workspaces retain their existing trust gates.
- Keep the five-column mobile primary flow plus separate raised DNA action; do not restore six micro-columns.
- Add regression proving DNA workspace routing wins over portfolio fallback/error presentation while broker-derived metrics remain unavailable.
- Recheck 360/390/412px, hit-testing, overlays and Samsung touch behavior.

## Superseded checkpoint

PR #384 was closed without merge after real-device QA disproved its assumed fix. This branch is fresh from factual current main and must not transplant stale #380/#383/#384 history.
