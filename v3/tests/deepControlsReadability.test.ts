import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const finish=readFileSync(new URL("../src/styles/workspaceWorldFinish.css",import.meta.url),"utf8");
assert.match(finish,/Deep controls readability v18/);
for(const selector of[
  ".v3-asset-tools button",
  ".v3-holdings-rail button",
  ".v3-holdings-class-strip button",
  ".v3-goal-scenario-years button",
  ".v3-goal-bootstrap-years button",
  ".v3-income-month-ribbon button",
  ".v3-world-trigger",
  ".v3-world-menu"
]) assert.ok(finish.includes(selector),selector+" must be covered by the deep-control pass");

const v18=finish.slice(finish.indexOf("Deep controls readability v18"));
assert.match(v18,/@media\(max-width:699px\)/);
assert.ok(v18.includes("min-height:44px!important"));
assert.ok(v18.includes("font-size:10px!important"));
assert.ok(v18.includes("backdrop-filter:none!important"));
assert.ok(v18.includes("-webkit-backdrop-filter:none!important"));
assert.ok(v18.includes("background:var(--v3-deep-chrome"));
assert.ok(v18.includes("outline:2px solid var(--v3-accent)!important"));
assert.doesNotMatch(v18,/font-size:[789](?:\.\d+)?px/);
assert.doesNotMatch(v18,/animation:/);

console.log("deep controls readability regression: ok");
