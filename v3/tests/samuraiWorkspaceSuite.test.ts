import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const chrome=readFileSync(new URL("../src/samurai/SamuraiWorkspaceChrome.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiWorkspaceSuite.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
for(const file of["../src/assets/V3Assets.tsx","../src/analysis/V3Analysis.tsx","../src/income/V3Income.tsx","../src/goal/V3Goal.tsx"]){
 const ui=readFileSync(new URL(file,import.meta.url),"utf8");
 assert.match(ui,/SamuraiWorkspaceChrome/);
}
for(const token of["FORMATION // 02","TACTICAL // 03","TREASURY // 04","PATH // 05"])assert.ok(
 ["../src/assets/V3Assets.tsx","../src/analysis/V3Analysis.tsx","../src/income/V3Income.tsx","../src/goal/V3Goal.tsx"].some(file=>readFileSync(new URL(file,import.meta.url),"utf8").includes(token))
);
assert.match(chrome,/sam-workspace-chrome/);
for(const selector of["v3-assets-hero","v3-analysis-grid","v3-income-hero","v3-goal-progress"])assert.match(css,new RegExp(selector));
assert.match(css,/sam-workspace-chrome__rail/);
assert.doesNotMatch(css,/backdrop-filter/);
assert.ok(main.indexOf("samuraiWorkspaceSuite.css")<main.indexOf("mobilePerformance.css"));
console.log("samurai workspace suite regression: ok");