import assert from"node:assert/strict";import{buildPayoutAttribution}from"../src/income/payoutAttribution.ts";
const positions:any[]=[
 {figi:"FIGI_A",ticker:"AAA",currentValue:60000},
 {figi:"FIGI_B",ticker:"BBB",currentValue:40000}
];
const events:any[]=[
 {figi:"FIGI_A",ticker:"AAA",date:"2026-11-01",gross:1000,confidence:"HIGH",status:"FUTURE"},
 {figi:"FIGI_A",ticker:"AAA",date:"2027-01-01",gross:500,confidence:"HIGH",status:"FUTURE"},
 {figi:"FIGI_B",ticker:"BBB",date:"2026-12-01",gross:300,confidence:"HIGH",status:"FUTURE"},
 {figi:"UNKNOWN",ticker:"CCC",date:"2026-12-15",gross:200,confidence:"HIGH",status:"FUTURE"},
 {figi:"FIGI_B",ticker:"BBB",date:"2026-10-01",gross:999,confidence:"MEDIUM",status:"FUTURE"},
 {figi:"FIGI_A",ticker:"AAA",date:"2026-09-01",gross:999,confidence:"HIGH",status:"FACT"}
];
const a=buildPayoutAttribution(events,positions);
assert.equal(a.confirmedGross,2000);
assert.equal(a.matchedGross,1800);
assert.equal(a.unmatchedGross,200);
assert.equal(a.confirmedCount,4);
assert.equal(a.matchedCount,3);
assert.equal(a.unmatchedCount,1);
assert.equal(a.rows.length,2);
assert.equal(a.rows[0].position.ticker,"AAA");
assert.equal(a.rows[0].gross,1500);
assert.equal(a.rows[0].count,2);
assert.equal(a.rows[0].nextDate,"2026-11-01");
assert.equal(a.rows[1].position.ticker,"BBB");
console.log("incomePayoutAttributionV72: ok");