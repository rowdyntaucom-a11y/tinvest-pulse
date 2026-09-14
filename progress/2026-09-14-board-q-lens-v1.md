# QVANIX · Board Q-LENS v1

Date: 2026-09-14
Starting main: `160d4f73408f6fd7d90021a91cc33bb3debda9ea`
Branch: `qvanix-board-lens-v1`

## Why this pass

Continue convergence toward Snowball-like usability without copying its visual language. The target is more information density through switchable views and drill-down, while keeping each full metric in its canonical QVANIX workspace.

## Implemented

- Added compact `Q-LENS` focus switcher to `Пульт` with four user-selectable lenses:
  - `КАПИТАЛ`
  - `ДОХОДНОСТЬ`
  - `ДОХОД`
  - `РИСК`
- Each lens reuses already-calculated / already-normalized values only.
- The lens never duplicates a full Portfolio / Analytics / Income widget; it provides a compact summary and an `ОТКРЫТЬ` jump into the canonical workspace.
- Income lens keeps realized net FACT separate from confirmed future schedule net.
- Return lens keeps TWR and XIRR semantically separate.
- Risk lens keeps short-history preview state explicit.
- Board now allows vertical scrolling on constrained phones instead of shrinking the new controls into unreadable text.

## QVANIX-specific twist

`Q-LENS` is not a generic dashboard carousel. It acts as a focused reading layer over the same deterministic QVANIX core: one question at a time, with source/sample constraints preserved, then a direct jump into the authoritative workspace.

## Council review

- Quant: no new financial formula, forecast, alpha claim, recommendation or inferred tax value.
- Code: local UI state only; no API, storage, dependency, backend or broker change.
- Responsive/mobile: 4 lens controls collapse 4→2 columns; summary facts collapse 3→2; mobile board is explicitly scrollable rather than forcing micro-text.
- Release: two UI files plus this checkpoint; no DNA state, legal/payment, credentials or trading behavior.

## Next

- Extend the same flexible-view principle to existing Portfolio / Analytics blocks only where it replaces static duplication rather than adding more widgets.
- Keep Daily movers gated until verified daily-change data exists.
- Keep Income payout growth gated until two comparable realized annual periods exist.
