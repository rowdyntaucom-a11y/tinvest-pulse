# QVANIX v3 — Home position-result semantics

Date: 2026-09-20

## Why
The Home screen used “Сильнее / Слабее” for broker `expectedYield`. That field is accumulated position P/L, not daily price change or a ranking signal. The wording could therefore be read as a daily mover surface, which violates the canonical data-honesty rule.

## Implemented
- Renamed the pair to `Лучший P/L` and `Слабейший P/L`.
- Added an explicit detailed-mode note that this is accumulated broker position result, not daily price movement or an asset rating.
- Kept the existing fail-closed trust boundary: the pair is hidden to `—` when the snapshot is not trusted.
- Added a regression that forbids the old ambiguous mover wording.
- Registered both the new regression and the previously added accessibility-preferences regression in the canonical v3 suite.

## Product rule
Until a verified previous-session close or official daily-change contract exists, QVANIX must not present broker `expectedYield` as a daily mover, daily return or trading signal.
