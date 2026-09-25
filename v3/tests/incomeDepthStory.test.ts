import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const ui=readFileSync(new URL("../src/income/V3Income.tsx",import.meta.url),"utf8"),story=readFileSync(new URL("../src/styles/incomeStory.css",import.meta.url),"utf8"),depth=readFileSync(new URL("../src/styles/incomeDepth.css",import.meta.url),"utf8");
assert.match(ui,/v3-income-depth-cue/);assert.match(ui,/scrollIntoView/);assert.match(ui,/prefers-reduced-motion/);assert.match(ui,/V3IncomeDepth positions=/);
assert.doesNotMatch(ui,/mode==="detailed"&&model\.trusted&&<Suspense/);
assert.match(story,/v3-income-depth-cue/);assert.match(story,/data-shell="samurai"/);assert.match(story,/data-shell="carbon"/);
assert.match(depth,/data-shell="samurai".*v3-income-depth/);assert.match(depth,/data-shell="carbon".*v3-income-depth/);
console.log("v3 income depth story contracts: ok");
