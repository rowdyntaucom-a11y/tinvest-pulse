import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
const finish=readFileSync(new URL("../src/styles/workspaceWorldFinish.css",import.meta.url),"utf8");

const navigationImport='import"./styles/navigation6.css";';
const finishImport='import"./styles/workspaceWorldFinish.css";';
assert.ok(main.includes(navigationImport));
assert.ok(main.includes(finishImport));
assert.ok(main.indexOf(finishImport)>main.indexOf(navigationImport),"workspace finish must load after late feature/navigation CSS");

assert.match(finish,/Main tabs world finish v15/);
for(const shell of ["samurai","carbon","core","horizon","aurora","minimal"]){
  assert.match(finish,new RegExp(`data-shell="${shell}"\\]:not\\(\\[data-workspace="home"\\]\\)`));
}
for(const selector of[
  ".v3-assets-summary article",
  ".v3-analysis-layer",
  ".v3-income-depth",
  ".v3-goal-scenario-lab",
  ".v3-holdings-explorer",
  ".v3-section-selector",
  ".v3-asset-history-card"
]) assert.ok(finish.includes(selector),selector+" must inherit final world material");

assert.ok(finish.includes(".v3-page-head::before"));
assert.ok(finish.includes("linear-gradient(90deg,var(--v3-head-veil)"));
assert.ok(finish.includes(".v3-section-selector select option"));
assert.ok(finish.includes("color:var(--v3-positive)!important"));
assert.ok(finish.includes("color:var(--v3-negative)!important"));
assert.doesNotMatch(finish,/animation:/);
assert.match(finish,/World picker production art v16/);
for(const id of["0aab73df","0aab73e1","0aab73e2","0aab73e3"]) assert.match(finish,new RegExp(id));
assert.match(finish,/cosmos-mixc-master\.webp/);
for(const cls of["world-samurai","world-carbon","world-core","world-horizon","world-aurora","world-minimal"]) assert.ok(finish.includes("."+cls));
assert.ok(finish.includes('.v3-world-trigger>i'));
assert.ok(finish.includes('background-size:cover!important'));

console.log("workspace world finish regression: ok");
