import assert from"node:assert/strict";
import{calculateIncomeQuality}from"../src/income/incomeQuality.ts";

const months:any[]=[
 {key:"2026-06",totalNet:100,complete:true,partial:false},
 {key:"2026-07",totalNet:200,complete:true,partial:false},
 {key:"2026-08",totalNet:0,complete:true,partial:false},
 {key:"2026-09",totalNet:999,complete:false,partial:true},
];
const events:any[]=[
 {status:"FACT",kind:"COUPON",net:100},
 {status:"FACT",kind:"DIVIDEND",net:200},
 {status:"FACT",kind:"OTHER",net:50},
 {status:"SCHEDULED",kind:"DIVIDEND",net:999},
 {status:"FACT",kind:"DIVIDEND",net:0},
];
const quality=calculateIncomeQuality(events,months);
assert.equal(quality.available,true);
assert.equal(quality.status,"preview");
assert.equal(quality.observedMonths,3);
assert.equal(quality.payoutMonths,2);
assert.equal(quality.regularityRatio,2/3);
assert.equal(quality.totalNet,350);
assert.equal(quality.couponsNet,100);
assert.equal(quality.dividendsNet,200);
assert.equal(quality.otherNet,50);
assert.equal(quality.couponShare,100/350);
assert.equal(quality.dividendShare,200/350);

const short=calculateIncomeQuality(events,months.slice(0,2));
assert.equal(short.available,false);
assert.equal(short.status,"insufficient");
assert.equal(short.observedMonths,2);

const empty=calculateIncomeQuality([{status:"FACT",kind:"COUPON",net:0} as any],months.slice(0,3));
assert.equal(empty.available,false);
assert.equal(empty.totalNet,0);
assert.equal(empty.couponShare,null);

const mature=calculateIncomeQuality(events,Array.from({length:12},(_,index)=>({key:`2025-${String(index+1).padStart(2,"0")}`,totalNet:index%2?0:10,complete:true,partial:false} as any)));
assert.equal(mature.status,"mature");
assert.equal(mature.observedMonths,12);
assert.equal(mature.regularityRatio,.5);
console.log("v3 income quality: ok");
