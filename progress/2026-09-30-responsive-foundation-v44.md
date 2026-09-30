# QVANIX Responsive Foundation v44 — 2026-09-30

This patch starts the first-class tablet/desktop pass for the active light Financial Core. It follows the gap audit's device model without copying Snowball UI or weakening QVANIX's verified-data rules.

## Layout tiers

The light Core now has one runtime layout contract:
- phone: < 700 px;
- tablet: 700–899 px;
- desktop: >= 900 px.

The thresholds live in `src/responsive/qvanixBreakpoints.ts` and produce a single `data-layout` owner on the Core root. New Core responsive composition is keyed from that tier rather than introducing more unrelated width checks.

## Desktop navigation

At desktop width, the five primary Core destinations move from the bottom tabbar into a fixed left navigation rail. The content canvas expands to a centered ~1280 px maximum width and reserves rail space instead of stretching phone geometry across the screen.

Phone keeps the existing bottom navigation. Tablet keeps a centered floating bottom navigation with more breathing room.

## Portfolio table

Portfolio asset rows keep the compact phone shape but split value and P/L into distinct semantic cells.

At tablet/desktop widths the current asset list becomes a four-column table:
- asset;
- portfolio weight;
- current value;
- open-position P/L.

No sector column is invented because sector coverage is not part of the trusted normalized position contract yet.

## Adaptive analytics chooser

The v43 custom Analytics section chooser remains one component:
- phone/tablet: bottom sheet;
- desktop: anchored popover beside the section control.

The desktop variant does not open a full-screen dimming sheet and supports the same keyboard/close semantics.

## Help behavior

Glossary help remains tap/click accessible on all devices. Fine-pointer devices additionally get a compact hover preview for the first relevant definitions, while the full explanation dialog remains available on click.

## Guardrails

No financial formulas changed. No trading capability added. No data was fabricated. DNA/Living World remains frozen. The patch changes presentation and navigation only.
