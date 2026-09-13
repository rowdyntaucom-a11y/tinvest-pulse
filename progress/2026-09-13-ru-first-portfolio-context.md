# QVANIX autonomous checkpoint — 2026-09-13

## RU-first Portfolio account + context pass

Starting main: `7c2228bf0cce045e761ae3760d0e1d1c6bb9d9e4`.

### Scope
- Replaced unexplained account-access labels `READ ONLY / FULL ACCESS / NO ACCESS` with Russian-first `ТОЛЬКО ЧТЕНИЕ / ПОЛНЫЙ ДОСТУП / НЕТ ДОСТУПА`.
- Replaced `API WAIT`, `INVALID`, `DRILL-DOWN`, `BONDS` and raw English tooltip/status wording with compact Russian equivalents.
- Reworded existing Portfolio methodology text so `broker attribution`, `FACT observed net`, `schedule gross`, `live capital`, `return attribution` no longer appear as unexplained English-first UI jargon.
- Kept standard identifiers `API`, `P/L`, `TWR`, `FIGI`, `expectedYield`, and `positionItems` only where technically useful, paired with Russian meaning.

### Methodology
- No account-context parsing, broker data, portfolio values, P/L arithmetic, passive-income matching, allocation denominator, Top-3 calculation, history, or API contract changed.
- `expectedYield` remains the broker field backing current unrealized P/L; the UI change does not reinterpret it as TWR or historical attribution.
- FACT realized income and future 12M schedule remain separate bases and exact realized-to-scheduled reconciliation remains gated.

### Council
- Quant: presentation only; all formulas and gates unchanged.
- Code: one existing React/TypeScript presentation file; no backend/data-model changes.
- Mobile: no new widget, row, navigation level, or scroll region. Existing chips/buttons are relabelled in place with compact Russian text.
- Release: no broker/backend route, credentials, DNA, legal/payment, personalized recommendation, or execution behavior changed.

### Legal
`LEGAL_REVIEW_2026-09-11.md` remains controlling. No legal or consent wording changed.

### Next safe focus
Audit remaining user-visible English-first fragments across the default shell only where they reduce comprehension. Preserve professional metric identifiers when they are standard and explain them in Russian rather than replacing deterministic terminology with vague wording.
