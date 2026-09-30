# QVANIX Result Truth Layer v42 — 2026-09-30

Real-device video after v41 confirmed that live data and the light Financial Core are working, but exposed a semantic problem: the Overview hero showed the portfolio result relative to external cash flows while the Result screen showed the sum of broker expectedYield for open positions. Both numbers were valid, but the UI made them look like the same P/L.

This patch removes that ambiguity without changing financial methodology.

## Changes

- Overview now labels its result explicitly as “Результат с учётом вводов/выводов”.
- Result lead renames the open-position metric to “P/L открытых позиций”.
- Adds a compact Result truth layer with three independently defined figures:
  - overall portfolio result = current value minus net external cash flows;
  - open-position P/L = sum of broker expectedYield for currently held positions;
  - received payouts = verified coupon/dividend income.
- Adds an explicit note that these values answer different questions and are not an additive reconciliation because closed trades, fees, taxes and other operations also affect the account.
- Portfolio sorting now says “По P/L позиций”.
- Every asset row prefixes the broker expectedYield with “P/L” so it cannot be mistaken for daily move.
- Keeps TWR, XIRR and CAGR semantics unchanged and fail-closed.
- Adds a mobile two-column truth-layer layout with the overall result spanning the full width.
- Adds regression coverage and wires it into the V3 CI suite.

## Guardrails

No financial formulas changed. No expectedYield is treated as daily return. No trading. No fabricated values. DNA/Living World untouched.
