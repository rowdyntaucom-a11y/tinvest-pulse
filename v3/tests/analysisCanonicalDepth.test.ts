import assert from"node:assert/strict";
import{calculatePortfolioAnalytics}from"../../v2/src/features/analytics/metrics.ts";
import{calculateRelativePerformance}from"../../v2/src/features/analytics/relativePerformance.ts";
import{calculateRollingRisk}from"../../v2/src/features/analytics/rollingRisk.ts";
import{calculateTailRisk}from"../../v2/src/features/analytics/tailRisk.ts";

const start=Date.UTC(2025,0,1);
const history=Array.from({length:300},(_,i)=>({
  date:new Date(start+i*86_400_000).toISOString().slice(0,10),
  portfolio:100*Math.pow(1.0007,i),
  imoex:100*Math.pow(1.0005,i),
}));
const positions=[
  {ticker:"A",name:"A",instrumentType:"share",currentValue:60},
  {ticker:"B",name:"B",instrumentType:"bond",currentValue:40},
];
const portfolio=calculatePortfolioAnalytics(history,positions,10);
assert.equal(portfolio.historyIntegrity,"OK");
assert.equal(portfolio.historyPoints,300);
assert.ok(portfolio.twr!=null&&portfolio.twr>0);
assert.ok(portfolio.hhi!=null&&Math.abs(portfolio.hhi-.52)<1e-12);
assert.ok(portfolio.effectivePositions!=null&&portfolio.effectivePositions>1.9&&portfolio.effectivePositions<2);
const relative=calculateRelativePerformance(history);
assert.equal(relative.status,"mature");
assert.equal(relative.pairedReturns,299);
assert.ok(relative.excessReturn!=null&&relative.excessReturn>0);
const rolling=calculateRollingRisk(history);
assert.equal(rolling.integrityState,"OK");
assert.equal(rolling.activeWindow?.tradingDays,252);
const tail=calculateTailRisk(history);
assert.equal(tail.status,"mature");
assert.equal(tail.returns,299);
const conflict=[history[0],{...history[0],portfolio:999},...history.slice(1,5)];
assert.equal(calculatePortfolioAnalytics(conflict,positions,10).historyIntegrity,"CONFLICT");
assert.equal(calculateRelativePerformance(conflict).status,"invalid_history");
console.log("v3 canonical portfolio analytics depth: ok");
