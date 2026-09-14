# Sample badge mobile readability v1

Date: 2026-09-15
Scope: presentation-only / mobile readability

## Gap

The shared mobile readability layer still rendered `.sample-badge` at 6.7 px on <=620 px screens. This badge communicates sample/maturity context rather than decoration, so it needs to remain legible enough to prevent users from overlooking the state of the displayed analytics.

## Change

- Keep the current badge placement, wording, semantic state, color and surrounding layout unchanged.
- Raise `.sample-badge` from 6.7 px to 7.2 px.
- Add compact `line-height: 1.2`.
- Slightly reduce letter spacing from `.035em` to `.03em` to offset width growth.
- Do not add widgets, controls, screens, animation or new data.

## Boundaries

No changes to TWR/XIRR, IMOEX/benchmark arithmetic, Portfolio/Income/Health/Risk/Drift calculations, payouts/tax, broker/T-Invest API, backend/routes/server, storage/schema, access policy, trading behavior, financial semantics or DNA runtime state.

Files intentionally limited to:
- `v2/src/mobileReadability.css`
- this checkpoint

## Parallel work

Open Board/Q-LENS PR #289 remains intentionally untouched. No Board/Q-LENS copy/runtime file is modified in this pass.

## Validation gate

Before merge: review PR diff, require full `v2 build` success, confirm current `main` has not moved from branch base `481c498e50182838dcf92085a23d365aa782168a` (or rebase and revalidate), and merge only with no conflicting parallel runtime work.
