import assert from"node:assert/strict";
import{evaluatePayoutTrust}from"../../v2/src/lib/dataTrust.ts";
import{separateTrustedIncomeData}from"../../v2/src/features/income/incomeDataTrust.ts";
import{buildIncomeCalendarVisual}from"../../v2/src/features/income/incomeCalendarVisual.ts";
import{buildIncomeSourceRows}from"../../v2/src/features/income/incomeSourceRows.ts";
import{buildRealizedIncomeHistory,calculateIncomeSourceConcentration,calculateIncomeStability}from"../../v2/src/features/income/incomeHistory.ts";
import{buildBondIncomeLinkage}from"../../v2/src/features/income/bondIncomeLinkage.ts";

const now=Date.parse("2026-09-19T00:00:00Z");
const actual=[
  {kind:"COUPON",ticker:"OFZ",name:"OFZ",figi:"FIGI1",date:"2026-06-10T00:00:00Z",net:100,status:"FACT"},
  {kind:"DIVIDEND",ticker:"AAA",name:"AAA",figi:"FIGI2",date:"2026-07-10T00:00:00Z",net:200,status:"FACT"},
  {kind:"COUPON",ticker:"OFZ",name:"OFZ",figi:"FIGI1",date:"2026-08-10T00:00:00Z",net:100,status:"FACT"},
];
const future=[
  {kind:"COUPON",ticker:"OFZ",name:"OFZ",figi:"FIGI1",date:"2026-10-10T00:00:00Z",gross:120,status:"SCHEDULED",confidence:"HIGH"},
  {kind:"DIVIDEND",ticker:"AAA",name:"AAA",figi:"FIGI2",date:"2026-11-10T00:00:00Z",gross:250,status:"SCHEDULED",confidence:"HIGH"},
];
const base:any={
  available:true,version:"test",generatedAt:"2026-09-19T00:00:00Z",period:{from:"2026-09-01T00:00:00Z",to:"2027-08-31T00:00:00Z"},basis:"test",displayBasis:"test",
  actual:{year:2026,items:actual,totalNet:400,count:3,observation:{available:true,from:"2026-06-01T00:00:00Z",to:"2026-08-31T00:00:00Z",completeMonths:["2026-06","2026-07","2026-08"],partialMonths:[],basis:"operations"}},
  forecast:{gross:370,tax:0,net:370,count:2},next:future[0],months:[],events:future,
  coverage:{eligibleAssets:2,scheduledEvents:2,resolvedAssets:2,coverageRatio:1,errors:[]},
  identity:{couponScheduleEvents:1,couponScheduleIdentified:1,couponScheduleCoverage:1,basis:"FIGI"},
  integrity:{complete:true,minimumCoverage:.95},stale:false,warning:null,note:null,
};
const positions:any[]=[
  {figi:"FIGI1",ticker:"OFZ",name:"OFZ",instrumentType:"bond",currentValue:1000,costBasis:900},
  {figi:"FIGI2",ticker:"AAA",name:"AAA",instrumentType:"share",currentValue:2000,costBasis:1500},
];
function depth(calendar:any){
  const trust=evaluatePayoutTrust({available:calendar.available,stale:calendar.stale,generatedAt:calendar.generatedAt,eligibleAssets:calendar.coverage.eligibleAssets,resolvedAssets:calendar.coverage.resolvedAssets,coverageRatio:calendar.coverage.coverageRatio,scheduleComplete:calendar.integrity.complete},now);
  const trusted=separateTrustedIncomeData(calendar,trust.safeToCalculate);
  const history=buildRealizedIncomeHistory(trusted.actualEvents,calendar.actual.observation);
  return{trust,trusted,months:buildIncomeCalendarVisual(trusted.futureEvents,calendar.period.from,12),sources:buildIncomeSourceRows(trusted.actualEvents,trusted.futureEvents,positions,99),history,stability:calculateIncomeStability(history),concentration:calculateIncomeSourceConcentration(trusted.actualEvents),bonds:buildBondIncomeLinkage(positions,trusted.futureEvents)};
}
const complete=depth(base);
assert.equal(complete.trust.safeToCalculate,true);
assert.equal(complete.trusted.futureEvents.length,2);
assert.equal(complete.months.length,12);
assert.equal(complete.months.find(x=>x.key==="2026-10")?.count,1);
assert.equal(complete.history.observation.completeMonths,3);
assert.equal(complete.stability.status,"preview");
assert.equal(complete.concentration.sourceCount,2);
assert.equal(complete.sources.find(x=>x.ticker==="OFZ")?.matchBasis,"FIGI");
assert.equal(complete.sources.find(x=>x.ticker==="OFZ")?.forecast,120);
assert.equal(complete.bonds.linkedBondCount,1);
const partial=depth({...base,coverage:{...base.coverage,resolvedAssets:1,coverageRatio:.5},integrity:{...base.integrity,complete:false}});
assert.equal(partial.trust.safeToCalculate,false);
assert.equal(partial.trusted.futureEvents.length,0);
assert.equal(partial.sources.find(x=>x.ticker==="OFZ")?.forecast,0);
assert.equal(partial.history.months.length,3);
console.log("v3 canonical income depth: ok");
