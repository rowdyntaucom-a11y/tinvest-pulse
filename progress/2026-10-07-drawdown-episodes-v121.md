# QVANIX v121 — Drawdown Episodes

- Base: LIVE v120 `7c5a33ece15960f05fdcd1bcb692a21bf7496e76`.
- Extends Analytics → Risk from one Max Drawdown number into historical drawdown episodes.
- Detects peak, trough, confirmed recovery, calendar underwater duration, trough-to-recovery duration, and a still-open current episode.
- Uses only finite positive confirmed portfolio history points; invalid rows are excluded and same-date duplicates are deterministically collapsed.
- Ranks episodes by depth, then duration; renders up to five for readable comparison.
- Explicitly historical: no recovery forecast, trading action or recommendation.
- Mobile layout collapses KPIs and episode rails without horizontal collision.
- Regression is part of mandatory `npm test`.
