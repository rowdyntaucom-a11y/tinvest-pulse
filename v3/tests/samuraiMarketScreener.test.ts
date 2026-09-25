import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/analysis/V3MarketScreener.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiMarketScreener.css",import.meta.url),"utf8");

test("Samurai exposes a ninth public screener chapter",()=>{
 assert.match(analysis,/sam-analysis-screener/);
 assert.match(analysis,/label:"Скринер"/);
 assert.match(atlas,/label:"Скринер"/);
 assert.match(atlas,/id:"screener"/);
});

test("screener stays accessible without broker trust only through the inline Atlas tool",()=>{
 assert.match(analysis,/inlineTools=\{\{screener:<Suspense/);
 assert.match(analysis,/samuraiReference&&trusted&&<div id="sam-analysis-screener"/);
 assert.match(atlas,/inlineTools\?\.\[chapter\.id\]/);
 assert.doesNotMatch(atlas,/targetId:"sam-analysis-screener"/);
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
