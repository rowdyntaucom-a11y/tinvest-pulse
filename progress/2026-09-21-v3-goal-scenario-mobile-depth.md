# QVANIX v3 — Goal scenario real-device depth pass

Date: 2026-09-21

## Evidence
Samsung Internet screenshots/video showed the Goal scenario becoming a long wall of equally weighted controls and result cards. The scenario itself was usable, but the hierarchy hid the answer below setup detail.

## Product decision
Apply the canonical “first screen must answer; depth may scroll” rule without changing scenario mathematics or inventing defaults.

## Changes
- Keep the core assumptions immediately visible: horizon, monthly contribution, inflation, price change and payout yield.
- Move contribution indexation and optional index scenario into one explicit advanced disclosure.
- Keep reinvestment explicit; never infer it.
- Promote final capital and progress to the primary result pair.
- Move secondary result decomposition behind “Разбор результата”.
- Reduce repeated explanatory copy on narrow phones while preserving the full methodology note.
- Correct whitespace normalization in numeric input parsing; no scenario defaults or methodology changed.
- Preserve historical bootstrap as a separate mode and preserve fail-closed calculation gating.

## Regression boundary
Goal Scenario Lab tests assert the disclosures, result hierarchy, numeric whitespace parsing, narrow-phone hierarchy, no expectedYield/buy/sell semantics, and existing scenario/history labels.
