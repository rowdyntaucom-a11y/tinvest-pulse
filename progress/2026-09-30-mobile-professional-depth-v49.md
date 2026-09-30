# QVANIX Mobile Professional Depth v49 — 2026-09-30

This patch follows the real-device mobile recording after v48. The base Core, portfolio, return, payouts and simple/pro experience were already coherent. The remaining friction was concentrated in professional depth: repeated navigation, equal-weight cards, tall lazy-loading blanks and too little context around what a calculation is actually based on.

## Professional Analytics

- Keeps the existing deterministic return/risk/IMOEX engines unchanged.
- Adds an explicit **Основа расчёта** strip with:
  - confirmed history-point count;
  - current-position count;
  - overlapping IMOEX-point count when available;
  - history-integrity state.
- On phone, the professional screen now follows:
  1. header/help;
  2. primary decision;
  3. evidence boundary;
  4. section selector;
  5. detailed module.
- Removes the duplicate three-card section navigation on phone; the custom selector remains the one section-control surface.
- Desktop/tablet retain the richer navigation.

## Portfolio Depth

- Adds a deterministic first-answer summary before the professional section navigation.
- The summary states current top-3 concentration and open-position P/L using already verified portfolio values.
- It is explicitly descriptive and not a quality score or recommendation.
- Tightens the mobile card/nav rhythm so professional depth feels like the same light Core rather than a separate dense product.

## Lazy-loading states

- Replaces tall empty loading cards with compact informative loading rails.
- Core deep modules explain that they are connecting to already confirmed financial data rather than displaying substitute values.
- Professional Tools use the same compact pattern for rebalance/lab/market/report lazy chunks.

## Data honesty

No financial formula or source contract changed.
No missing metric is converted to zero.
No expectedYield is reinterpreted as a daily return.
No trading or order-entry capability was added.
Living World / DNA remains frozen.
