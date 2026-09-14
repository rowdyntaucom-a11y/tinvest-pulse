# QVANIX — Income Calendar visual foundation v1

Date: 2026-09-14

## Scope
Pure deterministic groundwork for GitHub issue #308. No UI is changed in this pass, so it can land independently while the larger calendar interaction pass waits for Codex capacity.

## What changed
- Added `incomeCalendarVisual.ts` as the single pure model for a future 12-month payout ribbon.
- The model builds explicit consecutive month buckets from a verified window start.
- FACT payout events are rejected from the future-calendar model so realized income cannot leak into the confirmed future schedule.
- Month cells expose confirmed-event count, gross amount when available, an explicit gross/count intensity basis and deterministic intensity in `[0,1]`.
- Empty months remain explicit cells with zero intensity rather than disappearing.
- Added exact month filtering for the existing future payout event list.
- Added regression coverage for month boundaries, FACT exclusion, empty months, gross/count intensity fallback, filter behavior and invalid windows.

## Methodology
Visual intensity is presentation-only. If a month has a usable gross amount, its intensity is scaled to the maximum gross amount in the same ribbon with a 0.2 floor for non-empty months. If gross is unavailable, event count is scaled to the maximum event count with the same floor. `intensityBasis` is always exposed so the UI can remain honest about which input drove the visual treatment.

## Guardrails
- No payout events are invented.
- No prior-year dates are converted into estimated future events.
- No tax/net value is mixed into the future schedule.
- No financial formula, broker route, credential, trading behavior, subscription, legal publication, DNA or AI change.
- The calendar UI remains owned by `IncomeWorkspace`; this pass only provides a tested model for the later visible integration.

## Next
Issue #308 should reuse this model for the month ribbon and filtering rather than reimplementing calendar aggregation inside React state/render code.
