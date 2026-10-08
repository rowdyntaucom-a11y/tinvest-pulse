import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
assert.match(core,/className="sb-pulse-kpi-action"[^>]*disabled=\{!largest\}[^>]*onClick=\{\(\)=>largest&&onOpenAsset\(largest\)\}/);
assert.match(core,/className="sb-analytic-row" onClick=\{\(\)=>onOpenAsset\(x\)\}/);
assert.match(css,/\.sb-pulse-kpis \.sb-pulse-kpi-action/);
assert.match(css,/\.sb-analytic-list \.sb-analytic-row/);
assert.match(css,/focus-visible/);
console.log("analytics actionability v217 regression: ok");
