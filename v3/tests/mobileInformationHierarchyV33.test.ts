import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const returns=readFileSync(new URL("../src/analysis/V3ReturnLayer.tsx",import.meta.url),"utf8");
const risk=readFileSync(new URL("../src/analysis/V3RiskLayer.tsx",import.meta.url),"utf8");
const market=readFileSync(new URL("../src/analysis/V3MarketLayer.tsx",import.meta.url),"utf8");
const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const coreCss=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const analysisCss=readFileSync(new URL("../src/styles/analysisDepth.css",import.meta.url),"utf8");
const toolsCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("analytics has an explicit quick layer and professional layer",()=>{
 for(const token of["БЫСТРЫЙ СЛОЙ","Структура","P/L","Риск","Профи","Главный ответ сверху, детали ниже"])assert.ok(core.includes(token));
 assert.match(coreCss,/sb-analytics-context/);
 assert.match(coreCss,/\.sb-analytics \.sb-switch\{position:sticky/);
});

test("secondary analytics stay available but are collapsed by default",()=>{
 assert.match(returns,/v3-analysis-disclosure/);
 assert.match(returns,/Rolling-окно/);
 assert.match(risk,/Хвостовой риск/);
 assert.match(risk,/Вклад активов в риск/);
 assert.match(market,/Относительные коэффициенты/);
 assert.doesNotMatch(returns,/<details className="v3-analysis-disclosure" open/);
 assert.doesNotMatch(risk,/<details className="v3-analysis-disclosure" open/);
 assert.match(analysisCss,/v3-analysis-disclosure/);
});

test("professional tools are grouped around user jobs",()=>{
 for(const token of["Управление портфелем","Сценарии и исследование","СЕЙЧАС","v3-pro-tools__focus","v3-pro-tools__groups"])assert.ok(toolbox.includes(token));
 assert.match(toolsCss,/v3-pro-tools__focus/);
 assert.match(toolsCss,/v3-pro-tools__groups/);
});

test("mobile typography for deep analytics is not compressed into microtype",()=>{
 assert.match(analysisCss,/@media\(max-width:430px\)/);
 assert.match(analysisCss,/v3-analysis-layer-head span[^}]*font-size:9px/);
 assert.match(analysisCss,/v3-analysis-disclosure>summary b\{font-size:11px/);
 assert.match(toolsCss,/v3-pro-tools__groups button small\{font-size:8\.5px/);
});
