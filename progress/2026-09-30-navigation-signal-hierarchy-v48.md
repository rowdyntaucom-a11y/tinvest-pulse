# QVANIX Navigation & Signal Hierarchy v48 — 2026-09-30

This patch follows the real PC recording after v47. The responsive/legibility work is holding, but the recording exposed two remaining product-hierarchy problems: the primary “Результат” label overlaps conceptually with Analytics, and a trusted recovery state still occupies too much visual attention compared with the financial workspace itself.

## Navigation vocabulary
- Primary “Результат” is renamed to **“Доходность”**.
- The Overview chart CTA now points to **“Доходность →”**.
- The return workspace keeps TWR/XIRR/CAGR, capital-flow separation and position P/L semantics unchanged.
- The Analytics hub title is clarified to **“Аналитика портфеля”**.
- Its first lens is labelled **“Портфель”** while Market and Tools remain separate peers.
- The Analytics subtitle now states its scope directly: structure, P/L, risk and professional depth.

This creates a clearer split:
- **Доходность** = how the portfolio result changed;
- **Аналитика** = how the portfolio is structured, where the risk is, and what professional diagnostics say.

## Trusted source signal hierarchy
The verified recovery banner is visually demoted:
- trusted cached/recovery state becomes a compact status strip;
- long recovery copy is truncated on desktop and hidden on phone;
- hard untrusted/no-data states keep the full alert treatment.

Nothing is hidden from the trust model: the source/retry state remains visible and actionable, but it no longer competes with the actual portfolio content.

## Professional naming consistency
- “Глубокая аналитика” is renamed to **“Профессиональная аналитика”** in the canonical analytics depth surface.
- Income professional depth is labelled **“ПРОФЕССИОНАЛЬНЫЙ ДОХОД”**.
- Bond cash-flow heading and source note are localized.

## Regression coverage
Adds a dedicated v48 regression test for:
- primary return vocabulary;
- trusted recovery status hierarchy;
- preservation of hard fail-closed alerts.

## Guardrails
No financial formulas changed. No data contract changed. No trading. No fabricated data. Simple/Pro behavior remains unchanged. DNA/Living World remains frozen.
