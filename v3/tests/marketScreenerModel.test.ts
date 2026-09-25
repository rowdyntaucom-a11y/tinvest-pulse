import assert from"node:assert/strict";
import test from"node:test";
import{filterMarketScreener}from"../src/analysis/marketScreenerModel.ts";
import type{MarketScreenerRow}from"../src/analysis/marketScreenerApi.ts";

function r(secid:string,change:number,turnover:number,listingLevel:number,trades=100,rangePct=2):MarketScreenerRow{
 return{secid,name:secid+" name",lotSize:1,listingLevel,prevPrice:100,last:100,dayChangePct:change,turnoverRub:turnover,volume:1000,trades,open:99,high:101,low:98,rangePct};
}
const rows=[r("AAA",4,500_000_000,1,1000,4),r("BBB",-6,100_000_000,2,500,7),r("CCC",1,5_000_000,1,2000,1)];

test("screener filters by move turnover and listing without inventing score",()=>{
 const out=filterMarketScreener(rows,{query:"",move:"move2",minTurnover:50_000_000,listingLevel:"all",sort:"turnover"});
 assert.deepEqual(out.map(x=>x.secid),["AAA","BBB"]);
});

test("screener search matches ticker or name",()=>{
 const out=filterMarketScreener(rows,{query:"bbb",move:"all",minTurnover:0,listingLevel:"all",sort:"turnover"});
 assert.deepEqual(out.map(x=>x.secid),["BBB"]);
});

test("screener sorting is deterministic factual ordering",()=>{
 const down=filterMarketScreener(rows,{query:"",move:"all",minTurnover:0,listingLevel:"all",sort:"changeAsc"});
 assert.deepEqual(down.map(x=>x.secid),["BBB","CCC","AAA"]);
 const trades=filterMarketScreener(rows,{query:"",move:"all",minTurnover:0,listingLevel:"all",sort:"trades"});
 assert.deepEqual(trades.map(x=>x.secid),["CCC","AAA","BBB"]);
});
