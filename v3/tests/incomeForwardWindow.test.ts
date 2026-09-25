import assert from"node:assert/strict";
import test from"node:test";
import{buildIncomeForwardWindow,daysUntilPayout}from"../src/income/incomeForwardWindow.ts";

const now=Date.parse("2026-09-25T12:00:00Z");
const events:any[]=[
 {kind:"COUPON",ticker:"B1",name:"Bond",date:"2026-10-01T00:00:00Z",gross:100,status:"SCHEDULED"},
 {kind:"DIVIDEND",ticker:"S1",name:"Share",date:"2026-11-01T00:00:00Z",gross:200,status:"SCHEDULED"},
 {kind:"DIVIDEND",ticker:"S2",name:"Late",date:"2027-04-01T00:00:00Z",gross:300,status:"SCHEDULED"},
 {kind:"COUPON",ticker:"OLD",name:"Old",date:"2026-09-01T00:00:00Z",gross:50,status:"SCHEDULED"},
 {kind:"COUPON",ticker:"FACT",name:"Fact",date:"2026-10-10T00:00:00Z",gross:999,status:"FACT"},
];

test("forward window keeps only scheduled events inside the selected horizon",()=>{
 const three=buildIncomeForwardWindow(events,now,3);
 assert.equal(three.count,2);
 assert.equal(three.gross,300);
 assert.equal(three.monthlyAverageGross,100);
 assert.equal(three.coupons,1);
 assert.equal(three.dividends,1);
 assert.equal(three.amountCoverageRatio,1);
 assert.deepEqual(three.nearest.map(x=>x.ticker),["B1","S1"]);
});

test("longer horizon includes later events without changing factual boundary",()=>{
 const twelve=buildIncomeForwardWindow(events,now,12);
 assert.equal(twelve.count,3);
 assert.equal(twelve.gross,600);
 assert.ok(twelve.events.every(x=>x.status!=="FACT"));
});

test("countdown is date-only and never negative",()=>{
 assert.equal(daysUntilPayout("2026-10-01T13:00:00Z",now),6);
 assert.equal(daysUntilPayout("2026-09-01T00:00:00Z",now),0);
 assert.equal(daysUntilPayout("bad",now),null);
});
