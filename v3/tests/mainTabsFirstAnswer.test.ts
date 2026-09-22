import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const assets=readFileSync(new URL("../src/assets/V3Assets.tsx",import.meta.url),"utf8");
const finish=readFileSync(new URL("../src/styles/workspaceWorldFinish.css",import.meta.url),"utf8");

assert.match(assets,/v3-assets-hero/);
assert.match(assets,/Стоимость портфеля/);
assert.match(assets,/rub\.format\(total\)/);
assert.match(assets,/base\.length\} позиций/);
assert.doesNotMatch(assets,/Math\.random/);

assert.match(finish,/First-screen answer hierarchy v17/);
for(const selector of[
  ".v3-assets-hero",
  ".v3-analysis-signal>div:first-child",
  ".v3-income-hero",
  ".v3-goal-hero"
]) assert.ok(finish.includes(selector),selector+" must participate in the first-answer hierarchy");
assert.ok(finish.includes("color:var(--v3-accent)!important"));
assert.ok(finish.includes("font-variant-numeric:tabular-nums"));
assert.ok(finish.includes("z-index:0"));
assert.ok(finish.includes("z-index:1"));
assert.match(finish,/@media\(max-width:699px\)[\s\S]*backdrop-filter:none!important/);
assert.doesNotMatch(finish.slice(finish.indexOf("First-screen answer hierarchy v17")),/animation:/);

console.log("main tabs first-answer regression: ok");
