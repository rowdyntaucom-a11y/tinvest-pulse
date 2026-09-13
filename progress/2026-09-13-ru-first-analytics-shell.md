# QVANIX autonomous checkpoint — 2026-09-13

## RU-first Analytics shell

Starting main: `0d8080435d0b896c6b6c9fde81f0b28984699489`.

Runtime change: PR #208, squash-merged as `dc0244f930b837f11e2c2f621dd60c245a10f14d`.

### Product decision
QVANIX remains RU-first for usability. A Russian-speaking user should not need English investment vocabulary to understand navigation or primary metric labels. Standard financial abbreviations such as TWR, XIRR, IMOEX and other internationally useful metric names may remain, but their meaning is stated in Russian nearby.

### Accepted change
- Top product eyebrow changed from `PORTFOLIO INTELLIGENCE` to `АНАЛИТИКА ПОРТФЕЛЯ`.
- Analytics navigation changed from unexplained `HEALTH / DRIFT / MC` to compact Russian-first `ОЦЕНКА / ДОЛИ / СЦЕН.`.
- The short labels were intentionally chosen instead of longer literal translations so the existing five-tab Samsung/Android one-row navigation keeps roughly the same density as before.
- Sample state changed from `PREVIEW` to `ПРЕДВ.`; mature state is shown as `12 МЕС.`.
- Overview and drill-down text now uses `ЗДОРОВЬЕ ПОРТФЕЛЯ`, `ИНДЕКС TWR`, `ПОРТФЕЛЬ И IMOEX`, `ЦЕЛЬ И ФАКТ` and Russian explanation of allocation drift.
- XIRR and TWR remain visible as professional abbreviations, now paired with `ЛИЧНАЯ ДОХОДНОСТЬ` and `ДОХОДНОСТЬ ПОРТФЕЛЯ`.

### Methodology / council
- Quant: presentation only. No calculation, strategy target, tolerance, history gate, benchmark rule or financial value changed.
- Code: only `v2/src/App.tsx` presentation/integration text changed; deterministic analytics modules remain untouched.
- Mobile: existing `<=620px` shell was inspected before merge. Long literal labels were rejected during review and replaced with compact `ОЦЕНКА / ДОЛИ / СЦЕН.`. No new tab, widget or navigation row was added.
- Release: no backend, broker API, credential, legal/payment, recommendation, execution or subjective DNA-art change.

### Validation
GitHub `v2 build` run #322 passed, including `npm ci`, both dependency security gates, TypeScript/Vite build, `test:core`, asset-history regression and syntax checks through `production-v160.js`.

### Production
Render queues were inspected immediately before merge and both services were settled on the previous main revision. After merge, both `tinvest-pulse-v2-preview` and `tinvest-pulse` reached `live` on `dc0244f930b837f11e2c2f621dd60c245a10f14d`. No manual deploy was triggered and no rollback was required.

### Legal
`LEGAL_REVIEW_2026-09-11.md` remains a hard publication blocker. No RU/EN legal draft, consent wording, operator detail or payment/legal behavior was published or changed.

### Next safe step
Continue the RU-first terminology audit in Portfolio / Income / Monte Carlo drill-down controls, prioritizing actual unclear English UI terms and keeping Samsung/Android density unchanged. Continue Terminal calculation groundwork only through deterministic boundaries and user-authored rules; do not add personalized trading signals.
