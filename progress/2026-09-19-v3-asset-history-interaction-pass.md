# QVANIX v3 — Asset History Interaction + Provenance Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `b2039128afd61704b8b290bb4db1202b9818ec1d`
- Branch: `v3/asset-history-interaction-v1`
- Continues Track A / Product Depth from the canonical Asset Workspace roadmap.
- The recent external audit was treated as input, not as a replacement roadmap; this pass keeps the existing product sequence.

## Product problem
The Asset Workspace already had verified GetCandles history, period controls, fundamentals, income, identity and observed risk. The remaining history gap was interaction quality: the chart was a passive sparkline with equally spaced observations, no point inspection, no axis context and weak source-freshness visibility.

Equal spacing was especially misleading when verified observations had calendar gaps. QVANIX should show missing intervals honestly rather than visually compressing them into regular spacing.

## Implemented
1. Added a dedicated `V3AssetHistoryChart` explorer inside the lazy Asset Workspace.
2. Replaced index-based horizontal placement with deterministic calendar-time geometry.
   - X position now comes from the real date interval between confirmed observations.
   - Missing calendar intervals remain visible as wider gaps.
   - No interpolation is introduced.
3. Added point inspection:
   - pointer/touch selection directly on the chart;
   - accessible range scrubber for deterministic discrete point selection;
   - selected date;
   - selected verified price;
   - change versus the previous confirmed point;
   - change from the beginning of the selected period.
4. The UI explicitly says that change versus the previous point is not automatically a daily return.
5. Added axis context:
   - min/max price labels;
   - first/middle/last date labels;
   - horizontal guide lines;
   - selected-point guide and marker.
6. Added provenance/freshness context:
   - last confirmed point date;
   - normalized API response coverage when available;
   - explicit T-Invest GetCandles source label.
7. Kept the existing 3M / 6M / 1Y / All period control.
8. Kept min/max/point-count summary and start/end period change.
9. Extracted chart geometry into a pure deterministic `assetHistoryGeometry` helper.
10. Added semantic positive treatment inside the Asset Workspace so selected point deltas do not reuse the generic shell accent as financial meaning.

## Methodology / trust guarantees
- No fabricated candles.
- No interpolation.
- No invented previous-session close.
- No conversion of irregular point-to-point change into “daily return”.
- No wall-clock “fresh/stale” guess. Freshness is presented as the actual last confirmed source date.
- No corporate-event overlays until an exact verified event boundary exists.
- No forecast language or trading recommendation.
- Exact instrument identity and history-integrity checks remain upstream and fail closed.

## Regression coverage
- Added `assetHistoryGeometry.test.ts` to prove irregular calendar gaps produce irregular X spacing.
- Added `assetHistoryInteraction.test.ts` for touch/pointer selection, scrubber, provenance and no-daily-return semantics.
- Updated the Asset Workspace regression after extracting the history explorer.
- Registered both new tests in the full v3 suite.

## Validation
- GitHub v3 build: success.
- Dependency security gate: success, 0 vulnerabilities.
- Full v3 test suite: success, including time-geometry and interaction/provenance regressions.
- Bundle split preserved: initial JS 270.30 kB / 83.22 kB gzip; deferred Asset Workspace 38.08 kB / 11.40 kB gzip; CSS 68.04 kB / 12.09 kB gzip.
- Initial JS is unchanged from the previous live pass; the history explorer remains inside the deferred Asset Workspace chunk.
- Automated Codex review did not run because the connected code-review quota is exhausted; no review finding was produced.
- Remaining real-device validation — Samsung Internet / Chrome Android:
  1. horizontal point inspection must not block normal vertical page scrolling;
  2. range scrubber must remain finger-usable at 360–430 px;
  3. selected labels must not overflow on bond percentage-price history;
  4. Core/Horizon/Carbon chart contrast must remain clear;
  5. wide calendar gaps should be visibly wider than adjacent short gaps.

## Next strategic step
After live validation, return to the unified roadmap rather than an audit checklist. Candidate next work is either:
- reusable metric drill-down / contextual explanation inside the analytical product, or
- a focused Assets explorer density pass if real-device evidence shows overview friction is now the higher-value bottleneck.

The choice should be made from current product evidence, not by external-audit ordering.
