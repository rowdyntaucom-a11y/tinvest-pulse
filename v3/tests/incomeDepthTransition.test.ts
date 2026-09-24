import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const view=readFileSync(new URL("../src/income/V3Income.tsx",import.meta.url),"utf8"),css=readFileSync(new URL("../src/styles/incomeDepthTransition.css",import.meta.url),"utf8");
assert.match(view,/v3-income-depth-cue/);assert.match(view,/scrollIntoView/);assert.match(view,/prefers-reduced-motion/);assert.match(view,/v3-income-depth-anchor/);assert.match(view,/shell==="samurai"\|\|shell==="carbon"/);
assert.match(css,/data-shell="carbon"/);assert.match(css,/data-shell="samurai"/);assert.match(css,/FLOW \/\/ VERIFIED/);assert.match(css,/КНИГА ПОТОКА/);assert.match(css,/100svh/);assert.match(css,/prefers-reduced-motion:reduce/);
console.log("v3 Income depth transition contracts: ok");
