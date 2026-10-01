import assert from"node:assert/strict";import{buildPayoutRunway}from"../src/income/payoutRunway.ts";
const events:any[]=[
 {date:"2026-10-10",gross:100,kind:"COUPON",confidence:"HIGH",status:"FUTURE"},
 {date:"2026-10-20",gross:50,kind:"DIVIDEND",confidence:"HIGH",status:"FUTURE"},
 {date:"2026-12-01",gross:300,kind:"COUPON",confidence:"HIGH",status:"FUTURE"},
 {date:"2027-02-01",gross:500,kind:"DIVIDEND",confidence:"HIGH",status:"FUTURE"},
 {date:"2027-03-01",gross:999,kind:"COUPON",confidence:"MEDIUM",status:"FUTURE"},
 {date:"2026-11-01",gross:999,kind:"COUPON",confidence:"HIGH",status:"FACT"}
];
const r=buildPayoutRunway(events,"2026-10-01","2027-09-30");
assert.equal(r.available,true);
assert.equal(r.months.length,12);
assert.equal(r.totalGross,950);
assert.equal(r.totalCount,4);
assert.equal(r.activeMonths,3);
assert.equal(r.zeroMonths,9);
assert.equal(r.peakMonth?.key,"2027-02");
assert.equal(r.peakMonth?.gross,500);
assert.equal(r.couponGross,400);
assert.equal(r.dividendGross,550);
assert.equal(r.longestGap,7);
assert.equal(Math.round(r.averageActiveGross??0),317);
assert.equal(buildPayoutRunway(events,null,null).available,false);
console.log("incomePayoutRunwayV73: ok");