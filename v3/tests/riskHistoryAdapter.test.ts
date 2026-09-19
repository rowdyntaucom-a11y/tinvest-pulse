import assert from"node:assert/strict";
import{buildV3RiskHistoryMatch,summarizeCorrelationPairs}from"../src/analysis/riskHistoryAdapter.ts";
import{calculateCurrentRiskContribution}from"../../v2/src/features/analytics/currentRiskContribution.ts";
import{calculateCorrelationMatrix}from"../../v2/src/features/analytics/riskMatrix.ts";

const positions=[
  {figi:"figi-a",instrumentUid:"uid-a",ticker:"AAA",name:"A",instrumentType:"share",quantity:1,averagePrice:1,costBasis:1,currentPrice:1,currentValue:60,expectedYield:0,weight:.6,bond:null},
  {figi:"figi-b",instrumentUid:null,ticker:"BBB",name:"B",instrumentType:"bond",quantity:1,averagePrice:1,costBasis:1,currentPrice:1,currentValue:40,expectedYield:0,weight:.4,bond:null},
];
const start=Date.UTC(2026,0,1);
const pts=(factor:number)=>Array.from({length:70},(_,i)=>({date:new Date(start+i*86_400_000).toISOString().slice(0,10),value:100*Math.pow(1+factor+(i%5-2)*.00005,i)}));
const payload={normalizationVersion:"1.1",version:"test",available:true,from:"2026-01-01",to:"2026-03-11",requested:2,availableSeries:2,source:"TEST",series:[
  {key:"series-a",label:"A",instrumentId:"uid-a",points:pts(.0008),integrity:"VALID",duplicateRowsCollapsed:0,conflictingDates:0},
  {key:"series-b",label:"B",instrumentId:"figi-b",points:pts(.0004),integrity:"VALID",duplicateRowsCollapsed:0,conflictingDates:0},
]};
const matched=buildV3RiskHistoryMatch(payload as any,positions as any);
assert.deepEqual(matched.matchedTickers,["AAA","BBB"]);
assert.deepEqual(matched.unmatchedTickers,[]);
assert.equal(matched.coveredValue,100);
assert.equal(matched.inputs[0].key,"uid-a");
assert.equal(matched.inputs[1].key,"figi-b");
const risk=calculateCurrentRiskContribution(matched.inputs,100);
assert.equal(risk.available,true);
assert.equal(risk.status,"PREVIEW");
assert.equal(risk.commonReturns,69);
assert.ok(Math.abs(risk.rows.reduce((sum,row)=>sum+(row.riskContributionShare??0),0)-1)<1e-9);
const matrix=calculateCorrelationMatrix(matched.series);
const summary=summarizeCorrelationPairs(matched.series,matrix.cells);
assert.equal(summary.readyPairs,1);
assert.equal(summary.highest?.a,"AAA");
assert.equal(summary.highest?.b,"BBB");
const ambiguous={...payload,series:[...payload.series,{...payload.series[0],key:"series-a-2"}]};
const ambiguity=buildV3RiskHistoryMatch(ambiguous as any,positions as any);
assert.deepEqual(ambiguity.ambiguousTickers,["AAA"]);
assert.deepEqual(ambiguity.matchedTickers,["BBB"]);
console.log("v3 exact risk-history adapter and contribution pipeline: ok");
