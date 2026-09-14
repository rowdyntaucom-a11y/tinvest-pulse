# Key rate mobile readability v1

Date: 2026-09-14
Scope: presentation-only / mobile readability

## Gap

The compact key-rate widget in the top bar reduced mobile microcopy to 5.2–5.8 px at <=620/900 px. The financial value itself stayed visible, but the labels and meeting-time context became unnecessarily hard to read on a phone.

## Change

- Keep the existing widget, data source, link target and information hierarchy unchanged.
- Increase mobile minimum height and padding slightly instead of adding another card or screen.
- Raise uppercase labels and meeting-time text to 8 px on mobile.
- Keep the key-rate value dominant at 14 px and the meeting date at 11 px.
- Preserve the existing rule that hides the source/date string below 620 px to protect horizontal space.
- No new animation.

## Boundaries

No changes to key-rate data resolution, official meeting dates, backend/API, Portfolio, Income, Health, Risk, Drift, TWR/XIRR, IMOEX, payouts/tax, storage, access policy, trading behavior or DNA runtime state.

Files intentionally limited to:
- `v2/src/features/macro/keyRateWidget.css`
- this checkpoint

## Validation gate

Before merge: review PR diff, run full `v2 build`, confirm the current `main` SHA has not moved from the branch base (or rebase/revalidate), and merge only with green checks and no conflicting parallel runtime work.
