# QVANIX v3 — Holdings Structure Explorer

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `0a5654fa2dbc6d80237107a8ddaa467d1f6abadc`
- Branch: `v3/holdings-structure-explorer-v1`
- Continues Product Depth / UX-Comprehension after Goal Scenario Lab.

## Product problem
The v3 Assets workspace had a strong compact position list and canonical Asset Workspace drill-down, but its Detailed mode still exposed only a shallow asset-class filter plus two sort modes.

The reviewed v2 codebase already contains deterministic holdings-explorer boundaries for:
- canonical asset-class classification;
- filtering and sorting;
- grouping by class, instrument, issuer, sector and currency;
- fail-closed unclassified value.

The roadmap explicitly calls for a holdings explorer and deeper structure dimensions.

## Implemented

### 1. Canonical holdings explorer reuse
The new v3 explorer reuses:
- `classifyPosition`;
- `filterAndSortHoldings`;
- `aggregateHoldings`.

No second grouping/classification formula was introduced.

### 2. Deep structure dimensions
Detailed Assets now lazy-loads a new Holdings Explorer below the compact position list.

It supports:
- instruments;
- asset classes;
- issuers;
- sectors;
- currencies.

Aggregated views show:
- confirmed value per bucket;
- share of the selected slice;
- classification coverage;
- explicit unclassified value.

Unknown issuer / sector / currency stays unknown instead of being inferred from ticker or name.

### 3. Search and richer filtering
Search can match only currently available normalized fields:
- ticker;
- instrument name;
- instrument type;
- verified bond issuer;
- verified bond sector;
- verified bond currency.

Asset filters now expose:
- all;
- shares;
- bonds;
- funds;
- currency;
- futures;
- other.

### 4. Instrument explorer
Instrument view supports the reviewed v2 sort boundary:
- weight;
- current value;
- cumulative broker P/L;
- name.

Display presets:
- compact;
- result;
- concentration;
- asset card.

Rows still open the one canonical Asset Workspace.

### 5. Bond metadata context
When the bond filter is active, the explorer shows only verified current-position metadata coverage:
- maturity date known count;
- floating-coupon count;
- amortizing count.

No YTM, duration or cash-flow yield is created from incomplete data.

### 6. Classification consistency across v3
Before this pass, Assets, Analysis and Allocation Donut each had their own local string classifier.

Added `v3/src/data/assetClasses.ts` as the v3 presentation adapter over the canonical v2 classifier.

Assets, Analysis and Allocation Donut now share the same classification and Russian labels, including:
- shares;
- bonds;
- funds;
- currency;
- futures;
- other.

This prevents different workspaces from classifying the same position differently.

### 7. Performance
The deep Holdings Explorer and its CSS are lazy-loaded only in Detailed Assets.
The existing compact Assets first screen remains eager and unchanged in purpose.

## Trust guarantees
- No metadata inferred from ticker/name.
- Missing classification remains explicitly unclassified.
- Broker P/L is labelled as cumulative position context, never daily move.
- Concentration means capital share, not VaR or risk contribution.
- No YTM or duration is fabricated.
- No buy/sell recommendation.
- No server/API changes.

## Regression coverage
Added:
- canonical holdings filter/sort/grouping fixture;
- issuer/sector unclassified-value fixture;
- Holdings Explorer UI/trust contracts;
- shared asset-class contract across Assets / Analysis / Allocation Donut;
- lazy JS/CSS boundary contract.

Updated the old asset-class Analysis regression to validate the shared canonical adapter instead of hard-coded local classifier strings.

## Validation required
- dependency security gate;
- TypeScript/Vite production build;
- full v3 regression suite;
- bundle split inspection;
- exact-head CI;
- squash merge if green;
- Render exact merged SHA LIVE verification.

## Remaining physical-device validation
Not performed in this pass:
- Samsung Internet;
- Chrome Android;
- real 360–430 px hardware;
- horizontal filter rail touch behavior;
- search keyboard behavior;
- aggregate-view scroll ergonomics.
