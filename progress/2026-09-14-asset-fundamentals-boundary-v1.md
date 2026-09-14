# QVANIX — Asset fundamentals boundary v1

Date: 2026-09-14
Branch: `qvanix-asset-detail-foundation-v1`
Starting main: `979ab8f9795e9731c995ffca0c498f1c87904c80`

## Purpose
Prepare the verified-data boundary for the future reusable `Asset / Company detail` surface from issue #315 without inventing fundamentals or publishing a premature proprietary score.

## Verified source direction
Official T-Invest documentation still exposes `InstrumentsService/GetAssetFundamentals` for up to 100 asset IDs per request. T-Invest documentation also states that the method is generally used for company/share fundamentals, that data is not available for every asset/field, and that `0` in the response should be treated as missing data rather than a verified zero.

Reference:
- `https://developer.tbank.ru/invest/api/instruments-service-get-asset-fundamentals`
- `https://developer.tbank.ru/invest/services/instruments/head-instruments`

No backend route is added in this pass. Commercial redistribution/licensing remains a separate product/legal gate.

## Implemented
- Added `assetFundamentals.ts` as a typed, deterministic normalization boundary.
- The boundary accepts only payloads explicitly marked `T_INVEST`; arbitrary/scraped payloads fail closed.
- Classical fields are normalized into explicit labels/units: capitalization, P/E, P/S, P/BV, EV/EBITDA, ROE, ROA, ROIC, revenue, EBITDA, net income, FCF, Net Debt/EBITDA and dividend yield.
- Per current official T-Invest guidance, numeric zero from this source is treated as unavailable.
- Added formatter helpers with honest `—` null state.
- Added a QVANIX interpretation boundary that intentionally remains unavailable until a reviewed transparent scoring methodology exists. It exposes only the exact verified raw inputs that a future interpretation would be allowed to use.

## Guardrails
- No hardcoded/demo fundamentals.
- No DOHOD scraping or copied final score.
- No buy/sell recommendation or expected-return assumption.
- No backend/API route, broker credential, subscription, legal-publication, DNA or AI change.
- Classical metrics remain primary; QVANIX interpretation is optional and cannot replace them.

## Tests
`assetFundamentals.test.ts` covers:
- fail-closed source validation;
- T-Invest alias normalization;
- comma-decimal parsing;
- zero-as-missing semantics;
- null formatting;
- interpretation gating;
- exact raw-component exposure without hidden score generation.

The test is registered in `test:core`.

## Next
Issue #315 can now build the visible reusable Asset/Company detail surface on top of this boundary. The next production step should either connect a narrowly scoped verified backend bridge from T-Invest asset UID → `GetAssetFundamentals`, or show an explicit unavailable state until that bridge is ready. The UI must keep the switch `ОЦЕНКА QVANIX | ПОКАЗАТЕЛИ`, with raw classical metrics always accessible.
