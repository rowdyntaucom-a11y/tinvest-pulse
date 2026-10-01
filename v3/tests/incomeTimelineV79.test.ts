import assert from"node:assert/strict";import{buildIncomeTimeline}from"../src/income/incomeTimeline.ts";
const p=(figi:string,ticker:string)=>({figi,ticker,name:ticker} as any),e=(kind:string,date:string,figi:string,net:number,gross:number,status="FACT",confidence="HIGH")=>({kind,date,figi,ticker:figi,name:figi,net,gross,status,confidence} as any);
const a=[e("COUPON","2026-09-20","A",90,100),e("DIVIDEND","2026-08-01","B",180,200)];
const f=[e("COUPON","2026-10-10","A",0,120,"FORECAST"),e("DIVIDEND","2026-11-15","B",0,220,"FORECAST"),e("COUPON","2026-12-01","C",0,300,"FORECAST","LOW")];
const x=buildIncomeTimeline(a,f,[p("A","AAA"),p("B","BBB")],"2026-10-01","ALL");assert.equal(x.available,true);assert.equal(x.pastCount,2);assert.equal(x.futureCount,2);assert.equal(x.past[0]!.amountBasis,"NET");assert.equal(x.future[0]!.amountBasis,"GROSS");assert.equal(x.nearestPastDays,11);assert.equal(x.nearestFutureDays,9);assert.equal(x.future[0]!.position!.ticker,"AAA");
const c=buildIncomeTimeline(a,f,[p("A","AAA"),p("B","BBB")],"2026-10-01","COUPON");assert.equal(c.pastCount,1);assert.equal(c.futureCount,1);
console.log("incomeTimelineV79: ok");