import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const depth=readFileSync(new URL("../src/assets/V3AssetsDepth.tsx",import.meta.url),"utf8");
const holdings=readFileSync(new URL("../src/assets/V3HoldingsExplorer.tsx",import.meta.url),"utf8");
const selector=readFileSync(new URL("../src/navigation/V3SectionSelector.tsx",import.meta.url),"utf8");
const marketApi=readFileSync(new URL("../src/analysis/marketScreenerApi.ts",import.meta.url),"utf8");
const coreCss=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const marketCss=readFileSync(new URL("../src/styles/marketIntelligenceWorkspace.css",import.meta.url),"utf8");

test("portfolio weight is neutral and explicitly labelled",()=>{
 assert.match(core,/neutralPct/);
 assert.match(core,/доля портфеля/);
 assert.match(core,/% портфеля/);
 assert.doesNotMatch(core,/function AssetRow[\s\S]*?<em>\{dec\.format\(w\)\}%<\/em>/);
});

test("portfolio professional analytics are gated and split into subviews",()=>{
 assert.match(core,/Проф\. анализ/);
 assert.match(depth,/useState<DepthMode>\("overview"\)/);
 for(const mode of["overview","equity","bonds","positions"])assert.match(depth,new RegExp('mode==="'+mode+'"'));
 assert.doesNotMatch(depth,/01 · СОСТАВ/);
 assert.match(depth,/showClassSummary=\{false\}/);
});

test("holdings nested in professional depth do not duplicate class summary",()=>{
 assert.match(holdings,/showClassSummary=true/);
 assert.match(holdings,/showClassSummary&&<div className="v3-holdings-class-strip"/);
 assert.match(depth,/initialDimension="instrument" showClassSummary=\{false\}/);
});

test("section chooser no longer delegates to native Android select",()=>{
 assert.match(selector,/aria-haspopup="dialog"/);
 assert.match(selector,/role="dialog"/);
 assert.doesNotMatch(selector,/<select/);
});

test("market failures do not expose raw transport codes",()=>{
 assert.doesNotMatch(marketApi,/reason:"HTTP "/);
 assert.match(marketApi,/Не удалось получить данные рынка/);
 assert.match(marketCss,/white-space:nowrap/);
});

test("short structure content sizes to content",()=>{
 assert.match(coreCss,/\.sb-portfolio-structure\{min-height:0!important;height:auto!important\}/);
});
