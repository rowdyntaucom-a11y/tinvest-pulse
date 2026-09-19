# QVANIX v3 — Portfolio Analytics Depth Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `b83b86114ab4810accbdd9e5b7b9f09b244131cf`
- Branch: `v3/portfolio-analytics-depth-v1`
- Continues Product Depth after Assets density + semantic financial meaning.

## Product problem
The v3 Analysis workspace still used several lightweight local calculations while the reviewed v2 codebase already contained stricter, versioned and fail-closed portfolio analytics boundaries. The biggest trust issue was max drawdown: v3 calculated it from raw portfolio value, so deposits/withdrawals could distort the result even though a TWR index is available.

A second unit bug surfaced while deepening Analysis: `PositionSnapshot.weight` is normalized as a 0..1 ratio, while several v3 surfaces displayed it directly with a percent sign. That could turn a 25% position into 0.3% on screen. This pass fixes the unit contract systematically.

## Implemented

### 1. Canonical portfolio analytics adapter
Added `analysisDepth.ts` that reuses the reviewed v2 engines:
- `calculatePortfolioAnalytics`
- `calculateRelativePerformance`
- `calculateRollingRisk`
- `calculateTailRisk`

No duplicate formulas were introduced in v3.

### 2. Five-layer Analysis workspace
Detailed Analysis now has:
- Overview
- Return
- Risk
- Structure
- Market

The top-level app information architecture is unchanged: Analysis remains one of the five primary workspaces.

### 3. Return layer
Uses canonical TWR-first analytics:
- TWR;
- annualized volatility;
- Sharpe;
- Sortino;
- sample range and calc version;
- longest fully available standard rolling window (20 / 60 / 120 / 252D);
- rolling return, volatility, MaxDD and worst day;
- availability markers for each standard window.

Short history is not stretched to one year.

### 4. Risk layer
Uses canonical portfolio/tail methodology:
- TWR max drawdown;
- annualized volatility;
- effective positions = 1 / capital HHI;
- asset-class count;
- historical daily VaR 95%;
- historical CVaR 95%;
- worst TWR day;
- downside-day frequency.

VaR/CVaR remain gated until the canonical minimum history exists. Conflicting same-day TWR history fails closed.

### 5. Market layer
Replaces the old local benchmark arithmetic with canonical relative performance:
- portfolio TWR vs IMOEX on common confirmed points;
- excess return;
- paired-return count and maturity gate;
- Tracking Error;
- Information Ratio;
- Beta;
- correlation;
- sample range and duplicate/conflict context.

Advanced relative coefficients stay hidden until the reviewed minimum paired-return sample is reached.

### 6. Correct max-drawdown methodology
The headline Analysis drawdown now comes from the canonical TWR index, not raw account market value. External cash flows therefore no longer masquerade as portfolio risk.

### 7. Weight-unit correction
Added explicit ratio-to-percent helpers and corrected:
- Assets Top-3 summary;
- every asset-row weight;
- asset-row weight rail;
- Detailed asset inspector weight;
- Home largest-position weights;
- Allocation Donut legend percentages;
- Analysis Top-3, largest position, result breadth, asset classes, bond sleeve and concentration map;
- Asset Workspace fallback position weight.

The normalized internal weight remains a 0..1 ratio; only presentation converts it to 0..100 percent.

### 8. Deferred analytics engine
The Analysis workspace is now lazy-loaded. The heavier canonical analytics code is downloaded only when Analysis is opened, rather than increasing the Home initial JS bundle.

### 9. Explainability expansion
Added contextual definitions for:
- TWR;
- volatility;
- Sharpe;
- Sortino;
- rolling window;
- effective positions;
- tail risk;
- Tracking Error;
- Beta.

Existing v2 glossary definitions are reused for TWR and tail-risk framing where available.

## Trust guarantees
- No invented financial data.
- No new broker/API endpoint.
- No LLM-generated calculations.
- No raw portfolio-value drawdown presented as strategy drawdown.
- No VaR/CVaR before the reviewed sample gate.
- No relative coefficients before the reviewed paired-return gate.
- Conflicting history fails closed.
- TWR and broker snapshot P/L stay separate.
- No trading recommendation or ranking added.

## Regression coverage
- Canonical analytics maturity/conflict regression with 300 deterministic daily points.
- Weight-unit conversion regression.
- Deferred Analysis bundle contract.
- Existing Analysis / benchmark / layers / bonds / breadth / market / semantic-color regressions updated to canonical architecture.

## Validation required
- v3 build.
- dependency security gate.
- full v3 test suite.
- bundle split inspection.
- merge and Render live verification.
