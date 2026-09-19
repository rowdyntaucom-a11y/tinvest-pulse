# QVANIX v3 — Secondary IA Selector Pass

Date: 2026-09-19
Starting main: `b8b48d47c9a1a22ed898f398c24b5c1aed11bf59`

## Why
Deep v3 workspaces had accumulated separate small tab rails. The master direction calls for one clear secondary selector, progressive disclosure, readable mobile labels, and horizontal rails only where they are genuinely filters or chart controls.

## Implemented
- Added shared `V3SectionSelector` with native select semantics, active-section description, keyboard focus, shell styling, and mobile sticky behavior.
- Analysis: replaced the 5-item rail with Обзор / Доходность / Риск / Структура / Рынок selector.
- Income depth: replaced Календарь / Факт / Источники rail.
- Goal Scenario Lab: replaced Ваш сценарий / Исторический диапазон rail.
- Holdings Explorer: replaced the 5-dimension grouping rail with one selector.
- Kept asset filters, period controls, calendar month rail, scenario years and instrument presets as intentional compact controls.
- Removed obsolete Analysis / Income / Goal tab CSS and old Analysis sticky offsets.
- Mobile selector: 48 px control, 13 px selected text, explanatory copy, sticky below context header, separate <=359 px offset.

## Data / methodology
Presentation only. No financial calculation, payout trust rule, scenario methodology, source contract or broker integration changed.

## Regression
Updated Analysis, Income, Goal, Holdings and mobile-density tests. Added a shared selector regression that covers integration, shell styling, mobile typography and removal of obsolete tab navigation classes.

## Validation required
Security gate, production build, full v3 suite, bundle inspection, exact-head CI, squash merge, exact-SHA Render LIVE verification.

## Physical-device status
Samsung Internet / Chrome Android / TalkBack / text scaling are still not physically validated in this pass.
