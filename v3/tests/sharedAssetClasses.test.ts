import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const data=readFileSync(new URL("../src/data/assetClasses.ts",import.meta.url),"utf8"),assets=readFileSync(new URL("../src/assets/V3Assets.tsx",import.meta.url),"utf8"),analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8"),donut=readFileSync(new URL("../src/analysis/V3AllocationDonut.tsx",import.meta.url),"utf8");
assert.match(data,/classifyPosition/);for(const label of["Акции","Облигации","Фонды","Валюта","Фьючерсы","Другое"])assert.match(data,new RegExp(label));
assert.match(assets,/assetClassKey/);assert.match(assets,/positionAssetClassLabel/);assert.match(analysis,/assetClassLabel\(assetClassKey\(item\.instrumentType\)\)/);assert.match(donut,/assetClassLabel\(assetClassKey\(x\.instrumentType\)\)/);
assert.doesNotMatch(analysis,/raw\.includes\("bond"\)/);assert.doesNotMatch(donut,/t\.includes\("bond"\)/);
console.log("v3 shared asset classification contracts: ok");
