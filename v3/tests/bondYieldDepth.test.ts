import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const depth=readFileSync(new URL("../src/assets/V3AssetsDepth.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/assets/V3BondYieldDepth.tsx",import.meta.url),"utf8");
const api=readFileSync(new URL("../src/assets/bondYieldApi.ts",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/bondYieldDepth.css",import.meta.url),"utf8");

test("Assets bond chapter mounts verified bond intelligence",()=>{
 assert.match(depth,/V3BondYieldDepth/);
 assert.match(depth,/Расширенный слой YTM и modified duration/);
 assert.match(ui,/YTM · взвешенная/);
 assert.match(ui,/Modified duration/);
 assert.match(ui,/Чувствительность по duration/);
});

test("bond UI exposes source and coverage instead of inventing values",()=>{
 assert.match(ui,/T-Bank market yield/);
 assert.match(ui,/покрытие/);
 assert.match(ui,/флоатер/);
 assert.match(ui,/амортизация/);
 assert.match(ui,/duration остаётся «—»/);
 assert.match(api,/\/api\/shield\/bonds/);
});

test("bond intelligence has mobile layout",()=>{
 assert.match(css,/@media\(max-width:430px\)/);
 assert.match(css,/v3-bond-yield-issue-grid/);
});
