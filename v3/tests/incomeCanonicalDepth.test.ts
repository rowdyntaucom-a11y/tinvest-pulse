import assert from"node:assert/strict";
import{buildV3IncomeDepth}from"../src/income/incomeDepth.ts";

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
const depth=buildV3IncomeDepth(base,positions,now);
assert.equal(depth.payoutTrust.safeToCalculate,true);
assert.equal(depth.trustedIncome.futureEvents.length,2);
assert.equal(depth.calendarMonths.length,12);
assert.equal(depth.calendarMonths.find(x=>x.key==="2026-10")?.count,1);
assert.equal(depth.realizedHistory.observation.completeMonths,3);
assert.equal(depth.stability.status,"preview");
assert.equal(depth.concentration.sourceCount,2);
assert.equal(depth.sourceRows.find(x=>x.ticker==="OFZ")?.matchBasis,"FIGI");
assert.equal(depth.sourceRows.find(x=>x.ticker==="OFZ")?.forecast,120);
assert.equal(depth.bondLinkage.linkedBondCount,1);
const partial=buildV3IncomeDepth({...base,coverage:{...base.coverage,resolvedAssets:1,coverageRatio:.5},integrity:{...base.integrity,complete:false}},positions,now);
assert.equal(partial.payoutTrust.safeToCalculate,false);
assert.equal(partial.trustedIncome.futureEvents.length,0);
assert.equal(partial.sourceRows.find(x=>x.ticker==="OFZ")?.forecast,0);
assert.equal(partial.realizedHistory.months.length,3);
console.log("v3 canonical income depth: ok");
