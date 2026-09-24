# CODEX NEXT EPIC — QVANIX UX Architecture + Comprehension

## Current priority lock — 2026-09-24

**DNA / Living World is frozen and is the lowest-priority area.** Do not implement or polish Pixi/DNA scenes, characters, animations, weather, XP, gamification, world-state systems or DNA-specific visual work in this Epic. Touch DNA only for a blocking regression that prevents the normal financial application from functioning.

Current serial implementation order:
1. finish Assets Depth and real-device usability;
2. build/finish Analysis Depth;
3. build/finish Income Depth;
4. finish Goal and remaining ordinary tab depth;
5. unify shared deterministic data/functionality across Samurai/Cosmos and complete readability/responsive polish;
6. return to DNA only after those workspaces are accepted.

The financial workspaces are the product priority. The world is preserved for later; it is not an active Epic.

## Mission

Work in repository `rowdyntaucom-a11y/tinvest-pulse` from the latest `main`.

This is the next approved large Epic after the Information Architecture / Asset Intelligence pass.

Primary objective:

**Make QVANIX’s existing analytical depth understandable, navigable and readable on a real phone without simplifying or deleting the analytics.**

Canonical product rule:

> **FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.**

Do not stop at a plan. Audit, implement, test and create a PR. **Do not merge the PR yourself.** The ChatGPT project lead will review it before merge.

---

## 0. Required reading before code

Read:
- `AGENTS.md`
- `QVANIX_MASTER_DIRECTION.md`
- `PROJECT_CONTEXT.md`
- `QVANIX_RESPONSIVE_REQUIREMENTS.md`
- `QVANIX_DESIGN_SYSTEM.md`
- `PRODUCT_ACCESS_MODEL_V1.md`
- newest relevant `progress/*.md`
- current `main` and recent commits

Inspect actual implementation before making assumptions, especially:
- `v2/src/App.tsx`
- `v2/src/styles.css`
- `v2/src/informationArchitecture.css`
- `v2/src/mobileReadability.css`
- `v2/src/final-shell.css`
- `v2/src/features/board/**`
- `v2/src/features/portfolio/**`
- `v2/src/features/analytics/**`
- `v2/src/features/income/**`
- `v2/src/features/goals/**`
- `v2/src/features/asset/**`
- `v2/src/features/help/**`
- `v2/src/features/pulse/**`
- current UI-preferences/theme/motion boundaries
- current tests and `test:core`
- current bundle-budget tooling

Do not duplicate existing components if a safe reusable boundary already exists.

---

## 1. Scope guardrails — do not violate

This Epic is presentation/navigation/comprehension work.

Do NOT change financial methodology merely to support design.

Do NOT:
- use `expectedYield` as daily move or daily return;
- add a hero “today +X%” without a verified daily-change contract;
- invent Daily Movers;
- invent VWAP;
- invent YTM/duration/yield-to-call;
- invent fundamentals/history/payout dates;
- turn missing values into zero;
- create a black-box QVANIX score;
- add personalized buy/sell advice;
- add auto-trading;
- expose/store broker credentials in frontend/localStorage/repository/logs;
- raise bundle budgets merely to pass CI;
- rewrite DNA/Pixi ownership;
- add any new DNA/Living World feature, scene, animation, gamification mechanic, art pass or world-state work while the main tabs remain incomplete;
- copy Snowball UI literally.

Preserve current deterministic analytics and current API/data boundaries.

---

## 2. UX diagnosis to solve

Real Samsung review and product comparison found these recurring problems:

1. Too many simultaneous horizontal pill rows expose navigation depth instead of content.
2. Deep Analytics/Risk sections can require users to decode abbreviated labels such as `Сцен.`, `Хвост`, `Связи`.
3. Primary navigation historically clipped/wrapped on narrow mobile.
4. Pult/Home often gives too many cards similar visual weight, so the eye lacks an obvious first answer.
5. Complex terms exist without enough contextual explanation.
6. Secondary text can become too small/low-contrast when the layout is forced to fit.
7. QVANIX is analytically deep, but the UI can make the depth feel harder than necessary.

