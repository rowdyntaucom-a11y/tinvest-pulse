import assert from"node:assert/strict";
import{INCOME_DEPTH_VIEW_STORAGE_KEY,normalizeIncomeDepthViewV202}from"../src/income/incomeDepthViewMemoryV202.ts";
assert.equal(INCOME_DEPTH_VIEW_STORAGE_KEY,"qvanix-income-depth-view-v202");
assert.equal(normalizeIncomeDepthViewV202("calendar",false),"calendar");
assert.equal(normalizeIncomeDepthViewV202("trust",false),"overview");
assert.equal(normalizeIncomeDepthViewV202("trust",true),"trust");
assert.equal(normalizeIncomeDepthViewV202("bad",true),"overview");
console.log("income depth view memory v202 tests passed");
