import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const lab=readFileSync(new URL("../src/goal/V3GoalScenarioLab.tsx",import.meta.url),"utf8");
const goal=readFileSync(new URL("../src/goal/V3Goal.tsx",import.meta.url),"utf8");
const app=readFileSync(new URL("../src/app/V3App.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/goalScenarioLab.css",import.meta.url),"utf8");

assert.match(goal,/const V3GoalScenarioLab=lazy/);
assert.match(lab,/V3SectionSelector label="Режим"/);
assert.match(lab,/TAB_OPTIONS/);
assert.doesNotMatch(lab,/v3-goal-scenario-tabs/);
assert.match(goal,/shell==="carbon"||mode==="detailed"/);
assert.match(goal,/cos-goal-depth-cue/);
assert.match(goal,/scrollToLab/);
assert.match(goal,/onTargetChange={commitTarget}/);
assert.match(goal,/history:HistoryPoint[]/);
assert.match(app,/history={history}/);

for(const label of[
 "План цели","Исторический диапазон","Капитал","Пассивный доход","Горизонт","Пополнение",
 "Корректировать цель на инфляцию","Увеличивать пополнения","Реинвестировать выплаты",
 "Изменение цены","Доходность выплат","Индекс-сценарий","Альтернативный сценарий","Таблица по годам"
])assert.match(lab,new RegExp(label));

assert.match(lab,/EMPTY_DRAFT/);
assert.match(lab,/SETTINGS_KEY/);
assert.match(lab,/localStorage.setItem/);
assert.match(lab,/v3-goal-scenario-advanced/);
assert.match(lab,/v3-goal-scenario-outcome/);
assert.match(lab,/v3-goal-alternative/);
assert.match(lab,/v3-goal-scenario-table/);
assert.match(lab,/solveV3RequiredMonthlyContribution/);

assert.match(css,/Goal Lab v2/);
assert.match(css,/v3-goal-lab-segmented/);
assert.match(css,/v3-goal-alternative/);
assert.match(css,/v3-goal-scenario-table/);
assert.match(lab,/Пустые поля не заменяются/);
assert.match(lab,/не подставляет цель или доходность автоматически/);
assert.match(lab,/historical block bootstrap/i);
assert.match(lab,/P10/);assert.match(lab,/Медиана/);assert.match(lab,/P90/);
assert.match(lab,/не является прогнозом вероятности достижения цели/);
assert.doesNotMatch(lab,/Math.random|expectedYield|buy|sell/i);
assert.match(lab,/import"../styles/goalScenarioLab.css"/);
assert.match(css,/max-width:430px/);assert.match(css,/max-width:359px/);assert.match(css,/focus-visible/);
console.log("v3 goal scenario lab v2 UI contracts: ok");
