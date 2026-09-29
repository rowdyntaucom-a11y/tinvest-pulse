import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/proTools.css",import.meta.url),"utf8");
const futures=readFileSync(new URL("../src/terminal/V3FuturesScenario.tsx",import.meta.url),"utf8");

test("Samurai analysis exposes one professional toolbox entry instead of four permanent chapters",()=>{
 assert.match(analysis,/sam-analysis-tools/);
 for(const token of["V3AnalysisToolbox","ДАЛЬШЕ · ИНСТРУМЕНТЫ"])assert.match(analysis,new RegExp(token));
 assert.doesNotMatch(analysis,/id="sam-analysis-rebalance"/);
 assert.doesNotMatch(analysis,/id="sam-analysis-lab"/);
 assert.doesNotMatch(analysis,/id="sam-analysis-discovery"/);
 assert.doesNotMatch(analysis,/id="sam-analysis-screener"/);
});

test("toolbox contains current professional modules and read-only futures scenarios",()=>{
 for(const token of["Ребаланс","Лаборатория","Рынок","Фьючерсы","Отчёт","READ-ONLY","V3PortfolioReportDepth"])assert.match(toolbox,new RegExp(token));
});

test("toolbox groups modules by user task instead of one flat rail",()=>{
 assert.match(toolbox,/Управление портфелем/);
 assert.match(toolbox,/Сценарии и исследование/);
 assert.match(toolbox,/v3-pro-tools__focus/);
 assert.match(toolbox,/v3-pro-tools__groups/);
});


test("Derivatives Intelligence V2 exposes directional stress without trading semantics",()=>{
 for(const token of["DERIVATIVES INTELLIGENCE V2","Stress matrix","LONG","SHORT","SPEC COMPLETE","не является ценой ликвидации"])assert.match(futures,new RegExp(token));
 assert.doesNotMatch(futures,/отправить заявку|купить контракт|продать контракт/i);
 assert.match(css,/v3-futures-stress/);
 assert.match(css,/@media\(max-width:430px\)/);
});


test("light Core can hide duplicate market entry while keeping shared toolbox reusable",()=>{assert.match(toolbox,/includeMarket=true/);assert.match(toolbox,/TOOLS\.filter\(item=>item\.id!==\"market\"\)/);});
