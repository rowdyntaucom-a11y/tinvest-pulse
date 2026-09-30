import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const coreCss=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const analytics=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const proCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");
const glossary=readFileSync(new URL("../src/help/V3GlossaryHelp.tsx",import.meta.url),"utf8");
const glossaryCss=readFileSync(new URL("../src/styles/glossaryHelp.css",import.meta.url),"utf8");
const breakpoints=readFileSync(new URL("../src/responsive/qvanixBreakpoints.ts",import.meta.url),"utf8");

test("Core owns one named phone/tablet/desktop breakpoint contract",()=>{
 assert.match(breakpoints,/tablet:700/);
 assert.match(breakpoints,/desktop:900/);
 assert.match(breakpoints,/QvanixLayoutTier="phone"\|"tablet"\|"desktop"/);
 assert.match(breakpoints,/resolveQvanixLayout/);
 assert.match(core,/useQvanixLayoutTier/);
 assert.match(core,/data-layout=\{layout\}/);
});

test("desktop Core replaces bottom tabbar with a left navigation rail",()=>{
 assert.match(coreCss,/\.sb\[data-layout="desktop"\] \.sb-nav\{position:fixed/);
 assert.match(coreCss,/flex-direction:column/);
 assert.match(coreCss,/width:196px/);
 assert.match(coreCss,/padding:30px 0 56px 226px/);
 assert.match(coreCss,/1280px/);
});

test("tablet and desktop portfolio rows expose stable table columns without inventing sector data",()=>{
 assert.match(core,/sb-asset-table-head/);
 for(const label of["Актив","Доля","Стоимость","P/L позиции"])assert.match(core,new RegExp(label));
 assert.match(core,/sb-asset-pnl/);
 assert.match(coreCss,/grid-template-columns:minmax\(220px,2fr\) minmax\(90px,.7fr\) minmax\(130px,1fr\) minmax\(120px,.9fr\)/);
 assert.doesNotMatch(core,/Сектор/);
});

test("analytics chooser is one component with mobile sheet and desktop anchored popover",()=>{
 assert.match(analytics,/core-analytics-depth__picker-anchor/);
 assert.match(analytics,/role="dialog"/);
 assert.match(proCss,/data-layout="desktop".*core-analytics-depth__picker-backdrop/);
 assert.match(proCss,/position:absolute/);
 assert.match(proCss,/width:380px/);
 assert.match(proCss,/pointer-events:none/);
});

test("glossary keeps tap dialog and adds hover preview for pointer devices",()=>{
 assert.match(glossary,/v3-glossary-help__hovercard/);
 assert.match(glossary,/onClick=\{\(\)=>setOpen\(true\)\}/);
 assert.match(glossaryCss,/@media\(hover:hover\) and \(pointer:fine\)/);
 assert.match(glossaryCss,/v3-glossary-help__trigger:hover/);
});
