import assert from"node:assert/strict";
import test from"node:test";
import{buildPortfolioReport}from"../src/report/portfolioReport.ts";
import type{PositionSnapshot}from"../../v2/src/lib/portfolioApi.ts";

function p(overrides:Partial<PositionSnapshot>):PositionSnapshot{
 return{
  figi:null,instrumentUid:null,ticker:"X",name:"X",instrumentType:"share",
  quantity:1,averagePrice:100,costBasis:100,currentPrice:110,currentValue:110,expectedYield:10,weight:0,
  bond:null,...overrides
 };
}

test("portfolio report groups categories and preserves P/L totals",()=>{
 const report=buildPortfolioReport([
  p({ticker:"AAA",instrumentType:"share",currentValue:110,costBasis:100,expectedYield:10}),
  p({ticker:"BBB",instrumentType:"bond",currentValue:220,costBasis:200,expectedYield:20,bond:{maturityDate:null,nominal:null,currency:"RUB",couponQuantityPerYear:null,floatingCoupon:null,perpetual:null,amortizing:null,issueKind:null,countryOfRisk:null,countryOfRiskName:null,sector:null,issuerUid:null,issuerName:null}})
 ]);
 assert.equal(report.totalValue,330);
 assert.equal(report.totalCostBasis,300);
 assert.equal(report.totalPnl,30);
 assert.equal(report.category.rows.length,2);
 assert.equal(report.category.coverageRatio,1);
 assert.equal(report.currency.rows[0].label,"RUB");
 assert.equal(report.currency.rows[0].currentValue,220);
 assert.equal(report.currency.unclassifiedValue,110);
});

test("currency report never guesses missing instrument currency",()=>{
 const report=buildPortfolioReport([
  p({ticker:"AAA",instrumentType:"share",currentValue:100,costBasis:95,expectedYield:5,bond:null}),
  p({ticker:"USD",instrumentType:"currency",currentValue:50,costBasis:50,expectedYield:0,bond:null})
 ]);
 assert.equal(report.currency.rows.length,0);
 assert.equal(report.currency.unclassifiedValue,150);
 assert.equal(report.currency.coverageRatio,0);
});

test("category report keeps unknown instrument types in Other rather than dropping value",()=>{
 const report=buildPortfolioReport([p({instrumentType:"mystery",currentValue:75,costBasis:80,expectedYield:-5})]);
 assert.equal(report.category.rows.length,1);
 assert.equal(report.category.rows[0].label,"Другое");
 assert.equal(report.category.rows[0].currentValue,75);
 assert.equal(report.category.unclassifiedValue,0);
});
