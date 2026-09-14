# QVANIX · native Russian copy pass v1

Date: 2026-09-14

## Goal

Remove literal/machine-translated English fragments from the visible Board without changing financial semantics, layout ownership, formulas or data sources.

## Copy rule

- Russian UI is written as a native Russian product, not translated word-for-word from English.
- Keep only established financial abbreviations/brands where they add precision: TWR, XIRR, P/L, IMOEX, Q-LENS, QVANIX.
- Statuses shown to retail users are Russian (`предварительно`, `зрелая история`, `данные полные`, etc.).
- Technical source names may remain in methodology/debug surfaces, but the main product surface should explain their meaning in Russian.

## No-duplication rule

This pass does not add widgets. Q-LENS remains a compact summary/navigation layer; Portfolio, Analytics and Income remain canonical homes for full widgets.

## Scope

Visible copy only in `QvanixBoard.tsx`; no backend, broker API, calculations, access policy, DNA state, legal/payment or credentials changes.
