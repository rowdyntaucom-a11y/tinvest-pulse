# QVANIX · bundle headroom v1

Date: 2026-09-14
Starting main: `eb7f192073a4b2704bae300c9885f08659f23d9c`
Branch: `qvanix-bundle-headroom-v1`

## Trigger

The allocation-donut pass initially hit the existing QVANIX non-DNA bundle gate: 452.2 KiB and then 450.4 KiB against the 450 KiB limit. Deferring the interactive donut made that pass green, but the accepted main chunk still built at about 460.93 kB (~450.1 KiB), leaving almost no room for the next small visualization feature.

Do not raise the budget to hide this. Restore architectural headroom instead.

## Scope

- Keep Monte Carlo formulas, maturity gate, labels and UI behavior unchanged.
- Move the Monte Carlo view and its calculation dependency behind a React lazy boundary because the feature is only needed in `Аналитика → Сцен.`.
- Preserve the existing `MonteCarloPanel` public component boundary so `App.tsx` and navigation semantics do not change.
- Use a small deterministic loading fallback only during chunk resolution.

## Council review

- Quant: no Monte Carlo formula, seed/bootstrap policy, percentile, history threshold or financial number changed.
- Code: runtime code-splitting only; no new dependency, API, storage or backend change.
- Responsive/mobile: same rendered panel after load; fallback uses existing panel classes and does not introduce page-horizontal overflow.
- Release: two Analytics component files plus this checkpoint; no broker route, credentials, legal/payment, DNA state or trading behavior.

## Release requirement

Full `v2 build` must pass, including the bundle-budget plugin and complete `test:core`. The build log should show meaningful non-DNA main-chunk headroom rather than a near-threshold pass.

## Continuity

This is an enabling architecture pass, not a roadmap feature. The next product-facing item remains validation of a truthful daily-movers data boundary, followed by deterministic narrative / richer chart depth when the data contract supports it.
