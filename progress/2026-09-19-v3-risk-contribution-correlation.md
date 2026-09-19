# QVANIX v3 — Risk Contribution + Correlation Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `a5652fa9cf2219f084659c87159bd6bee6d6dde9`
- Branch: `v3/risk-contribution-correlation-v1`
- Continues Product Depth after the canonical portfolio-analytics pass.

## Product problem
Portfolio-level TWR, rolling risk, tail risk and IMOEX relative metrics are now canonical in v3, but the Risk layer still cannot answer a key structural question: which current positions account for the observed portfolio variance, and which pairs actually move together on a verified common sample?

QVANIX already has reviewed deterministic engines for current risk contribution and correlation. The remaining work is to connect them to the v3 Risk workspace without weakening identity, sample-size or coverage guarantees.

## Implemented

### 1. Exact market-history identity adapter
Added a v3 adapter around the canonical `/api/asset-history` boundary.
- matches history only by exact `instrumentUid` or FIGI;
- ignores unverified/conflicting series;
- requires at least two price points per series;
- rejects ambiguous multiple-series matches for one portfolio position;
- never falls back to ticker/name matching;
- keeps unmatched and ambiguous tickers visible in provenance.

### 2. Current risk contribution
Reuses `calculateCurrentRiskContribution` v1.4.
The Risk workspace now exposes:
- market-history capital coverage;
- matched positions / portfolio positions;
- common identical return intervals;
- covered portfolio annualized volatility;
- Diversification Ratio;
- effective capital count;
- effective risk-contributor count;
- per-position current capital weight;
- per-position standalone annualized volatility;
- signed contribution to portfolio variance.

Negative signed contribution is explicitly described as possible diversification, not profit and not a quality score.

### 3. Coverage honesty
The real portfolio value from Home is passed into Analysis so market-history coverage is measured against the account total rather than silently assuming that the matched subset equals 100%.

When coverage is incomplete:
- the UI says “volatility of coverage”, not “portfolio volatility”;
- unmatched positions are not treated as zero risk;
- a visible gate explains that the result refers only to the covered subset.

### 4. Correlation depth
Reuses `calculateCorrelationMatrix` v1.3.
The same exact matched asset histories now support:
- count of available pairs;
- minimum/maximum observed Pearson correlation;
- strongest absolute pairs;
- paired-return counts;
- preview/mature sample labels.

Correlation is calculated from returns on identical observation intervals, never from price levels.

### 5. Fail-closed sample gates
Canonical gates remain unchanged:
- current risk contribution requires at least 2 matched assets and 60 common daily return intervals;
- mature current-risk sample = 252 common returns;
- pairwise correlations remain hidden below 60 paired returns;
- mature pairwise sample = 252;
- any included conflicting price series fails the current-risk calculation closed.

### 6. Lazy network depth
The asset-history request exists inside the Risk contribution component, which only mounts when the user opens Detailed Analysis → Risk. Home and other workspaces do not pay the network cost.

The whole Analysis engine remains in its existing lazy top-level chunk.

### 7. Contextual explainability
Added help topics for:
- Risk Contribution;
- Diversification Ratio;
- Correlation.

The copy explicitly separates risk contribution from P/L and warns that historical correlation is not a forecast.

## Trust guarantees
- No ticker/name fuzzy matching.
- No invented asset prices.
- No interpolation.
- No expected-return assumption.
- No personalized rebalancing instruction.
- No “high risk = bad asset” classification.
- No missing position is treated as zero risk.
- No correlation below the canonical minimum paired sample.
- No risk contribution below the canonical common-sample gate.
- Current market-value weights remain separate from broker P/L and TWR.

## Regression coverage
- `riskHistoryAdapter.test.ts`
  - exact UID/FIGI matching;
  - exact covered value;
  - PREVIEW contribution at 69 common returns;
  - signed contribution shares sum to portfolio variance share;
  - correlation readiness;
  - duplicate series for one position is rejected as ambiguous.
- `riskContributionPanel.test.ts`
  - verified asset-history loader;
  - canonical contribution/correlation engines;
  - 60/252 gate presentation;
  - partial-coverage warning;
  - methodology wording;
  - total portfolio value plumbing;
  - mobile horizontal containment.
- Metric-help regression extended with the three new topics.

## Validation
- v3 build: success.
- dependency security gate: success, 0 vulnerabilities.
- full v3 test suite: success, including exact risk-history adapter and contribution/correlation UI contracts.
- bundle split preserved: initial JS 273.77 kB / 84.74 kB gzip; lazy Analysis 52.63 kB / 14.74 kB gzip; shared assetHistoryApi chunk 2.30 kB / 1.06 kB gzip; Asset Workspace 35.88 kB / 10.92 kB gzip; CSS 82.58 kB / 14.18 kB gzip.
- The heavier covariance/correlation logic remains behind the lazy Analysis workspace; the verified asset-history request itself is triggered only when Detailed Analysis → Risk mounts.
- Automated Codex review did not run because the connected review quota is exhausted; no review finding was produced.
- squash merge and Render exact-SHA LIVE verification remain after the final checkpoint CI.

## Real-device follow-up
Samsung Internet / Chrome Android:
1. Risk tab should load without blocking the first Analysis screen.
2. Contribution table must remain contained at 360–430 px.
3. Horizontal table scrolling must not create page-level horizontal overflow.
4. Long Russian ticker/labels must not grow rows unexpectedly.
5. Partial-coverage warning must remain legible above the table.
