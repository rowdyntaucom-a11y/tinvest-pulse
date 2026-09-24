import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const app=readFileSync(new URL("../src/app/V3App.tsx",import.meta.url),"utf8");

assert.match(app,/useLayoutEffect\(\(\)=>\{if\(typeof window==="undefined"\)return;window\.scrollTo/);
assert.match(app,/querySelector<HTMLElement>\("\.v3-app :is\(\.v3-assets,\.v3-analysis,\.v3-income,\.v3-goal,\.v3-home\)"\)/);
assert.match(app,/owner\.scrollTop=0/);
assert.match(app,/owner\.scrollLeft=0/);
assert.match(app,/\[workspace,shell,selectedAsset\]/);
console.log("workspace inner-scroll reset regression: ok");
