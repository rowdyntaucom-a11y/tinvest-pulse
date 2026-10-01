import assert from"node:assert/strict";import{buildPayoutLadder}from"../src/income/payoutLadder.ts";
const e=(date:string,gross:number,status="FORECAST",confidence="HIGH")=>({date,gross,status,confidence,kind:"COUPON",ticker:"X",name:"X",figi:"F"} as any);
const x=buildPayoutLadder([e("2026-10-11",100),e("2026-11-20",200),e("2027-02-10",300),e("2027-08-01",400),e("2026-10-05",999,"FACT"),e("2026-10-15",999,"FORECAST","LOW")],"2026-10-01T08:00:00Z");
assert.equal(x.available,true);assert.equal(x.totalCount,4);assert.equal(x.totalGross,1000);assert.deepEqual(x.bands.map(b=>b.count),[1,1,1,1]);assert.deepEqual(x.bands.map(b=>b.gross),[100,200,300,400]);assert.equal(Math.round(x.first90Share??0),30);assert.equal(Math.round(x.weightedDay??0),183);assert.equal(x.medianDay,50);
const zero=buildPayoutLadder([],"2026-10-01");assert.equal(zero.available,true);assert.equal(zero.totalCount,0);assert.equal(zero.first90Share,null);assert.equal(zero.weightedDay,null);
const bad=buildPayoutLadder([],"bad");assert.equal(bad.available,false);
console.log("incomePayoutLadderV75: ok");