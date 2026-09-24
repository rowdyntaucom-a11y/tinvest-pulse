import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const goal=readFileSync(new URL("../src/goal/V3Goal.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiGoalParity.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

for(const token of[
 "sam-goal-command","sam-goal-path-rail","sam-goal-depth-cue","sam-goal-scene-spacer",
 'shell==="samurai"||mode==="detailed"',"V3GoalScenarioLab"
])assert.ok(goal.includes(token),token);

for(const token of[
 "Samurai Goal parity","sam-goal-command","sam-goal-path-rail","sam-goal-depth-cue",
 "sam-goal-scene-spacer","v3-goal-lab-v2","samGoalParityCue","prefers-reduced-motion"
])assert.ok(css.includes(token),token);

assert.ok(css.includes(".sam-goal-empty-path{\n    display:none!important"));
assert.ok(main.includes('import"./styles/samuraiGoalParity.css"'));
assert.ok(main.indexOf("samuraiChamberDepth.css")<main.indexOf("samuraiGoalParity.css"));
assert.ok(main.indexOf("samuraiGoalParity.css")<main.indexOf("mobilePerformance.css"));
assert.doesNotMatch(css,/backdrop-filter/);
console.log("samurai Goal parity regression: ok");