The solution is NOT deleting analytics.
The solution is progressive disclosure, stronger hierarchy, better naming and reusable contextual help.

---

## 3. Primary mobile navigation

Current top-level spaces:
- ПУЛЬТ / ГЛАВНАЯ
- ПОРТФЕЛЬ
- АНАЛИТИКА
- ДОХОД
- ЦЕЛЬ
- DNA

### Goal
On narrow phones, replace/retire the wide top pill navigation as the primary pattern in favor of a persistent mobile navigation pattern that always makes the primary destinations discoverable.

### Preferred direction
Implement an adaptive bottom navigation for phone-sized viewports, while preserving an appropriate desktop/tablet navigation treatment.

Important:
- Do not blindly force exactly five items because another product uses five.
- DNA is a first-class QVANIX destination and must remain clearly reachable.
- At ~360 px, do not solve six destinations by shrinking labels to unreadable sizes.

Acceptable solutions include:
- six compact icon destinations if real readability/touch targets work;
- five core destinations plus a distinct, explicit DNA action;
- another clear adaptive pattern that passes the constraints.

Requirements:
- no clipped labels;
- no page-level horizontal overflow;
- predictable active state;
- touch-safe targets;
- keyboard/focus support where applicable;
- safe-area bottom support;
- phone landscape support;
- tablet/desktop do not need to mimic phone bottom nav.

Icons should use the existing visual system or a lightweight line-icon approach already available in the project. Do not add a heavy icon dependency only for this Epic.

Suggested semantic mapping:
- Главная: home/dashboard
- Портфель: briefcase/pie/portfolio
- Аналитика: chart
- Доход: calendar/coins
- Цель: target/flag
- DNA: distinctive world/crystal/DNA treatment consistent with QVANIX

---

## 4. Secondary/tertiary navigation — progressive disclosure

Audit all existing secondary and tertiary pill rows.

Examples include:
- Portfolio: Обзор / Позиции / Структура
- Analytics: Обзор / Риск / Оценка / Доли / Сценарии
- Risk deeper views: Портфель / Сравнение / Окна / Хвостовые риски / Связи / Стресс
- Income: Обзор / Календарь / Источники / Налоги

### Goal
A phone should generally expose one current section selector rather than two or three permanent rows of pills.

### Implement a reusable section selector
Build/reuse a single accessible component that can present:
- current selected section;
- a clear affordance to open choices;
- grouped options where the hierarchy is deep;
- active/check state;
- optional short helper subtitle.

Mobile presentation may be:
- dropdown;
- popover;
- bottom sheet;
- another accessible compact selector.

Desktop/tablet may keep a broader pattern if useful, but the information model should be shared rather than duplicated.

### Risk grouping example
Do not expose six unexplained words in one permanent row.

Possible menu grouping:

`ОСНОВНОЕ`
- Риск портфеля
- Сравнение

`ИСТОРИЧЕСКОЕ`
- Исторические окна
- Стресс-тесты

`СТАТИСТИЧЕСКОЕ`
- Хвостовые риски
- Связи активов / Корреляции

Use actual available views and existing semantics from code; do not create fake screens just to satisfy this example.

### Naming rule
No unexplained abbreviations such as:
- `Сцен.`
- `Хвост`

Prefer full human-readable display names in the selector.
Internal enum names may remain unchanged.

---

## 5. Navigation location awareness

After reducing visible pill rows, the user must still know where they are.

Provide a compact location treatment such as:
- workspace title;
- current section label;
- grouped selector label;
- optional lightweight breadcrumb only where it genuinely improves orientation.

Do not create a giant breadcrumb header on every screen.

Target outcome:
A first-time user can tell the current workspace and section within ~1–2 seconds.

---

## 6. Pult/Home visual hierarchy

Rework the Pult information hierarchy without rewriting its calculations.

### First viewport goal
The first viewport should immediately answer:
- What is my portfolio worth?
- What is the important performance/income/health context?
- Is the data live/fresh?
- Where do I go next for detail?

### Hero
Create/strengthen one dominant capital/value hero.

