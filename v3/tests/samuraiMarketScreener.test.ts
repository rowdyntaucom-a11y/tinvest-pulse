import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/analysis/V3MarketScreener.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiMarketScreener.css",import.meta.url),"utf8");

test("Samurai exposes the public screener inside the professional toolbox",()=>{
 assert.match(analysis,/sam-analysis-tools/);
 assert.match(toolbox,/V3MarketScreener/);
 assert.match(toolbox,/Скринер/);
 assert.match(atlas,/id:"tools"/);
});

test("screener stays accessible without broker trust through the locked Tools entry",()=>{
 assert.match(analysis,/inlineTools=\{\{tools:<Suspense/);
 assert.match(atlas,/inlineTools\?\.\[chapter\.id\]/);
 assert.match(atlas,/id:"tools"/);
});

test("screener is descriptive not an attractiveness ranking",()=>{
 assert.match(ui,/не являются рейтингом инвестиционной привлекательности/);
 assert.match(ui,/Фундаментальные мультипликаторы/);
 assert.match(ui,/TQBR/);
 assert.match(ui,/Минимальный оборот/);
});

test("screener has mobile touch controls",()=>{
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/@media\(max-width:430px\)/);
});
