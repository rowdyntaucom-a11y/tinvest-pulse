import assert from"node:assert/strict";import{buildPayoutHorizon}from"../src/income/payoutHorizon.ts";
const events:any[]=[
 {date:"2026-10-10",gross:100,confidence:"HIGH",status:"FUTURE"},
 {date:"2026-11-20",gross:200,confidence:"HIGH",status:"FUTURE"},
 {date:"2027-01-15",gross:300,confidence:"HIGH",status:"FUTURE"},
 {date:"2027-05-01",gross:400,confidence:"HIGH",status:"FUTURE"},
 {date:"2026-10-05",gross:999,confidence:"MEDIUM",status:"FUTURE"},
 {date:"2026-09-01",gross:999,confidence:"HIGH",status:"FACT"}
];
const r=buildPayoutHorizon(events,"2026-10-01T08:00:00.000Z");
assert.equal(r.available,true);
assert.equal(r.anchorDate,"2026-10-01");
assert.equal(r.nextDate,"2026-10-10");
assert.equal(r.nextDays,9);
assert.equal(r.confirmedGross,1000);
assert.equal(r.confirmedCount,4);
assert.deepEqual(r.buckets.map(x=>[x.days,x.gross,x.count]),[[30,100,1],[90,300,2],[180,600,3],[365,1000,4]]);
assert.equal(buildPayoutHorizon(events,null).available,false);
console.log("incomePayoutHorizonV74: ok");