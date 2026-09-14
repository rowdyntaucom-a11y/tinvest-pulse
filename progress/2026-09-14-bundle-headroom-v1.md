# QVANIX · bundle headroom v1

Date: 2026-09-14
Starting main: `23dfe41948a82cad4c2f182bb31e01f39b7de3eb`
Branch: `qvanix-bundle-headroom-v1-mainrefresh`

## Trigger

The semantic allocation-donut pass initially hit the existing QVANIX non-DNA bundle gate: 452.2 KiB and then 450.4 KiB against the 450 KiB limit. Deferring the interactive donut made that pass green, but the accepted main chunk still built at about 460.93 kB decimal (~450.1 KiB), leaving almost no room for the next small visualization feature.

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

## Current data-boundary decision

Current main also contains `progress/2026-09-14-daily-movers-data-audit.md`. Daily movers remain GATED because the normalized current-position boundary does not expose a verified all-position daily-change field. Cumulative broker `expectedYield` must never be relabelled as a daily move.

## Continuity

This is an enabling architecture pass, not a roadmap feature. The next product-facing item is deterministic narrative/presentation for already-calculated Portfolio-vs-IMOEX facts, or richer period/drill-down charting where the historical series is already trustworthy.
