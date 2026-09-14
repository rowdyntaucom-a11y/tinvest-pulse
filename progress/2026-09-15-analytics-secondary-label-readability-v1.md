# Analytics secondary label readability v1

Date: 2026-09-15
Scope: presentation-only / mobile readability

## Gap

The shared mobile readability layer still reduced several existing Analytics supporting labels below 7 px at <=620 px: score-card labels/copy at 6.8 px, risk labels at 6.8 px with supporting copy at 6.7 px, and Health row labels/weights/points at 6.7 px. These values carry methodology/status context and are not decorative microcopy, so they remain harder to scan on a phone than the surrounding metrics.

## Change

- Keep the current Analytics layout, cards, calculations, ordering and semantic states unchanged.
- Raise score-card labels and supporting copy to 7.2 px; add compact line-height to supporting copy.
- Raise risk-card labels to 7.4 px and supporting copy to 7.3 px; slightly reduce tracking on the label to offset the size increase without widening the card.
- Raise Health row labels/weights/points to 7.3 px with compact 1.2 line-height.
- Do not add widgets, controls, screens, animation or new data.
- Preserve the existing mobile grid/gap rules and semantic colors.

## Boundaries

No changes to Health/Risk calculations, TWR/XIRR, IMOEX/benchmark arithmetic, Portfolio/Income/Drift calculations, payouts/tax, broker/T-Invest API, backend/routes/server, storage/schema, access policy, trading behavior or DNA runtime state.

Files intentionally limited to:
- `v2/src/mobileReadability.css`
- this checkpoint

## Parallel work

Open Board/Q-LENS PR #289 remains intentionally untouched. No Board copy/runtime files are modified in this pass.

## Validation gate

Before merge: review PR diff, require full `v2 build` success, confirm current `main` has not moved from branch base `85846edade989e2fc6b98ea2ade17ebcddbb03ee` (or rebase and revalidate), and merge only with no conflicting parallel runtime work.
