# QVANIX autonomous checkpoint — 2026-09-13

## RU-first risk analytics usability pass

Starting main: `b99e6ffe4c34aa7064ad58a18e89338c43364e61`.

Completed through PR #198 (`UX: make risk analytics RU-first`) and squash-merged as `abda445402612718ee13dded942ee6e239fba0c7`.

### Product rule
QVANIX UI should be understandable to a Russian-speaking user without requiring English financial vocabulary. Standard professional abbreviations may remain when useful, but they should be paired with plain-Russian meaning instead of appearing as unexplained English labels.

### Accepted change
- Risk mode buttons changed from `VS IMOEX / ROLLING / TAIL / CORR / STRESS` to Russian-first labels `СРАВНЕНИЕ / ОКНА / ХВОСТ / СВЯЗИ / СТРЕСС`.
- `MAX DRAWDOWN`, `OVERLAP`, `EXCESS RETURN`, `TRACKING ERROR`, `INFORMATION RATIO`, `ROLLING ...`, `EXPECTED SHORTFALL`, `TAIL OBSERVATIONS` and other English-first labels were replaced with plain-Russian equivalents.
- Sharpe, Sortino, HHI, VaR/CVaR, TE, IR and Beta remain visible as professional abbreviations, but now carry Russian context such as `доход / риск`, `риск снижения`, `концентрация`, `чувствительность`, and `средняя потеря хвоста`.
- No financial formulas, thresholds, history gates, benchmark handling or data sources changed.

### Validation
GitHub `v2 build` run #310 completed successfully before merge.

### Council / scope
- Quant: presentation-only change; all deterministic values and methodology are unchanged.
- Code: one React presentation file changed; analytics calculation boundaries untouched.
- Mobile: no new widgets or navigation level. The existing mobile risk-mode bar keeps its compact ≤620px treatment; Russian labels were kept short enough for the current chip layout and require live Samsung validation only if a real overflow is observed.
- Release: no backend/broker API, credentials, DNA, legal/payment, recommendation logic or trade execution changes.

### Production
Render auto-deploy was triggered by the main commit on both `tinvest-pulse-v2-preview` and `tinvest-pulse`. Both were observed progressing through build/update while the previous production revision remained live. No manual deploy was triggered.

### Legal
`LEGAL_REVIEW_2026-09-11.md` remains a publication blocker. No legal document or consent wording was published or changed.

### Next safe focus
Continue the RU-first terminology audit across top-level Analytics, Portfolio, Income and compact drill-down controls. Preserve internationally useful metric abbreviations, but remove unexplained English UI words and verify each pass against Samsung/Android density before expanding to another screen.
