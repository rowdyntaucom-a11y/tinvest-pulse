# Samsung video follow-up — Asset identity / Pulse overlay / Asset back reachability

Date: 2026-09-15

## Evidence

Manual Samsung Internet walkthrough after the IA 2.0 / Asset Intelligence merge confirmed that the scroll-first direction materially improves readability of Analytics, Income and Goal workspaces. The video also exposed three concrete regressions that automated checks did not catch.

1. Asset detail for LKOH shows `Фундаментальные данные недоступны` and targeted history reports no coverage even though the instrument is an ordinary share with a T-Invest badge. The root cause is the live dashboard projection dropping `instrumentUid` from portfolio positions. Asset fundamentals intentionally fail closed without a verified UID, and targeted history then falls back to FIGI while the backend ranks by UID, so both deep views become unavailable.
2. `ПУЛЬС` screenshot mode is not actually viewport-fixed on Samsung. `ambientShell.css` applies `.app-shell > :not(.qv-ambient) { position: relative; z-index: 1; }` with higher specificity than `.pulse-mode { position: fixed; }`, so the screenshot surface is laid out inside the app instead of covering the viewport.
3. Opening Asset detail can inherit enough mobile scroll offset to hide the first `← НАЗАД` control. The detail remains usable, but the immediate return affordance is not reliably visible.

## Decision

Keep IA 2.0: summary-first screens plus deliberate vertical scrolling for depth. Do not return to the former one-screen-at-all-costs constraint.

Hotfix scope is intentionally narrow:
- preserve verified broker `instrumentUid` in the production dashboard projection through a v163 runtime layer;
- add a regression test for the generated identity injection and include it in `test:api`;
- force Pulse mode to be genuinely viewport-fixed despite the ambient-shell direct-child rule;
- make the Asset back control sticky so it stays reachable on mobile scroll transitions.

No financial formula, trading behavior, broker credential handling, DNA renderer ownership, score methodology or bundle budget is changed.
