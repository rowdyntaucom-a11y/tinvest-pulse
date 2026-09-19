import assert from"node:assert/strict";
import{calculateGoalProjection}from"../../v2/src/features/goals/goalProjection.ts";
import{calculateMonteCarlo}from"../../v2/src/features/analytics/monteCarlo.ts";

const projection=calculateGoalProjection({
  currentCapital:100000,
  targetCapitalToday:200000,
  horizonYears:1,
  monthlyContribution:1000,
  contributionGrowthAnnualPct:0,
  inflationAnnualPct:0,
  priceReturnAnnualPct:0,
  incomeYieldAnnualPct:0,
  reinvestIncome:false,
  benchmarkReturnAnnualPct:null,
});
assert.equal(projection.available,true);
assert.equal(projection.finalCapital,112000);
assert.equal(projection.finalRealCapital,112000);
assert.equal(projection.finalTargetNominal,200000);
assert.equal(projection.cumulativeContributions,12000);
assert.equal(projection.cumulativeIncomePaidOut,0);
assert.equal(projection.finalProgress,.56);
assert.equal(projection.series.length,1);
const invalid=calculateGoalProjection({...{
  currentCapital:100000,targetCapitalToday:200000,horizonYears:1,monthlyContribution:1000,contributionGrowthAnnualPct:0,inflationAnnualPct:0,priceReturnAnnualPct:0,incomeYieldAnnualPct:0,reinvestIncome:false,benchmarkReturnAnnualPct:null,
},horizonYears:0});
assert.equal(invalid.available,false);

const start=Date.UTC(2025,0,1);
const history=Array.from({length:301},(_,i)=>({date:new Date(start+i*86400000).toISOString().slice(0,10),portfolio:100*Math.pow(1.001,i),imoex:null}));
const mc=calculateMonteCarlo(history,100000,252,500,5);
assert.equal(mc.available,true);
assert.equal(mc.status,"mature");
assert.equal(mc.historyReturns,300);
assert.ok(mc.terminalValue);
assert.ok(Math.abs(mc.terminalValue!.p10-mc.terminalValue!.median)<1e-6);
assert.ok(Math.abs(mc.terminalValue!.p90-mc.terminalValue!.median)<1e-6);
const short=calculateMonteCarlo(history.slice(0,40),100000,252,500,5);
assert.equal(short.available,false);
assert.equal(short.status,"insufficient_history");
const conflict=calculateMonteCarlo([history[0],{...history[0],portfolio:999},...history.slice(1,70)],100000,252,500,5);
assert.equal(conflict.available,false);
assert.equal(conflict.conflictingDates,1);
console.log("v3 goal scenario engines: ok");
