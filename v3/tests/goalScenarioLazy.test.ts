import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const goal=readFileSync(new URL("../src/goal/V3Goal.tsx",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
const lab=readFileSync(new URL("../src/goal/V3GoalScenarioLab.tsx",import.meta.url),"utf8");
assert.match(goal,/lazy\(\(\)=>import\("\.\/V3GoalScenarioLab"\)/);
assert.match(goal,/Suspense fallback/);
assert.match(lab,/goalScenarioLab\.css/);
assert.doesNotMatch(main,/goalScenarioLab\.css/);
console.log("v3 deferred goal scenario lab contracts: ok");
