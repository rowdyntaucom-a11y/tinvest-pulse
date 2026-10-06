import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const workspace=readFileSync(new URL("../src/core/CoreWorkspace.tsx",import.meta.url),"utf8");
const market=readFileSync(new URL("../src/core/CoreMarketCommandCenterV116.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/coreMarketCommandCenterV116.css",import.meta.url),"utf8");

test("market command center is mounted as the v116 market visual layer",()=>{
 assert.match(workspace,/CoreMarketCommandCenterV116/);
 assert.match(workspace,/coreMarketCommandCenterV116\.css/);
 assert.match(market,/MARKET COMMAND CENTER · V116/);
 assert.match(market,/Рыночный срез без декоративного шума/);
 assert.match(market,/Ширина рынка/);
 assert.match(market,/Концентрация оборота/);
 assert.match(market,/Внутридневной диапазон/);
 assert.match(market,/Портфель × рынок/);
});

test("v116 uses exact deterministic rails and preserves market trust boundaries",()=>{
 assert.match(market,/loadMarketScreener/);
 assert.match(market,/dayChangePct/);
 assert.match(market,/turnoverRub/);
 assert.match(market,/rangePct/);
 assert.match(market,/position\.ticker\.toUpperCase\(\)/);
 assert.match(market,/currentValue\)\)\*\(item\.row\.dayChangePct/);
 assert.match(market,/не доходность портфеля/);
 assert.match(market,/не являются прогнозом, торговым сигналом или рекомендацией/);
 assert.doesNotMatch(market,/<svg|<circle|conic-gradient/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/left:49\.5%/);
 assert.match(css,/v3-market-portfolio\[data-qv116-replaced="true"\]/);
 assert.match(css,/@media\(max-width:760px\)/);
});
