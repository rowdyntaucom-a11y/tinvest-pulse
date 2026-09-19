# QVANIX v3 — Assets Density + Semantic Meaning Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `f13df72d923c9189c96f661ccf884457fdeb44ac`
- Branch: `v3/assets-density-semantics-v1`
- Follows the metric-explainability pass.
- This pass pulls selected observations from external audit input only because they now align with the active product bottleneck; the audit did not replace the roadmap.

## Product problem
The canonical Asset Workspace is now deep, but the portfolio overview remained slower to scan than it should be on a phone. Each asset card consumed too much vertical space and required a secondary “Open asset” action even though the whole item conceptually represents a single drill-down target.

Separately, financial meaning was inconsistent: accent color sometimes represented positive performance, while elsewhere green/red represented sign. Accent should describe interaction/selection; positive/negative should describe financial sign.

## Implemented

### 1. Compact, directly actionable asset rows
- The whole primary asset row is now the drill-down control.
- Removed the redundant visible “Открыть актив →” action.
- Preserved an independent inline “Детали” control in Detailed mode for quick position facts.
- Added current broker P/L directly to the scan row with explicit sign.
- Kept current value, portfolio weight, ticker, name, class, rank and weight rail in one compact surface.
- Added a quiet chevron as a drill-down affordance.
- Mobile target height is ~62 px at 430 px and below, significantly denser than the previous card/action stack while staying finger-usable.
- Long names are ellipsized instead of forcing row growth.

### 2. Secondary inspector compression
- Detailed-mode inline inspector is now subordinate to the primary row.
- “Детали” becomes a compact divider action rather than a second full card CTA.
- Inspector cards remain available without duplicating the full Asset Workspace.

### 3. Semantic financial-color system
Introduced shared semantic tokens:
- `--v3-positive`
- `--v3-negative`
- `--v3-neutral`

And consolidated shared shell tokens at `.v3-app`:
- text
- muted
- line
- card
- accent

Core / Horizon / Carbon each provide contrast-appropriate semantic values.

### 4. Applied semantic meaning consistently
- Assets list current P/L.
- Asset Workspace current P/L.
- Home total result.
- Home stronger/weaker current broker P/L.
- Portfolio history period delta.
- Analysis max drawdown.
- Analysis result breadth.
- Portfolio vs IMOEX period values and delta.

Accent color is no longer relied upon as the default meaning of “positive financial result” in these surfaces.

### 5. Product language cleanup
- Replaced the internal-sounding context label “Профессиональный слой” with “Подробный режим”.
- Simple/Detailed architecture itself is unchanged.

## Deliberately not changed
- No portfolio calculation methodology.
- No sort/filter data logic.
- No broker/API boundary.
- No Asset Workspace information architecture.
- No invented daily return.
- No new recommendation or scoring logic.
- No removal of the “Кряхтящий фонд” identity.
- No implementation of an audit-only feature that does not exist in the current v3 source.

## Trust / UX guarantees
- Current P/L remains broker snapshot P/L, not TWR or daily return.
- Positive/negative colors are always accompanied by numeric sign/content; color is not the sole carrier of meaning.
- Whole-row drill-down and inline inspector are separate sibling controls, never nested interactive elements.
- Page-level horizontal overflow remains prohibited.
- Detailed mode keeps quick facts, while the canonical workspace remains the deep destination.

## Regression coverage
- `assetsDensity.test.ts`
  - whole-row drill-down;
  - no redundant visible open-asset CTA;
  - broker P/L in scan row;
  - compact mobile row contract;
  - compact secondary inspector.
- `semanticFinancialMeaning.test.ts`
  - shared semantic tokens;
  - Horizon contrast variant;
  - Home result sign;
  - history delta sign;
  - analysis breadth/benchmark sign;
  - “Подробный режим” language contract.

## Validation
- GitHub v3 build: success.
- Dependency security gate: success, 0 vulnerabilities.
- Full v3 test suite: success, including Assets density and semantic financial-meaning regressions.
- Bundle: initial JS 277.22 kB / 84.98 kB gzip; deferred Asset Workspace 38.13 kB / 11.42 kB gzip; CSS 74.39 kB / 13.11 kB gzip.
- Versus the prior live pass, initial JS grew by ~1.01 kB raw / ~0.16 kB gzip; most of this pass is CSS and semantic wiring.
- Automated Codex review did not run because the connected code-review quota is exhausted; no review finding was produced.
- Two stale contract failures were fixed during CI:
  - context-header test now expects user-facing “Подробный режим”;
  - secondary inspector preserved the existing 44 px accessible touch-target contract while remaining visually compact.
- Remaining real-device validation — Samsung Internet / Chrome Android:
  1. at least ~5–6 compact rows should be scannable in a typical phone viewport after header/summary;
  2. tapping the row opens the Asset Workspace reliably;
  3. tapping “Детали” must not open the Asset Workspace;
  4. long Russian bond names must stay one-line/ellipsized;
  5. positive/negative contrast must remain readable in Core/Horizon/Carbon;
  6. no horizontal overflow at 360–430 px.

## Next strategic step
After live validation, return to Product Depth. Candidate next pass should be larger than a local visual tweak: either a verified portfolio-level risk/return workspace expansion using existing canonical analytics boundaries, or another cross-workspace system pass only if live-device evidence exposes a real bottleneck.
