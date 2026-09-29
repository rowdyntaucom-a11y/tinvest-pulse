# QVANIX Portfolio Progressive Disclosure v31 — 2026-09-29

## Basis
This pass implements the latest Core audit findings against the real-device recording, with Snowball used only as an information-hierarchy benchmark.

## Product changes
- Portfolio keeps the fast default layers: Assets and Structure.
- Professional analytics is now an explicit third entry instead of an always-expanded long feed.
- Professional depth is split into Overview / Equities / Bonds / Positions; only one deep layer renders at a time.
- The duplicate asset-class structure block is removed from nested Holdings Explorer.
- Portfolio weights are neutral, have no profit-style plus sign, and are explicitly labelled as portfolio share.
- Structure rows say “% portfolio” rather than visually borrowing P/L semantics.
- Equity/Bond jargon is gated behind the professional layer and key terms are explained in plain Russian.
- The shared Section Selector no longer uses native Android <select>; it uses a QVANIX bottom sheet.
- The nested holdings sort chooser uses the same custom selector.
- Market transport failures no longer expose raw HTTP status codes to the user.
- MOEX heading is protected from character-by-character wrapping.
- Short Portfolio → Structure content is explicitly content-sized instead of inheriting spare height.

## Regression policy
The audit findings are encoded in portfolioAuditV31.test.ts so future patches cannot silently reintroduce:
- unlabeled/sign-styled portfolio weights;
- one-feed professional depth;
- duplicate class summary;
- native section selector;
- raw HTTP errors;
- MOEX wrapping;
- forced empty structure height.

## Boundaries
No financial formulas changed. No trading. No fake values. No DNA work. The active product remains the light QVANIX Financial Core.
