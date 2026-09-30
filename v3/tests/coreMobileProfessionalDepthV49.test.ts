import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const analytics=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const assets=readFileSync(new URL("../src/assets/V3AssetsDepth.tsx",import.meta.url),"utf8");
const tools=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const coreCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");
const assetsCss=readFileSync(new URL("../src/styles/assetsDepth.css",import.meta.url),"utf8");

test("professional analytics exposes its evidence boundary before detail",()=>{
 assert.match(analytics,/ОСНОВА РАСЧЁТА/);
 assert.match(analytics,/точек истории/);
 assert.match(analytics,/текущих позиций/);
 assert.match(analytics,/общих точек с IMOEX/);
 assert.match(analytics,/История прошла проверку целостности/);
 assert.match(coreCss,/core-analytics-depth__evidence/);
});

test("mobile analytics removes duplicate section navigation and keeps the decision first",()=>{
 assert.match(coreCss,/@media\(max-width:520px\)/);
 assert.match(coreCss,/core-analytics-depth__decision\{order:4/);
 assert.match(coreCss,/core-analytics-depth__evidence\{order:5/);
 assert.match(coreCss,/core-analytics-depth__route\{order:6/);
 assert.match(coreCss,/core-analytics-depth__nav\{display:none/);
});

test("portfolio depth has a deterministic first-answer summary",()=>{
 assert.match(assets,/ГЛАВНЫЙ ВЫВОД/);
 assert.match(assets,/Топ-3 занимают/);
 assert.match(assets,/P\/L открытых позиций/);
 assert.match(assets,/не рекомендация/);
 assert.match(assetsCss,/v3-assets-depth__answer/);
});

test("lazy professional modules use compact informative loading instead of a blank tall card",()=>{
 assert.match(core,/sb-deep-loading__mark/);
 assert.match(core,/Подключаем модуль к уже подтверждённым данным/);
 assert.match(coreCss,/\.sb \.sb-deep-loading\{min-height:0!important/);
 assert.match(tools,/function ToolLoading/);
 assert.match(tools,/Модуль подключается к текущим подтверждённым данным/);
 assert.match(coreCss,/\.sb \.v3-pro-tools__loading\{min-height:0!important/);
});

test("v49 changes presentation only and does not add trading actions",()=>{
 for(const source of[core,analytics,assets,tools])assert.doesNotMatch(source,/submitOrder|placeOrder|createOrder|sendOrder/i);
});
