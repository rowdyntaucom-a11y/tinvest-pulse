# QVANIX v3 — Goal Scenario Lab

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `5b6673ff5d757427141ccdebfffa1d7d31b3b6f2`
- Branch: `v3/goal-scenario-lab-v1`
- Continues Product Depth after verified Income calendar/source depth.

## Product problem
Goal was still the shallowest primary workspace in v3. It correctly showed current progress and milestones without inventing a future return, but Detailed mode did not yet expose the reviewed deterministic scenario engines already present in v2.

The approved product direction explicitly calls for Goal scenario UX while keeping forward-looking assumptions user-authored and clearly separated from historical diagnostics.

## Implemented

### 1. Canonical scenario adapter
Added `goalScenario.ts`, reusing:
- `calculateGoalProjection` v1.0
- `calculateMonteCarlo` v2.1

No competing projection or bootstrap formula was introduced in v3.

### 2. Deferred Scenario Lab
Detailed Goal now lazy-loads a separate Scenario Lab only when:
- Goal has a positive user-defined capital target;
- live portfolio data are trusted;
- current capital is available;
- interface mode is Detailed.

The compact Goal first screen remains unchanged.

### 3. User-authored deterministic goal scenario
The scenario form deliberately starts with blank future assumptions.

QVANIX does not auto-fill:
- horizon;
- monthly contribution;
- annual contribution growth;
- inflation;
- price return;
- payout yield;
- benchmark return.

The existing user target is reused as the scenario goal. Current capital comes from the trusted live portfolio snapshot.

The canonical projection then exposes:
- terminal nominal capital;
- terminal real capital;
- inflation-adjusted nominal target;
- final progress vs inflation-adjusted target;
- cumulative user contributions;
- scenario-only target crossing point;
- payouts kept outside capital when reinvestment is disabled;
- optional benchmark scenario under the same contribution path;
- annual trajectory chart.

### 4. Explicit scenario semantics
The UI states that:
- assumptions belong to the user, not QVANIX;
- scenario crossing time is not a promised date;
- no recommendation is produced;
- the scenario is not a forecast or guarantee.

Invalid inputs fail through the canonical projection boundary rather than being silently normalized.

### 5. Historical TWR bootstrap range
A second independent tab adds the reviewed historical block-bootstrap engine.

Available user-selected horizons:
- 1 year;
- 3 years;
- 5 years;
- 10 years.

The engine keeps its canonical rules:
- TWR history only;
- minimum 60 daily returns;
- mature status at 252 returns;
- 5-day historical blocks;
- deterministic seeded bootstrap;
- conflicting same-date TWR history fails closed;
- extreme one-day observations follow the canonical v2 exclusion policy and are disclosed by the engine;
- 2,000 paths in the product surface.

The UI exposes:
- P10 terminal value;
- median terminal value;
- P90 terminal value;
- corresponding terminal returns;
- sample dates;
- number of historical returns;
- maturity status;
- simulation count and block length.

### 6. Bootstrap trust boundary
The bootstrap explicitly does NOT model:
- future contributions;
- inflation;
- payout assumptions;
- composition changes;
- probability of hitting the user's goal.

It is shown as a historical scenario range, not a probability forecast.

### 7. Explainability
Added contextual help topics:
- Goal scenario
- Historical block bootstrap

The existing Goal progress explanation remains intact.

### 8. Performance
Scenario code and Scenario Lab CSS are imported only by the lazy Goal Scenario Lab chunk.
No global registration of the new scenario stylesheet was added.

## Trust guarantees
- No hidden future-return assumption.
- No default inflation assumption.
- No invented contribution plan.
- No target-date forecast from current CAGR/XIRR.
- No broker expectedYield in Goal scenarios.
- No recommendation or strategy ranking.
- No Monte Carlo output below the reviewed minimum history.
- No conflicting TWR history accepted.
- No LLM-generated financial calculation.

## Regression coverage
Added:
- canonical goal-projection deterministic fixture;
- invalid projection gate;
- mature historical-bootstrap fixture;
- short-history bootstrap gate;
- conflicting-date bootstrap fail-closed fixture;
- Scenario Lab UI/copy/input contracts;
- lazy JS/CSS boundary contract;
- metric explainability integration.

## Validation
- dependency security gate: success, 0 vulnerabilities.
- TypeScript/Vite production build: success.
- full v3 regression suite: success.
- canonical goal scenario engines regression: success.
- Scenario Lab UI trust contracts: success.
- deferred Goal Scenario Lab bundle contract: success.
- initial JS: 279.25 kB / 86.16 kB gzip.
- initial CSS: 82.58 kB / 14.18 kB gzip.
- deferred Goal Scenario Lab JS: 20.36 kB / 6.58 kB gzip.
- deferred Goal Scenario Lab CSS: 9.02 kB / 1.81 kB gzip.
- Codex automated review did not run because the connected review quota is exhausted; no code finding was produced.
- final exact-head CI, squash merge and Render exact-SHA live verification remain before completion.

## Remaining physical-device validation
Still not performed in this pass:
- Samsung Internet;
- Chrome Android;
- 360–430 px actual hardware;
- touch/keyboard behavior of numeric scenario inputs;
- horizontal year scrubber on a physical phone.
