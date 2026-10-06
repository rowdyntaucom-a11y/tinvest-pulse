import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const source=readFileSync(new URL("../src/analysis/V3BondIntelligenceWorkspace.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/bondIntelligenceV117.css",import.meta.url),"utf8");

test("professional toolbox exposes the bond workspace lazily",()=>{
 assert.match(toolbox,/V3BondIntelligenceWorkspace=lazy/);
 assert.match(toolbox,/id:"bonds",label:"Облигации"/);
 assert.match(toolbox,/сроки · эмитенты · купоны/);
 assert.match(toolbox,/id==="bonds"\?<V3BondIntelligenceWorkspace positions=\{positions\}/);
 assert.match(toolbox,/YTM/);
});

test("bond intelligence only derives descriptive metrics from current positions and verified bond metadata",()=>{
 assert.match(source,/position\.instrumentType\.toLowerCase\(\)\.includes\("bond"\)\|\|Boolean\(position\.bond\)/);
 assert.match(source,/position\.bond\?\.issuerName/);
 assert.match(source,/position\.bond\?\.maturityDate/);
 assert.match(source,/position\.bond\?\.floatingCoupon/);
 assert.match(source,/position\.bond\?\.amortizing/);
 assert.match(source,/position\.bond\?\.perpetual/);
 assert.match(source,/ЛЕСТНИЦА ПОГАШЕНИЙ/);
 assert.match(source,/Концентрация облигаций/);
 assert.match(source,/ВАЛЮТА НОМИНАЛА/);
 assert.match(source,/Точная облигационная ведомость/);
 assert.match(source,/metadataCoverage/);
 assert.match(source,/maturityCoverage/);
 assert.match(source,/couponCoverage/);
});

test("bond workspace fails closed for unavailable methodology instead of inventing analytics",()=>{
 assert.match(source,/Без расчёта YTM, duration и купонных сумм/);
 assert.match(source,/не рассчитывает YTM, duration, будущий купонный поток или кредитный рейтинг из отсутствующих данных/);
 assert.doesNotMatch(source,/targetYield|targetPrice|buySignal|sellSignal|orderBroker|placeOrder/);
 assert.doesNotMatch(source,/<svg|<circle/);
});

test("bond workspace is deterministic and readable on small screens",()=>{
 assert.match(source,/type BondFilter="all"\|"fixed"\|"floating"\|"amortizing"\|"perpetual"/);
 assert.match(source,/type BondSort="capital"\|"maturity"\|"pnl"/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/@media\(max-width:430px\)/);
 assert.match(css,/grid-template-columns:1fr/);
 assert.match(css,/content-visibility:auto/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
