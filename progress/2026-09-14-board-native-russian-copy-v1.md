# QVANIX · Board native Russian copy v1

Date: 2026-09-14
Starting main: `0dbfd4a2e99c4d0fb0a516f7e6c5ba7bf416eeb2`
Branch: `qvanix-board-russian-copy-v1`

## Goal

Remove literal/machine-like English-Russian hybrid wording from the visible QVANIX Board without changing financial semantics, calculations, data contracts or navigation.

## Implemented

- Rewrote visible Board labels and explanatory copy as native Russian product language.
- Kept accepted financial abbreviations where they are the actual metric names: TWR, XIRR and P/L.
- Replaced technical implementation phrases such as `preview`, `historical`, `verified observation window`, `gross schedule`, `payout snapshot`, `live workspace` and English data-rail labels with concise Russian wording.
- Replaced English tooltips/workspace names with Russian destination labels.
- Renamed the health presentation copy to `Состояние` while preserving the same deterministic Health Score value and version.

## Guardrails

- No financial formula, metric availability gate or value was changed.
- No API/backend, broker access, authentication, subscription enforcement, credentials, legal/payment text or DNA runtime changed.
- No new widget was added and no existing metric was moved between product sections.
- This pass does not yet remove Board summary repetition; the separate no-duplicate ownership rule remains the next structural UX pass.

## Review

Quant: copy-only; metric meanings remain TWR/XIRR/P&L/Health/volatility/drawdown as before.

Code: one React presentation file plus this progress note.

Responsive/mobile: no CSS/layout geometry changed; longer Russian phrases were kept short enough for existing compact labels.

Release: merge only after current-main refresh check, green v2 CI and settled preview/production Render queues.
