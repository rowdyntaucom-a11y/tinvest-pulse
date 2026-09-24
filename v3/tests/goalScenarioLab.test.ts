import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const lab=readFileSync(new URL("../src/goal/V3GoalScenarioLab.tsx",import.meta.url),"utf8");
const goal=readFileSync(new URL("../src/goal/V3Goal.tsx",import.meta.url),"utf8");
const app=readFileSync(new URL("../src/app/V3App.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/goalScenarioLab.css",import.meta.url),"utf8");

for(const token of[
 "const V3GoalScenarioLab=lazy",
 'V3SectionSelector label="Режим сценария"',
 "TAB_OPTIONS","cos-goal-depth-cue","scrollToLab","onTargetChange={commitTarget}","history:HistoryPoint[]"
])assert.ok((token.startsWith("const V3Goal")?goal:token==="history:HistoryPoint[]"?goal:token==="cos-goal-depth-cue"||token==="scrollToLab"||token==="onTargetChange={commitTarget}"?goal:lab).includes(token),token);

assert.ok(goal.includes('shell==="carbon"||shell==="samurai"||mode==="detailed"'));
assert.ok(app.includes("history={history}"));
assert.ok(!lab.includes("v3-goal-scenario-tabs"));

for(const label of[
 "План цели","Исторический диапазон","Капитал","Пассивный доход","Горизонт","Пополнение",
 "Корректировать цель на инфляцию","Увеличивать пополнения","Реинвестировать выплаты",
 "Изменение цены","Доходность выплат","Индекс-сценарий","Альтернативный сценарий","Таблица по годам"
])assert.ok(lab.includes(label),label);

for(const token of[
 "EMPTY_DRAFT","SETTINGS_KEY","localStorage.setItem","v3-goal-scenario-advanced",
 "v3-goal-scenario-outcome","v3-goal-alternative","v3-goal-scenario-table",
 "solveV3RequiredMonthlyContribution","Пустые поля не заменяются",
 "не подставляет цель или доходность автоматически","P10","Медиана","P90",
 "не является прогнозом вероятности достижения цели",'import"../styles/goalScenarioLab.css"'
])assert.ok(lab.includes(token),token);

for(const token of["Goal Lab v2","v3-goal-lab-segmented","v3-goal-alternative","v3-goal-scenario-table","max-width:430px","max-width:359px","focus-visible"])assert.ok(css.includes(token),token);

assert.match(lab,/historical block bootstrap/i);
assert.doesNotMatch(lab,/Math\.random|expectedYield|\bbuy\b|\bsell\b/i);
console.log("v3 goal scenario lab v2 UI contracts: ok");
