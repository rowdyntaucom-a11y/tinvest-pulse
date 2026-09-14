# Portfolio mobile label readability v1

Date: 2026-09-14
Scope: presentation-only / mobile readability

## Gap

The mobile readability layer still reduced secondary Portfolio position text to 6.8 px and allocation labels to 6.6 px at <=620 px. These are supporting labels rather than decorative microcopy, so the current sizes make scanning positions and allocation rows unnecessarily difficult on a phone.

## Change

- Keep the existing Portfolio layout, data, ordering and hierarchy unchanged.
- Raise secondary position text to 7.8 px and add a compact 1.2 line-height.
- Raise position weight/value supporting text to 7.8 px.
- Raise allocation-row labels to 7.6 px with the same compact line-height.
- Do not add cards, controls, screens or animation.
- Preserve the existing mobile spacing rules and semantic colors.

## Boundaries

No changes to Portfolio calculations, position values/weights, Income, Health, Risk, Drift, TWR/XIRR, IMOEX, payouts/tax, broker/T-Invest API, backend/routes/server, storage/schema, access policy, trading behavior or DNA runtime state.

Files intentionally limited to:
- `v2/src/mobileReadability.css`
- this checkpoint

## Parallel work

Open PR #289 (Board/Q-LENS copy) is intentionally untouched. No Board runtime or copy files are modified in this pass.

## Validation gate

Before merge: review PR diff, run full `v2 build`, confirm the current `main` SHA has not moved from branch base (or rebase/revalidate), and merge only with green checks and no conflicting parallel runtime work.
