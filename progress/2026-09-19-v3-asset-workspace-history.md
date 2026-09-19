# QVANIX v3 — Canonical Asset Workspace + Verified History

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `4a0b35f6faebee3d9df6673ac68c480f130860f7`
- Branch: `v3/asset-workspace-history-v1`
- Continuation after the merged historical-depth pass.

## Product problem
V3 Assets had a useful list/inspector but still stopped at position-level detail. The richer canonical Asset Workspace already existed in v2, including the verified `/api/asset-history` boundary, but v3 had no dedicated asset drill-down. Users could inspect quantity/price/weight yet could not move naturally from a portfolio position into source-backed instrument history.

## Implemented
1. Added a canonical v3 Asset Workspace reached directly from every trusted asset row.
2. Workspace keeps top-level IA stable; it is a drill-down, not a sixth workspace.
3. Added sticky mobile-safe Back action and hides bottom navigation while the asset drill-down owns the screen.
4. Added three focused surfaces:
   - Overview: current value, portfolio share, cumulative broker P/L and quantity.
   - History: official GetCandles history with 3M / 6M / 1Y / All periods.
   - Position: quantity, average price, cost basis, current price/value and portfolio share.
5. Reuses the existing normalized v2 asset-history API instead of creating a duplicate data source.
6. Exact identity is fail-closed:
   - requests use trimmed `instrumentUid`, falling back to FIGI only when UID is unavailable;
   - a history series must match exactly one current identity;
   - integrity must be `VALID`;
   - at least two real points are required.
7. History windows anchor to the latest real source point. Sparse windows fall back to two real dated points instead of fabricating samples.
8. Historical chart includes observed price change, min/max and point count. Copy explicitly states source, non-interpolation and non-forecast semantics.
9. Shell-aware Core/Horizon/Carbon styling and narrow mobile handling were added.

## Methodology / data guarantees
- No broker/API/server changes.
- No financial formula changes.
- `expectedYield` remains cumulative broker P/L context and is never called a daily move.
- No missing value becomes zero for history.
- No history interpolation.
- No duplicate Asset Workspace data boundary.
- No trading recommendations.

## Accessibility / mobile
- Asset tab buttons expose current state.
- History period control reuses the accessible `aria-pressed` component.
- Asset row open action is touch-safe.
- Sticky Back sits below the persistent QVANIX shell/context chrome.
- Bottom nav is intentionally hidden during asset drill-down to keep one navigation owner.
- 359 px fallback stacks the asset hero without shrinking critical values.

## Regression coverage
- Added deterministic asset-history window logic test.
- Added workspace contract test for exact identity, integrity, data provenance, navigation and mobile touch rules.
- Registered both tests in the v3 test suite.

## Validation
- GitHub v3 build CI: success.
- Dependency security gate: success, 0 high vulnerabilities.
- Production build split: initial JS 270.28 kB / 83.23 kB gzip; deferred Asset Workspace chunk 10.47 kB / 3.81 kB gzip; CSS 60.20 kB / 10.99 kB gzip.
- All v3 tests passed, including the new asset workspace and asset-history lens regressions.
- Automated code review did not run because the connected Codex review quota was exhausted; no review finding was produced.
- Remaining real-device validation — Samsung Internet + Chrome Android:
  1. Open an asset from Simple and Detailed lists.
  2. Back returns to the same Assets workspace.
  3. Bottom nav stays hidden only inside the asset drill-down.
  4. History loading/unavailable states do not flash fake values.
  5. 3M/6M/1Y/All controls fit at 360–430 px.
  6. Chart remains legible in Core/Horizon/Carbon.
  7. Sticky Back does not overlap the context bar or data-state surface.
  8. Long instrument names wrap without horizontal page overflow.

## Recommended next pass
After device validation, extend this same canonical workspace with already verified fundamentals/income boundaries from v2 rather than adding parallel v3 fetch logic.
