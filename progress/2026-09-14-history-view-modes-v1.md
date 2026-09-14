# QVANIX · History view modes v1

Date: 2026-09-14
Starting main: `0dbd1ff7c4833299f871507fab098a82dc9bc5e6`
Branch: `qvanix-history-view-modes-v1`

## Goal

Move the Portfolio history experience further toward the approved Snowball-like interaction model without copying Snowball styling and without adding a second history widget.

## Implemented

- The existing Portfolio history chart now has two views inside the same widget: `ПОРТФЕЛЬ` and `С IMOEX`.
- `ПОРТФЕЛЬ` shows only the portfolio normalized history and transaction-date markers, with its own scale based only on portfolio values.
- `С IMOEX` keeps the existing paired benchmark view, spread shading, paired-date narrative and benchmark coverage.
- The IMOEX view fails closed: if the selected period has fewer than two benchmark points, the comparison control is disabled and the portfolio-only view is used.
- Existing period controls remain unchanged and apply to both views.
- Transaction markers remain date-only; no execution-price coordinate is reconstructed.

## Guardrails

- No new financial series, forecast, alpha claim or return formula was introduced.
- No metric was duplicated into another screen; this is progressive disclosure inside the existing history card.
- No backend/API, broker access, auth/subscription enforcement, credentials, payment/legal text or DNA runtime changed.
- The presentation remains native Russian except accepted metric/index names such as IMOEX.

## Council review

Quant: both views consume the same normalized history rows. The comparison narrative remains based on the latest same-date finite portfolio/IMOEX pair.

Code: change is isolated to `HistoryChart.tsx` and its existing marker/control stylesheet.

Responsive/mobile: controls wrap into two compact rows on phone widths; below 390px the period row may scroll locally rather than shrinking labels or creating page-level horizontal overflow.

Release: merge only after green v2 CI, current-main refresh check and settled preview/production Render queues.
