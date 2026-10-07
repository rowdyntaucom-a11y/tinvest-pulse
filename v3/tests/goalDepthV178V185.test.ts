import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const lab=readFileSync(new URL("../src/goal/V3GoalScenarioLab.tsx",import.meta.url),"utf8");
for(const token of[
"V3GoalCapitalAttributionV178","V3GoalInflationDepthV179","V3GoalContributionLoadV180","V3GoalReinvestmentDeltaV181",
"V3GoalReturnSensitivityV182","V3GoalContributionSensitivityV183","V3GoalCheckpointDepthV184","V3GoalIncomeYieldSensitivityV185"
])assert.ok(lab.includes(token),token);
const models=["goalCapitalAttributionV178","goalInflationDepthV179","goalContributionLoadV180","goalReinvestmentDeltaV181","goalReturnSensitivityV182","goalContributionSensitivityV183","goalCheckpointDepthV184","goalIncomeYieldSensitivityV185"];
for(const name of models){const s=readFileSync(new URL("../src/goal/"+name+".ts",import.meta.url),"utf8");assert.doesNotMatch(s,/\bbuy\b|\bsell\b|рекоменд(овать|ация)/i,name)}
assert.match(lab,/Все будущие параметры — пользовательские предпосылки/);
console.log("goal depth v178-v185 integration tests passed");