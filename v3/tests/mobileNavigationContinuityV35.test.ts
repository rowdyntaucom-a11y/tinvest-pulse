import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");

test("asset detail remembers the list scroll position and restores it on back",()=>{
 assert.match(core,/assetReturnY=useRef\(0\)/);
 assert.match(core,/assetReturnY\.current=window\.scrollY/);
 assert.match(core,/onBack=\{closeAsset\}/);
 assert.match(core,/scrollTo\(\{top:y,behavior:"auto"\}\)/);
 assert.match(core,/onOpenAsset=\{openAsset\}/);
});

test("nested workspace switches no longer force the page back to zero",()=>{
 assert.match(core,/selectHub=\(x:Hub\)=>setHub\(x\)/);
 assert.match(core,/selectPortfolioMode=.*=>setPortfolioMode\(x\)/);
 assert.match(core,/selectIncomeMode=.*=>setIncomeMode\(x\)/);
 assert.doesNotMatch(core,/selectHub=.*resetViewport/);
 assert.doesNotMatch(core,/selectPortfolioMode=.*resetViewport/);
 assert.doesNotMatch(core,/selectIncomeMode=.*resetViewport/);
});

test("major bottom navigation still resets to the top",()=>{
 assert.match(core,/go=\(x:Tab\)=>\{setAsset\(null\);setTab\(x\);resetViewport\(\)\}/);
});

test("tool changes reveal the stage without an aggressive start jump",()=>{
 assert.match(toolbox,/scrollIntoView\(\{block:"nearest",behavior:"auto"\}\)/);
 assert.doesNotMatch(toolbox,/scrollIntoView\(\{block:"start",behavior:"auto"\}\)/);
});

test("mobile navigation surfaces use stable touch and scroll anchoring rules",()=>{
 assert.match(css,/\/\* v35 navigation continuity \*\//);
 assert.match(css,/overflow-anchor:none/);
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/scroll-margin-top:86px/);
});
