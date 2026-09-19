import assert from"node:assert/strict";
import{aggregateHoldings,classifyPosition,filterAndSortHoldings}from"../../v2/src/features/analytics/holdingsExplorer.ts";

const positions:any[]=[
 {ticker:"AAA",name:"Alpha",instrumentType:"share",currentValue:500,expectedYield:50,weight:.5,bond:null},
 {ticker:"OFZ",name:"OFZ",instrumentType:"bond",currentValue:300,expectedYield:-10,weight:.3,bond:{issuerName:"Минфин РФ",sector:"Государство",currency:"RUB"}},
 {ticker:"FND",name:"Fund",instrumentType:"etf",currentValue:200,expectedYield:20,weight:.2,bond:null},
];
assert.equal(classifyPosition("share"),"shares");
assert.equal(classifyPosition("bond"),"bonds");
assert.equal(classifyPosition("ETF"),"funds");
assert.equal(classifyPosition("currency"),"currency");
assert.deepEqual(filterAndSortHoldings(positions,"all","weight").map(x=>x.ticker),["AAA","OFZ","FND"]);
assert.deepEqual(filterAndSortHoldings(positions,"bonds","value").map(x=>x.ticker),["OFZ"]);
assert.deepEqual(filterAndSortHoldings(positions,"all","pnl").map(x=>x.ticker),["AAA","FND","OFZ"]);
const classes=aggregateHoldings(positions,"class");
assert.equal(classes.unclassified,0);
assert.equal(classes.rows.find(x=>x.label==="shares")?.value,500);
const issuers=aggregateHoldings(positions,"issuer");
assert.equal(issuers.rows.find(x=>x.label==="Минфин РФ")?.value,300);
assert.equal(issuers.unclassified,700);
const sectors=aggregateHoldings(positions,"sector");
assert.equal(sectors.rows.find(x=>x.label==="Государство")?.value,300);
assert.equal(sectors.unclassified,700);
console.log("v3 canonical holdings structure: ok");
