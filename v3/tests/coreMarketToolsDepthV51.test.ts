import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";
import{buildMarketPulse}from"../src/analysis/marketIntelligenceModel.ts";

const market=readFileSync(new URL("../src/analysis/V3MarketIntelligenceWorkspace.tsx",import.meta.url),"utf8");
const screener=readFileSync(new URL("../src/analysis/V3MarketScreener.tsx",import.meta.url),"utf8");
const futures=readFileSync(new URL("../src/terminal/V3FuturesScenario.tsx",import.meta.url),"utf8");
const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");

const row=(secid:string)=>({secid,name:secid,last:100,dayChangePct:1,turnoverRub:100,trades:1,low:99,high:101,rangePct:2,listingLevel:1,lotSize:1});
const pos=(ticker:string,value:number,type="share")=>({figi:ticker,instrumentUid:"uid-"+ticker,ticker,name:ticker,instrumentType:type,quantity:1,averagePrice:100,costBasis:value,currentPrice:100,currentValue:value,expectedYield:0,weight:0,bond:null});

test("market pulse reports exact TQBR capital coverage and explicit gaps",()=>{
 const pulse=buildMarketPulse([row("AAA"),row("BBB")],[pos("AAA",600),pos("ZZZ",300),pos("BOND",100,"bond")]);
 assert.equal(pulse.portfolioMatchedCapital,600);
 assert.equal(pulse.portfolioTotalCapital,1000);
 assert.equal(pulse.portfolioCapitalCoverage,.6);
 assert.deepEqual(pulse.unmatchedPortfolioTickers,["ZZZ","BOND"]);
});

test("market workspace shows coverage and passes exact tickers to screener",()=>{
 assert.match(market,/Покрытие портфеля TQBR/);
 assert.match(market,/Вне TQBR-среза/);
 assert.match(market,/portfolioTickers=\{pulse\.portfolioTickers\}/);
 assert.match(screener,/portfolioOnly/);
 assert.match(screener,/Показать только мой портфель/);
 assert.match(screener,/portfolioTickers\?\.has\(row\.secid\.toUpperCase\(\)\)/);
});

test("futures tool separates verified current positions from manual what-if",()=>{
 assert.match(toolbox,/V3FuturesScenario positions=\{positions\}/);
 assert.match(futures,/ТЕКУЩИЙ ПОРТФЕЛЬ/);
 assert.match(futures,/фьючерсных позиций/);
 assert.match(futures,/P\/L открытых фьючерсных позиций/);
 assert.match(futures,/Сценарий ниже остаётся ручным WHAT IF/);
 assert.doesNotMatch(futures,/submitOrder|placeOrder|sendOrder/i);
});
