# QVANIX Comprehension Layer v47 — 2026-09-30

This patch follows the product plan after the responsive/desktop foundation. The next gap is not more metrics; it is comprehension. QVANIX already has deep deterministic analytics, but new users should not have to decode the full professional surface on first contact.

## Persistent experience mode

The active light Financial Core now owns one persistent experience preference:

- **Просто** — default. Keeps first-answer views, essential portfolio structure, payouts, calendar and quick risk views visible.
- **Профи** — exposes deep portfolio, income and analytics controls as primary navigation options.

The preference is stored under `qvanix.core.experience.v1`. It stores presentation choice only. No broker credentials or financial data are written to localStorage.

Switching back to Simple mode safely exits currently open deep submodes instead of leaving hidden professional panels active.

## Professional depth is never deleted

Simple mode does not remove functionality. It replaces deep tabs with explicit professional gates:

- Portfolio → deep asset/fundamental/bond analysis;
- Income → full history/source/calendar depth;
- Analytics → TWR windows, VaR/CVaR and IMOEX comparison.

Each gate explains what is behind it and opens the same underlying verified module after switching the experience to Pro.

## First-run onboarding

After the first trusted portfolio load, a compact three-step onboarding explains:

1. QVANIX shows confirmed data and fails closed;
2. the first screen answers quickly while deeper workspaces remain available;
3. Simple vs Pro mode.

The user can skip, choose a mode, and reopen the onboarding from the header at any time. The onboarding does not block an untrusted/loading portfolio state.

## Plain-language analytics bridge

Professional Analytics now includes an explicit **“Объяснить простыми словами”** control.

The explanation is deterministic product copy tied to the selected analytical section:
- return/TWR;
- risk/drawdown/effective positions;
- benchmark/IMOEX.

It does not call an LLM and does not generate recommendations, forecasts or hidden financial calculations.

## Responsive behavior

Experience controls, onboarding, professional gates and plain-language explanation have phone and desktop presentations. Existing phone/tablet/desktop layout tiers remain unchanged.

## Guardrails

No financial formula changed. No data contract changed. No trading or order entry. No personalized buy/sell instructions. No fabricated metrics. Living World/DNA remains frozen.
