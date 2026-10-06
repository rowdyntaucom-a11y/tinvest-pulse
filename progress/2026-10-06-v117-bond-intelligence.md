# QVANIX v117 — Bond Intelligence

Date: 2026-10-06

## Scope

Large Snowball-parity+ depth pass for the professional tools workspace. Adds a dedicated read-only bond intelligence module based only on current PositionSnapshot and verified BondMetadata.

## Delivered

- new `Облигации` tool in the professional toolbox, lazy-loaded and state-preserving;
- bond sleeve value/share and open P/L context;
- metadata coverage for bond, maturity and coupon-type fields;
- maturity ladder by current capital: <=1y, 1-3y, 3-5y, >5y, perpetual, unavailable;
- issuer concentration by current capital;
- coupon structure: fixed/floating/unconfirmed;
- nominal-currency metadata distribution;
- exact bond ledger with search, filters and sorting;
- explicit fail-closed copy for YTM, duration, coupon cash flows and credit ratings when absent from source;
- mobile layouts for <=680px and <=430px; no SVG circles/bubble maps;
- reduced-motion and content-visibility safeguards;
- regression coverage in `bondIntelligenceV117.test.ts`.

## Non-goals / preserved boundaries

No order entry, broker writes, buy/sell signals, target prices or target yields. Existing TWR/XIRR/CAGR/IMOEX, broker recovery, trust semantics and DNA/Living World are untouched.
