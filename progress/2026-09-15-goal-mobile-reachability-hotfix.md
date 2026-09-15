# QVANIX · Goal mobile reachability hotfix

Date: 2026-09-15
Parent release: Goal workspace v1 / PR #330 / `c31ea66e298126817b6efca9b2b8a74429290ed7`
Hotfix PR: #331

## Finding
A post-merge automated review correctly identified a compact-shell interaction bug. At viewport widths <=620px the global v2 shell intentionally uses `100dvh` and hides page-level overflow so dense workspaces can manage their own bounded regions. Goal is a longer single-column workspace and initially did not declare its own vertical overflow region, so lower inputs/results/chart could become unreachable on phones.

## Fix
`goals-view` is now an explicit local vertical scroll container on <=620px while horizontal overflow remains hidden. Overscroll is contained inside the workspace, touch pan-y/momentum behavior is preserved, and bottom safe-area padding keeps the final content reachable above browser chrome.

This is intentional local scrolling under `QVANIX_RESPONSIVE_REQUIREMENTS.md`; it does not re-enable page-level scrolling for compact Portfolio/Analytics/DNA layouts.

## Scope / safety
- CSS-only runtime change.
- No financial methodology, goal projection, broker/API, persistence, entitlement or DNA changes.
- Existing Goal lazy-loading and hard non-DNA bundle budget remain unchanged.

## Verification
PR #331 code commit `95365da133ef9d16739b86109ab8f8dac7813f9c` passed v2 build #554 completely: both dependency security gates, TypeScript/Vite build, full `test:core`, Living World runtime-state regression, asset-history regression and backend/runtime syntax checks.

## Permanent lesson
When a new workspace can exceed compact viewport height, review it against the shell's overflow ownership. Mobile one-screen orientation does not mean clipping; long advanced content must receive an explicit local scroll/drill-down region rather than relying on document scrolling or shrinking typography below readable limits.
