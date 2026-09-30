# QVANIX Core UX Consistency v43 — 2026-09-30

This patch closes the remaining polish items from the second external Core audit without reopening the light-Core information architecture.

## Audit items closed

### 1. Native analytics picker
- Removed the mobile native `<select>` from professional Analytics.
- Added a QVANIX bottom sheet with dialog semantics, active state, notes, safe-area padding, outside-tap close and Escape close.
- Desktop keeps the existing visible three-section navigation.

### 2. Russian terminology pass
- Added one shared financial terminology module for normalized labels.
- Localized sector labels such as `government` and `financial`.
- Removed visible mixed-language service copy such as `dirty value`, `usable metrics`, `verified fundamentals`, `BOND/EQUITY INTELLIGENCE`, `READ-ONLY`, `Broker P/L` and `Cost basis` from the touched Core surfaces.
- Preserved established market identifiers and formulas such as TWR, XIRR, CAGR, YTM, ROE, FCF, FIGI and MOEX where they are actual financial/technical identifiers rather than untranslated prose.

### 3. Retry copy
- Replaced duplicated product-name retry copy with one sentence:
  `Не удалось получить данные рынка — пробуем ещё раз автоматически.`
- Automatic retry behavior is unchanged.

### 4. Dead space
- Market unavailable/loading states no longer reserve a fixed 100/120 px minimum block.
- Portfolio Structure already had `min-height:0`; the remaining apparent dead area was simply a short chapter. Added a compact “Следующий шаг” handoff to Assets / Professional Analysis so the short workspace ends intentionally rather than looking unfinished.

## Guardrails
No financial methodology changed. No trading. No invented data. No DNA/Living World work. The accepted Assets / Structure / Professional Analysis architecture remains intact.
