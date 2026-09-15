# QVANIX Agent Instructions

This repository is the durable source of truth for QVANIX project continuity across ChatGPT/Codex sessions.

Before material work, read in this order:
1. `QVANIX_MASTER_DIRECTION.md`
2. `PROJECT_CONTEXT.md`
3. current `main` and recent commits
4. latest relevant `progress/*.md`
5. `QVANIX_RESPONSIVE_REQUIREMENTS.md`
6. `QVANIX_DESIGN_SYSTEM.md`
7. `PRODUCT_ACCESS_MODEL_V1.md`
8. feature-specific methodology/docs/tests

For the current next large Codex task, read `CODEX_NEXT_EPIC.md`.

## Non-negotiable project rules
- Audit before coding; reuse existing boundaries/components instead of duplicating them.
- Deterministic financial calculations only; AI/LLM is never the calculation source.
- `expectedYield` is cumulative broker P/L context, not a daily move.
- No fake Daily Movers, VWAP, YTM/duration, fundamentals, payout dates or history without verified source contracts.
- Missing data must not silently become zero.
- Scenarios are labelled as scenarios, not forecasts.
- No personalized buy/sell commands and no auto-trading.
- Broker access remains read-only; never place tokens/secrets in frontend/localStorage/repository/logs.
- Existing bundle/security/test gates are hard guards; do not weaken them to make CI green.
- QVANIX is mobile-first but deep workspaces may scroll vertically. Canonical UX rule: **FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.**
- Never allow page-level horizontal overflow or unreadably small mobile type just to fit content.
- Preserve one canonical Asset Workspace, one financial source of truth and one DNA renderer/update loop.
- Snowball is a benchmark for usability/distribution, not a UI template or the center of the QVANIX brand.
- Real Samsung/Android recordings are high-value regression evidence.

## Workflow
Use coherent feature branches and PRs. Add regression tests for new data/business behavior. Run Quant / Code / Mobile / Release review passes. Inspect automated review. Merge only after real blockers are resolved. Let Render auto-deploy; verify preview and primary on the same final `main` SHA. Record meaningful decisions/failures/milestones in `progress/YYYY-MM-DD-*.md`.

If a newer explicit user decision conflicts with repository documentation, the newer decision wins; update the canonical documentation in the same cycle.
