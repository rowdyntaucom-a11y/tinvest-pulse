import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const view=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8"),adapter=readFileSync(new URL("../src/income/incomeDepth.ts",import.meta.url),"utf8"),css=readFileSync(new URL("../src/styles/incomeDepth.css",import.meta.url),"utf8");
for(const helper of["evaluatePayoutTrust","separateTrustedIncomeData","buildIncomeCalendarVisual","buildIncomeSourceRows","buildRealizedIncomeHistory","calculateIncomeStability","calculateIncomeComparablePeriod","buildBondIncomeLinkage"])assert.match(adapter,new RegExp(helper));
assert.match(view,/Календарь/);assert.match(view,/Источники/);assert.match(view,/Нулём считается только полностью наблюдавшийся/);assert.match(view,/fail-closed/);assert.match(view,/точного FIGI/);assert.match(view,/HIGH означает подтверждение/);assert.match(view,/YoC/);assert.match(view,/futureEvents/);assert.doesNotMatch(view,/Math\.random|mock|demo/i);
assert.match(css,/v3-income-month-ribbon/);assert.match(css,/overflow-x:auto/);assert.match(css,/max-width:430px/);assert.match(css,/focus-visible/);
console.log("v3 income depth UI contracts: ok");
