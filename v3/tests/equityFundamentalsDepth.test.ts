import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";
import{buildEquityFundamentalCoverage,metricCapitalCoveragePct}from"../src/assets/equityFundamentalsModel.ts";
import{normalizeAssetFundamentals,unavailableAssetFundamentals}from"../../v2/src/features/portfolio/assetFundamentals.ts";
import type{PositionSnapshot}from"../../v2/src/lib/portfolioApi.ts";

const depth=readFileSync(new URL("../src/assets/V3AssetsDepth.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/assets/V3EquityFundamentalsDepth.tsx",import.meta.url),"utf8");
const api=readFileSync(new URL("../src/assets/equityFundamentalsApi.ts",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/equityFundamentalsDepth.css",import.meta.url),"utf8");

function position(ticker:string,value:number):PositionSnapshot{return{figi:ticker,instrumentUid:"uid-"+ticker,ticker,name:ticker,instrumentType:"share",quantity:1,averagePrice:value,costBasis:value,currentPrice:value,currentValue:value,expectedYield:0,weight:0,bond:null}}

test("equity fundamentals aggregate only verified T-Invest rows by capital",()=>{
 const live=normalizeAssetFundamentals({source:"T_INVEST",assetUid:"asset-a",metrics:{pe_ratio_ttm:7.2,roe_ttm:18}});
 const gap=unavailableAssetFundamentals("NO_USABLE_METRICS");
 const rows=[{position:position("AAA",70),snapshot:live},{position:position("BBB",30),snapshot:gap}];
 const coverage=buildEquityFundamentalCoverage(rows);
 assert.equal(coverage.equityCapital,100);
 assert.equal(coverage.verifiedCapital,70);
 assert.equal(coverage.verifiedCompanies,1);
 assert.equal(coverage.capitalCoveragePct,70);
 assert.equal(metricCapitalCoveragePct(rows,"peRatioTtm"),70);
 assert.equal(metricCapitalCoveragePct(rows,"priceToSalesTtm"),0);
});

test("Assets Depth mounts interactive verified equity intelligence before bonds",()=>{
 assert.match(depth,/V3EquityFundamentalsDepth/);
 assert.ok(depth.indexOf("sam-assets-fundamentals")<depth.indexOf("sam-assets-bonds"));
 assert.match(ui,/Мультипликаторы/);
 assert.match(ui,/Рентабельность/);
 assert.match(ui,/Финансы/);
 assert.match(ui,/Акционер/);
 assert.match(ui,/Открыть карточку/);
});

test("equity intelligence reuses official fail-closed fundamentals boundary",()=>{
 assert.match(api,/loadAssetFundamentals/);
 assert.match(api,/UNSUPPORTED_INSTRUMENT/);
 assert.match(ui,/GetAssetFundamentals/);
 assert.match(ui,/Без скрытого скоринга/);
 assert.doesNotMatch(ui,/рекомендац(ия|ии):?\s*(купить|продать)/i);
});

test("equity intelligence keeps local mobile scrolling and responsive grids",()=>{
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/overscroll-behavior-inline:contain/);
 assert.match(css,/@media\(max-width:699px\)/);
 assert.match(css,/@media\(max-width:359px\)/);
});
