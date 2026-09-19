import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const assets=readFileSync(new URL("../src/assets/V3Assets.tsx",import.meta.url),"utf8"),explorer=readFileSync(new URL("../src/assets/V3HoldingsExplorer.tsx",import.meta.url),"utf8"),main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
assert.match(assets,/lazy\(\(\)=>import\("\.\/V3HoldingsExplorer"\)/);assert.match(assets,/Suspense fallback/);assert.match(explorer,/import"\.\.\/styles\/holdingsExplorer\.css"/);assert.doesNotMatch(main,/holdingsExplorer\.css/);
console.log("v3 deferred holdings explorer contracts: ok");
