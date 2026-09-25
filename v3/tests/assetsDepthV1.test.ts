import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const assets=readFileSync(new URL("../src/assets/V3Assets.tsx",import.meta.url),"utf8");
const depth=readFileSync(new URL("../src/assets/V3AssetsDepth.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/assetsDepth.css",import.meta.url),"utf8");

test("Assets Depth v1 is the shared deep workspace for Samurai and Cosmos",()=>{
 assert.match(assets,/themedDepth=shell==="samurai"\|\|shell==="carbon"/);
 assert.match(assets,/v3-assets-depth-cue/);
 assert.match(assets,/scrollToDepth/);
 assert.match(assets,/<V3AssetsDepth positions=\{base\}/);
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

test("Assets Depth exposes composition, concentration, P\/L, sectors, bonds and asset drilldown",()=>{
 for(const token of["01 · СОСТАВ","02 · РЕЗУЛЬТАТ","03 · ОТРАСЛИ","04 · ОБЛИГАЦИИ","05 · ПОЗИЦИИ"])assert.match(depth,new RegExp(token));
 assert.match(depth,/TOP-1/);
 assert.match(depth,/TOP-3/);
 assert.match(depth,/1 \/ HHI/);
 assert.match(depth,/абс\. P\/L/);
 assert.match(depth,/тап → карточка актива/);
});

test("extended bond analytics use a separate verified contract and preserve semantic boundaries",()=>{
 assert.match(depth,/V3BondYieldDepth/);
 assert.match(depth,/отдельный проверяемый контракт/);
 assert.match(depth,/Срок до погашения остаётся самостоятельной метрикой и не называется дюрацией/);
});

test("shell differences stay in material CSS, not duplicate analytics",()=>{
 assert.match(css,/data-shell="carbon"/);
 assert.match(css,/data-shell="samurai"/);
 assert.match(css,/v3-assets-depth-cue/);
 assert.match(css,/v3-assets-depth-spacer/);
});
