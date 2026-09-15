# QVANIX — Asset Intelligence / Snowball Depth Epic

Date: 2026-09-15
Branch: `qvanix-asset-intelligence-epic`
Starting product SHA: `c12f1acbda7d8aeae442e8bd7450d5cf70a650d2` (checkout did not contain a local `main` ref or configured Git remote; this was the supplied product HEAD).

## State found before development
- v2 already had a strict T-Invest-only fundamentals normalizer, fail-closed zero semantics, asset-history and transaction-marker boundaries, semantic/official-brand instrument badges, portfolio position attribution, and a canonical Income payout snapshot.
- There was no backend `GetAssetFundamentals` route and no reusable visible asset/company workspace.
- Portfolio history and current-asset history were separate at the data layer, but there was no asset history UI.
- Analytics had deep deterministic risk/scenario modules, but no shared holdings filter/dimension/preset model.

## Architecture and implementation
- Added a private backend bridge `instrumentUid -> exact current position -> official metadata assetUid -> InstrumentsService/GetAssetFundamentals`. The token remains server-only. Invalid, foreign, ambiguous and unsupported identity fails closed. Exact response identity is required and cached privately.
- Extended the existing fundamentals normalizer rather than creating a second implementation. Official field aliases are normalized and zero remains unavailable.
- Added one lazy-loaded canonical Asset workspace, reached from Portfolio, Income, and Analytics. It owns overview, classical fundamentals/QVANIX dual view, asset history, Income linkage, concentration/risk availability, and position detail.
- QVANIX score remains explicitly gated: no score or recommendation was invented.
- Asset history reuses `/api/asset-history` and requires exact UID/FIGI identity. No interpolation is performed.
- Income detail reuses the payout snapshot and `buildIncomeSourceRows`; fact and future gross schedule remain separate.
- Added a lazy Analytics holdings explorer. Filters, sorts, dimensions and presets operate on one canonical `PositionSnapshot[]`. Missing issuer/sector/currency classification is accumulated as unavailable rather than guessed.
- Both deferred workspaces own vertical depth; filter strips use local horizontal scrolling on narrow viewports, never page-level overflow.

## Verified sources and unavailable data
- Fundamentals: official T-Invest `InstrumentsService/GetAssetFundamentals` only.
- Prices/position: current T-Invest portfolio snapshot.
- History: official T-Invest `GetCandles` through the existing verified endpoint.
- Income: existing T-Invest operations/scheduled payout boundaries.
- Instrument-level risk contribution remains unavailable because no existing verified boundary exposes it.
- Issuer/sector/currency grouping is partial: only normalized metadata already present on a position is used. No enrichment guesses.
- Transaction markers are not drawn in this pass: the existing endpoint is verified, but the compact bar-history visualization cannot place event time/value accurately without inventing marker price geometry.

## Methodology / council review
- **Quant:** no TWR/XIRR/IMOEX/Risk/Income/Bond formula changed; expectedYield remains accumulated broker P/L, never daily return; fact and forecast are not added; missing values remain missing.
- **Code:** shared boundaries are reused; asset and holdings UI are split and lazy-loaded; endpoint validates identity and keeps credentials server-side; API failures and unsupported instruments fail closed.
- **Mobile:** controls meet the existing 36–40px floor, long screens scroll vertically, navigation/filter rows scroll locally, content grids collapse to one column, and no fixed page width was introduced.
- **Release:** no trading behavior, entitlement restriction, credential exposure, DNA/Pixi ownership change or bundle-budget increase.

## Validation
- `npm run test:core`: passed, including new holdings filtering/sorting/classification regression.
- `npm run build`: passed. Main JS 458.66 kB raw / 139.39 kB gzip; Asset workspace 13.42/4.70 kB; Holdings explorer 4.65/2.01 kB; deferred Pixi 505.95/145.54 kB. Existing raw per-chunk budgets remain unchanged and pass.
- `node --check production-v162.js` and `git diff --check`: passed.
- Automated browser screenshot was unavailable because the supplied container has no Chromium/browser binary.

## CI / PR / Render
- Local checkout has no Git remote or local `main` ref. PR creation is delegated to the environment PR tool after commit.
- GitHub v2 build, automated review comments, merge, and Render state/deploy cannot be truthfully observed from this checkout before a hosted PR exists. No merge or manual redeploy was attempted.

## Recommended next step
Run the production bridge against a credentialed test account with a supported share UID and capture the exact official response-field coverage. Then add transaction markers to a proper point-addressable asset chart and enrich issuer/sector metadata through a separately verified official normalization boundary.