Possible hero content from already verified data:
- portfolio capital/value;
- account/portfolio name;
- freshness/source indicator;
- current verified period-performance context such as TWR if valid.

**Do not add daily change** unless current `main` now contains a separately verified daily contract. If not, omit it.

### Primary metrics below hero
Give stronger weight to a small number of useful metrics such as:
- TWR;
- received income;
- Health Score / portfolio state;
- benchmark context where verified.

### Secondary context
Move things such as:
- CBR rate;
- timestamps;
- source/coverage;
- metadata;
into clearly secondary treatment.

Avoid six equal tiles if hierarchy can communicate meaning better.

Do not remove access to existing important information; reorganize it.

---

## 7. Typography/readability system

Audit mobile text throughout the touched surfaces.

### Rules
- Do not use 8–9 px text as a normal narrow-phone solution.
- Do not compress labels simply to keep everything above the fold.
- Preserve the new scroll-first deep-workspace policy.
- Establish/use a consistent visual type hierarchy:
  - Hero number
  - Primary metric
  - Section heading
  - Body
  - Caption
  - Metadata

Any new mobile-specific CSS should improve real readability rather than merely density.

### Contrast
Audit the dark theme hierarchy.
Improve muted/secondary text where it is too faint.
Do not claim exact WCAG conformance without actual tool validation; document what was checked and what remains to verify with a contrast tool.

---

## 8. Semantic colors

Unify presentation semantics where the current UI is inconsistent.

Keep separate roles for:
- positive/gain;
- negative/loss;
- warning/attention;
- neutral/muted context.

Do not use the same amber/orange treatment interchangeably for both loss and warning.

Reuse design tokens where possible instead of sprinkling ad-hoc colors.

Do not perform a full theme rewrite.

---

## 9. Glossary and contextual help

Reuse the existing `ContextHelp` architecture if possible rather than creating a parallel help system.

Implement a reusable glossary/help boundary for complex terms.

At minimum cover meaningful first occurrences of:

### TWR
Display name: `TWR`
Simple explanation:
`Доходность портфеля без искажения от пополнений и выводов. Удобна для сравнения результата стратегии с индексом.`
Advanced layer may explain that external cash flows are neutralized by the time-weighted method.

### XIRR
Display name: `XIRR`
Simple explanation:
`Ваша личная годовая доходность с учётом дат и размеров пополнений и выводов.`
Advanced layer may explain money-weighted return / dated cash flows.

### Здоровье портфеля
Simple explanation:
`Сводная оценка состояния портфеля по прозрачным компонентам риска и структуры. Нажмите, чтобы увидеть, из чего складывается балл.`
Never present it as a prediction of future performance.

### Хвостовые риски
Simple explanation:
`Оценка редких, но особенно сильных отрицательных движений. Помогает увидеть риск, который плохо заметен по обычной волатильности.`

### Стресс-тест
Simple explanation:
`Показывает, как текущая структура могла бы вести себя при повторении выбранного исторического шока или сценария по утверждённой методике.`
Must remain clearly scenario/historical replay context, not forecast.

### Допуск по ребалансировке
Simple explanation:
`Показывает, насколько фактическая доля класса активов может отклониться от целевой, прежде чем потребуется внимание.`
Do not convert it into a buy/sell command.

### Покрытие выплат
Simple explanation:
`Доля данных о выплатах, которую удалось подтвердить через используемые источники. Низкое покрытие означает, что календарь может быть неполным.`

### Вне модели
Simple explanation:
`Активы, для которых сейчас нет подходящего целевого класса или правила сравнения. Они не должны незаметно искажать расчёт.`

### НДФЛ к возврату / ИИС
Use the exact current deterministic/legal implementation wording. Do not expand legal claims beyond the implemented model; reuse existing tax-methodology documentation if present.

### UX rule
Do not put a `?` beside every label.
Use contextual help at the first significant occurrence and deeper methodology/detail views where appropriate.

Accessibility:
- tap/click reachable;
- keyboard reachable;
- not hover-only;
- readable on narrow phone.

