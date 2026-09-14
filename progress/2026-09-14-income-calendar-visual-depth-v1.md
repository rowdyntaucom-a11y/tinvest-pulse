# QVANIX — Income Calendar visual depth v1

Date: 2026-09-14
Branch: `qvanix-income-calendar-visual-depth-v1-r2`
Starting main: `4c501a4025747a866b8d0d5560f91a2f0c9efb93`

## Scope
Visible integration for GitHub issue #308 on top of the deterministic `incomeCalendarVisual.ts` foundation from PR #309.

## Implemented
- Added a compact 12-month ribbon above the existing `ДОХОД → КАЛЕНДАРЬ` event list.
- Ribbon cells reuse only confirmed schedule events from the existing payout stream and show month, event count, gross context when available and deterministic intensity from the existing helper.
- `ВСЕ` reset plus month selection filter the same event list; pagination resets on every filter change.
- FACT events remain excluded by the existing calendar helper and are never mixed into the future schedule.
- `ПОДТВЕРЖДЕНО` appears only for non-FACT events whose source confidence is `HIGH`; no Estimated state is introduced.
- Verified instrument badges are reused through the existing shared badge loader and `InstrumentBadge` component only after exact, unique FIGI matching to a current position. UID fallback is available to the badge component only when the payout event itself exposes a UID.
- Mobile ribbon uses local horizontal scrolling and does not require a second calendar screen.

## Guardrails
- No payout event is invented.
- Future calendar remains gross schedule values only; Taxes retains gross/tax/net ownership.
- No financial formula, broker credential, backend route, trading, legal publication, subscription enforcement, DNA or AI change.
- No duplicate payout list or second event stream.

## Tests
- Existing `incomeCalendarVisual.test.ts` was extended for confirmed-status gating and exact/fail-closed FIGI badge matching.
- Full repository CI remains the release gate before merge.

## Release discipline
- This branch was refreshed from the latest concurrent `main` after Board/mobile readability changes landed.
- Merge only after PR diff review, green CI and settled Render queues.
