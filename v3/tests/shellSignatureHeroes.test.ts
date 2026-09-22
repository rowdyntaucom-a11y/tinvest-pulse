import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const finish=readFileSync(new URL("../src/styles/workspaceWorldFinish.css",import.meta.url),"utf8");
assert.match(finish,/Shell signature heroes v19/);

const expected=[
  'data-shell="samurai"]:not([data-workspace="home"]){\n  --v3-answer-radius:20px 7px 20px 7px',
  'data-shell="carbon"]:not([data-workspace="home"]){\n  --v3-answer-radius:9px 23px 9px 23px',
  'data-shell="core"]:not([data-workspace="home"]){\n  --v3-answer-radius:24px 12px 24px 12px',
  'data-shell="horizon"]:not([data-workspace="home"]){\n  --v3-answer-radius:14px',
  'data-shell="aurora"]:not([data-workspace="home"]){\n  --v3-answer-radius:22px',
  'data-shell="minimal"]:not([data-workspace="home"]){\n  --v3-answer-radius:8px'
];
for(const part of expected) assert.ok(finish.includes(part),part);

for(const selector of[
  ".v3-assets-hero",
  ".v3-analysis-signal>div:first-child",
  ".v3-income-hero",
  ".v3-goal-hero"
]) assert.ok(finish.includes(selector),selector);

const v19=finish.slice(finish.indexOf("Shell signature heroes v19"));
assert.ok(v19.includes("--v3-answer-mark"));
assert.ok(v19.includes("background:#9a6a2a"));
assert.ok(v19.includes("transform:skewX(-28deg)"));
assert.doesNotMatch(v19,/animation:/);

console.log("shell signature heroes regression: ok");