---

## 10. Empty/loading/error states

Do not regress the existing explicit data-state model.

Preserve distinction between:
- LOADING
- LIVE
- PARTIAL
- STALE
- FALLBACK
- ERROR

Loading must not look like a genuine `0 ₽` portfolio.

For an empty/no-position user state, use human copy plus a clear next action rather than a blank dashboard.

Suggested neutral copy direction:
`Портфель пока пуст. Подключите счёт или добавьте данные, чтобы QVANIX построил структуру и аналитику.`

Do not assume a signup/broker-connect feature exists if it does not yet exist in current code; use the actual available action.

---

## 11. Preserve Pulse/Screenshot mode

Pulse/Screenshot mode is intentionally different from normal deep-workspace scrolling.

Requirements:
- true viewport-fixed output;
- one-screen presentation;
- no secondary navigation clutter;
- readable metrics;
- QVANIX identity;
- verified data only.

Do not break the recent mobile fixed-overlay correction.

---

## 12. Preserve Asset Workspace behavior

Do not create a second Asset Workspace.

The current canonical Asset Workspace must remain reachable from its existing entry points.

Do not break:
- `instrumentUid` preservation;
- exact identity/fail-closed semantics;
- independent history/fundamentals loading;
- FIGI-safe income attribution;
- sticky/reachable mobile back action;
- lazy loading/bundle split.

This Epic may improve navigation around Asset Workspace but should not expand financial methodology there unless needed to fix a regression.

---

## 13. Responsive acceptance criteria

At minimum reason/test available tooling for:
- 360 px Android
- 375 px
- 390 px
- 430 px
- Samsung Internet behavior
- Chrome Android behavior
- phone landscape
- tablet portrait/landscape
- desktop

Requirements:
- no page-level horizontal overflow;
- no clipped primary navigation;
- no inaccessible selector items;
- safe-area handling;
- dynamic viewport compatibility;
- one coherent vertical scroll owner per workspace where practical;
- no fixed-height content clipping;
- no tiny-font density hacks;
- touch and keyboard usability.

If no browser binary exists in the Codex container, do not fake screenshot validation. Perform deterministic CSS/component tests where possible and explicitly document that real-device Samsung validation is required after merge.

---

## 14. Accessibility

Audit changed components for:
- semantic nav/menu/select roles as appropriate;
- focus-visible;
- keyboard operation;
- `aria-current` / `aria-selected` or equivalent semantics;
- Escape/close behavior for menus/sheets where applicable;
- touch target size;
- reduced-motion compatibility;
- no color-only meaning.

Do not build a custom dropdown that is impossible to navigate with keyboard or screen reader.

---

## 15. Architecture/code quality

Prefer configuration-driven navigation rather than scattered string conditionals.

Suggested separation:
- canonical navigation model / labels / groups;
- reusable mobile/desktop renderer;
- current app/workspace state integration;
- glossary/help registry;
- presentation CSS.

Avoid rewriting App state wholesale unless audit shows it is necessary.

Do not create duplicate state that can drift from existing workspace state.

---

## 16. Tests

Add meaningful regression coverage for new pure logic/components where the current test strategy supports it.

At minimum aim to cover:
- primary nav model contains every canonical workspace including DNA;
- current active workspace maps correctly;
- secondary selector grouping contains all existing views and no unreachable view;
- no abbreviated presentation labels for the targeted sections;
- glossary registry has required terms and non-empty simple explanations;
- selector selection maps to the existing canonical internal view enums/state;
- empty/loading model does not regress into fake live zero state if touched;
- navigation helper logic is deterministic.

Do not add brittle snapshot tests that merely freeze markup without protecting behavior.

Run all existing required suites.

---

## 17. Bundle/performance gate

Do not raise current bundle limits.

If this Epic pushes the initial bundle over budget:
- code-split optional menus/help content;
- reuse existing components/dependencies;
- remove duplication;
- keep Asset/Goal/DNA deferred where currently designed.

Do not pull Pixi into the normal initial UI bundle.

---

## 18. Review passes before PR completion

