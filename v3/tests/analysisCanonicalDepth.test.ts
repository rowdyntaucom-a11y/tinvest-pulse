import assert from"node:assert/strict";
import{calculatePortfolioAnalytics}from"../../v2/src/features/analytics/metrics.ts";
import{calculateRelativePerformance}from"../../v2/src/features/analytics/relativePerformance.ts";
import{calculateRollingRisk}from"../../v2/src/features/analytics/rollingRisk.ts";
import{calculateTailRisk}from"../../v2/src/features/analytics/tailRisk.ts";
import{buildAnalysisWorkspaceSummary}from"../src/analysis/analysisWorkspaceSummary.ts";

const start=Date.UTC(2025,0,1);
const history=Array.from({length:300},(_,i)=>({
  date:new Date(start+i*86_400_000).toISOString().slice(0,10),
  portfolio:100*Math.pow(1.0007,i),
  imoex:100*Math.pow(1.0005,i),
}));
const positions=[
  {ticker:"A",name:"A",instrumentType:"share",currentValue:60,weight:.6,expectedYield:5},
  {ticker:"B",name:"B",instrumentType:"bond",currentValue:40,weight:.4,expectedYield:-2},
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
const summary=buildAnalysisWorkspaceSummary({positions:positions as any,maxDrawdown:-.12,effectivePositions:1.92,historyPoints:300,historyDays:299,historyIntegrity:"OK"});
assert.equal(summary.positionCount,2);
assert.equal(summary.positiveCount,1);
assert.equal(summary.negativeCount,1);
assert.equal(summary.flatCount,0);
assert.equal(summary.top3Weight,1);
assert.equal(summary.largest?.ticker,"A");
assert.equal(summary.maxDrawdownPct,12);
assert.equal(summary.historyIntegrity,"OK");
console.log("v3 canonical portfolio analytics depth: ok");
