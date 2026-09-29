import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const assets=readFileSync(new URL("../src/assets/V3Assets.tsx",import.meta.url),"utf8");
const depth=readFileSync(new URL("../src/assets/V3AssetsDepth.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/assetsDepth.css",import.meta.url),"utf8");

test("Assets Depth v1 remains the shared shell-independent deep workspace",()=>{
 assert.match(assets,/themedDepth=shell==="samurai"\|\|shell==="carbon"/);
 assert.match(depth,/id="v3-assets-depth"/);
 assert.doesNotMatch(depth,/shell===/);
});

test("Assets Depth reuses canonical deterministic portfolio models",()=>{
 assert.match(depth,/calculatePortfolioPnlAttribution/);
 assert.match(depth,/calculatePortfolioTopExposure/);
 assert.match(depth,/aggregateHoldings/);
 assert.match(depth,/buildBondMaturityDiagnostics/);
 assert.match(depth,/buildBondRiskDimensions/);
 assert.match(depth,/V3HoldingsExplorer/);
});

test("professional analytics uses progressive disclosure instead of one long feed",()=>{
 for(const token of["ПРОФЕССИОНАЛЬНАЯ АНАЛИТИКА","Обзор","Акции","Облигации","Позиции","Кто формирует текущий P/L","Что означают эти показатели?"])assert.match(depth,new RegExp(token));
 assert.match(depth,/useState<DepthMode>\("overview"\)/);
 assert.match(depth,/mode==="equity"/);
 assert.match(depth,/mode==="bonds"/);
 assert.match(depth,/mode==="positions"/);
 assert.match(depth,/V3EquityFundamentalsDepth/);
 assert.match(depth,/V3BondYieldDepth/);
 assert.match(depth,/initialDimension="instrument" showClassSummary=\{false\}/);
 assert.doesNotMatch(depth,/01 · СОСТАВ/);
});

test("bond jargon is gated and explained in plain language",()=>{
 assert.match(depth,/YTM — оценка доходности к погашению/);
 assert.match(depth,/Modified duration показывает чувствительность цены/);
});

test("mobile progressive disclosure has a dedicated local nav",()=>{
 assert.match(css,/v3-assets-depth__nav/);
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/v3-assets-depth__professional-section/);
});