Perform four explicit passes.

### QUANT
- no financial formulas changed unintentionally;
- no daily change invented;
- no missing values converted to zero;
- no methodology labels changed to misleading terms.

### CODE
- no duplicate navigation/data boundaries;
- no leaked credentials;
- app state remains coherent;
- no inaccessible custom control;
- no page-level overflow introduced.

### MOBILE
- 360–430 widths;
- bottom/primary nav reachability;
- selector reachability;
- scroll ownership;
- readable text;
- landscape/safe-area sanity.

### RELEASE
- `npm`/build/test/security gates;
- bundle budget;
- Asset/Pulse regressions;
- DNA ownership untouched;
- no unrelated backend methodology changes.

---

## 19. GitHub workflow

Create a dedicated branch from latest `main`.

Do not push feature implementation directly to `main`.

Create one coherent PR for this UX Architecture Epic.

PR body must include:
- problem statement;
- audit findings;
- navigation architecture decision;
- mobile behavior;
- Pult hierarchy changes;
- glossary/help implementation;
- accessibility work;
- methodology guarantees;
- tests;
- bundle result;
- limitations / real-device checks still required.

Wait for full CI.
Fix real CI failures without weakening gates.
Inspect automated review findings and address genuine correctness/accessibility/mobile issues.

**Do not merge the PR. Stop after the PR is ready for project-lead review.**

---

## 20. Progress checkpoint

Create:

`progress/YYYY-MM-DD-ux-architecture-comprehension-epic.md`

Record:
- starting `main` SHA;
- diagnosis;
- navigation decisions;
- mobile primary-nav solution and why;
- secondary selector/grouping model;
- Pult hierarchy changes;
- glossary/context-help architecture;
- terms added;
- typography/contrast decisions;
- accessibility decisions;
- tests;
- bundle sizes;
- CI;
- automated review findings/fixes;
- remaining Samsung checks;
- recommended next Epic.

Also update canonical docs if this Epic changes a durable product rule.

---

## 21. Definition of Done

The Epic is ready for review when:

- [ ] narrow mobile primary navigation does not clip/wrap into an ugly second row;
- [ ] DNA remains clearly reachable;
- [ ] secondary/tertiary navigation no longer requires multiple permanent pill rows on phone;
- [ ] deeper Risk views are meaningfully grouped;
- [ ] unexplained UI abbreviations such as `Сцен.` / `Хвост` are removed from the targeted navigation;
- [ ] Pult has a clear hero hierarchy and does not invent daily change;
- [ ] important complex metrics have contextual help using one reusable system;
- [ ] mobile typography/readability is improved rather than compressed;
- [ ] normal deep workspaces may scroll vertically;
- [ ] Pulse mode remains one-screen/fixed;
- [ ] no page-level horizontal overflow;
- [ ] accessibility semantics exist for new navigation/selectors;
- [ ] existing financial methodology is unchanged;
- [ ] existing Asset identity/history/fundamentals safeguards remain intact;
- [ ] tests pass;
- [ ] security gates pass;
- [ ] bundle budget passes unchanged;
- [ ] progress checkpoint exists;
- [ ] PR is created and ready for external review;
- [ ] PR is NOT merged by Codex.

---

## 22. If task limit is reached

Priority:

P0
1. primary mobile navigation
2. secondary/tertiary progressive disclosure
3. no clipped/unreachable navigation
4. Pult hierarchy without fake data
5. mobile readability

P1
6. contextual help/glossary
7. accessibility refinement
8. semantic-color consistency

P2
9. non-critical polish/motion

Do not spend most of the task on decorative animation before navigation and comprehension are correct.

---

## 23. Final Codex report

At the end, report:
1. starting main SHA;
2. branch;
3. audit findings;
4. navigation solution;
5. Pult hierarchy solution;
6. glossary/help work;
7. responsive/accessibility work;
8. tests added;
9. CI result;
10. bundle sizes;
11. automated review findings addressed;
12. PR number;
13. head SHA;
14. exact Samsung validation checklist;
15. recommended next Epic.

Do not finish with only “done”.
