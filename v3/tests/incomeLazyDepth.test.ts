import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const income=readFileSync(new URL("../src/income/V3Income.tsx",import.meta.url),"utf8"),app=readFileSync(new URL("../src/app/V3App.tsx",import.meta.url),"utf8");
assert.match(income,/const V3IncomeDepth=lazy\(\(\)=>import\("\.\/V3IncomeDepth"\)/);assert.match(income,/mode==="detailed"/);assert.match(income,/positions={positions}/);assert.match(app,/positions={positions} onOpenAsset={setSelectedAsset}/);assert.match(income,/Открываем подробный календарь выплат/);
console.log("v3 deferred income depth contracts: ok");
