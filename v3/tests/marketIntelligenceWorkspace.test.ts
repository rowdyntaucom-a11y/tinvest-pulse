import assert from"node:assert/strict";import test from"node:test";import{readFileSync}from"node:fs";import{buildMarketPulse}from"../src/analysis/marketIntelligenceModel.ts";
const ui=readFileSync(new URL("../src/analysis/V3MarketIntelligenceWorkspace.tsx",import.meta.url),"utf8");const screener=readFileSync(new URL("../src/analysis/V3MarketScreener.tsx",import.meta.url),"utf8");const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");const css=readFileSync(new URL("../src/styles/marketIntelligenceWorkspace.css",import.meta.url),"utf8");
const row=(secid:string,change:number,turnover:number)=>({secid,name:secid,last:100,dayChangePct:change,turnoverRub:turnover,trades:10,low:90,high:110,rangePct:20,listingLevel:1,lotSize:1});
const pos=(ticker:string)=>({figi:ticker,instrumentUid:"uid-"+ticker,ticker,name:ticker,instrumentType:"share",quantity:1,averagePrice:100,costBasis:100,currentPrice:100,currentValue:100,expectedYield:0,weight:0,bond:null});
test("market pulse calculates breadth liquidity extremes and exact portfolio overlap",()=>{const r=buildMarketPulse([row("AAA",2,100),row("BBB",-5,500),row("CCC",0,50)],[pos("AAA"),pos("ZZZ")]);assert.equal(r.total,3);assert.equal(r.gainers,1);assert.equal(r.losers,1);assert.equal(r.flat,1);assert.equal(r.advancersShare,.5);assert.equal(r.turnover,650);assert.equal(r.topTurnover?.secid,"BBB");assert.equal(r.largestMove?.secid,"BBB");assert.equal(r.portfolioMatches,1);assert.equal(r.portfolioTickers.has("AAA"),true)});
test("market workspace consolidates pulse screener and history under one toolbox entry",()=>{for(const token of["MARKET INTELLIGENCE","Пульс","Скринер","История","V3MarketScreener","V3FallenAssetsDiscovery","PORTFOLIO × MARKET"])assert.match(ui,new RegExp(token));assert.match(toolbox,/id:"market"/);assert.doesNotMatch(toolbox,/id:"discovery"/);assert.doesNotMatch(toolbox,/id:"screener"/)});
test("market workspace preserves descriptive trust boundaries and responsive local navigation",()=>{assert.match(ui,/не является прогнозом/);assert.match(ui,/точному ticker/);assert.match(css,/overscroll-behavior-inline:contain/);assert.match(css,/@media\(max-width:430px\)/)});


test("promoted market workspace keeps bounded automatic recovery and manual retry",()=>{assert.match(ui,/MARKET_RETRY_DELAYS=\[2500,6000\]/);assert.match(ui,/attempt<MARKET_RETRY_DELAYS\.length/);assert.match(ui,/Повторить сейчас/);assert.match(ui,/повторит запрос автоматически/i)});
const lightCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");
test("light Core market tools avoid mobile microtype",()=>{assert.match(lightCss,/@media\(max-width:520px\)/);assert.match(lightCss,/sam-screener__row>div:first-child small[^}]*font-size:9px/);assert.match(lightCss,/sam-screener__range[^}]*font-size:9px/);assert.match(lightCss,/sam-fallen__metrics span[^}]*font-size:9px/)});


test("recovered parent market payload is shared with screener instead of spawning a stale one-shot state",()=>{
 assert.match(ui,/V3MarketScreener sharedData=\{data\} sharedLoading=\{loading\} onRetry=\{manualRetry\}/);
 assert.match(screener,/sharedData\?:MarketScreenerPayload\|null/);
 assert.match(screener,/controlled=sharedData!==undefined/);
 assert.match(screener,/onRetry&&<button/);
});


test("market errors stay human-readable and MOEX label does not wrap",()=>{const api=readFileSync(new URL("../src/analysis/marketScreenerApi.ts",import.meta.url),"utf8");assert.doesNotMatch(api,/reason:"HTTP "\+response\.status/);assert.match(api,/Не удалось получить данные рынка/);assert.match(css,/white-space:nowrap/);});
