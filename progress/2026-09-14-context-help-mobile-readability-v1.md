# Context Help mobile readability v1 — 2026-09-14

## Scope
Presentation-only readability pass for the global Context Help surface.

## Problem
The mobile help trigger was reduced to 32×32 px and the explanatory copy to roughly 7.5–8 px. On a phone this made a utility intended to explain dense financial UI harder to target and harder to read than the UI it documents. On very narrow screens the fixed two-column term/definition layout also squeezed explanatory copy.

## Change
- Increased the mobile help trigger from 32×32 to 40×40 px while keeping the floating footprint compact.
- Raised mobile explanatory copy, definition, and caution text modestly without changing content.
- Added a little more separation between the trigger and open card.
- Kept the card height bounded and scrollable; added contained overscroll so reading help does not drag the page underneath.
- At <=380 px, term/definition rows stack vertically instead of compressing the definition column.
- No animation added.

## Boundaries preserved
No financial calculation, TWR/XIRR, IMOEX arithmetic, Portfolio/Income/Health/Risk/Drift logic, payout/tax handling, broker/T-Invest API, backend/routes/server, persistence/schema, access policy, trading behavior, or DNA runtime state changed. The pass changes only `v2/src/features/help/contextHelp.css` plus this checkpoint.

Open Board/Q-LENS PR #289 remains untouched.

## Diff discipline
The CSS file intentionally remains in its existing compact formatting, so the review diff reflects only the mobile rule change and the new <=380 px override rather than a presentation-only reformat of untouched declarations.

## Release gate
Merge only after the full v2 CI is green for the final branch head and a pre-merge race-check confirms `main` has not moved from the branch base. If `main` moves, re-evaluate/rebase rather than merging blindly.
