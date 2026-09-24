import assert from"node:assert/strict";
import test from"node:test";
import{solveV3RequiredMonthlyContribution}from"../src/goal/goalScenario.ts";

const base={
 currentCapital:100000,
 targetCapitalToday:220000,
 horizonYears:1,
 monthlyContribution:1000,
 contributionGrowthAnnualPct:0,
 inflationAnnualPct:0,
 priceReturnAnnualPct:0,
 incomeYieldAnnualPct:0,
 reinvestIncome:false,
 benchmarkReturnAnnualPct:null,
};

test("goal contribution solver finds the minimum monthly contribution under explicit assumptions",()=>{
 const result=solveV3RequiredMonthlyContribution(base);
 assert.equal(result.available,true);
 assert.ok(result.requiredMonthlyContribution!=null);
 assert.ok(result.requiredMonthlyContribution!>=10000);
 assert.ok(result.requiredMonthlyContribution!<=10010);
 assert.ok(result.projection?.scenarioGoalReachedMonth!=null);
});

test("goal contribution solver returns zero when the starting capital already satisfies the target",()=>{
 const result=solveV3RequiredMonthlyContribution({...base,currentCapital:300000});
 assert.equal(result.available,true);
 assert.equal(result.requiredMonthlyContribution,0);
 assert.equal(result.deltaMonthlyContribution,-1000);
});

test("goal contribution solver preserves input validation",()=>{
 const result=solveV3RequiredMonthlyContribution({...base,horizonYears:0});
 assert.equal(result.available,false);
 assert.match(result.reason??"",/Горизонт/);
});
