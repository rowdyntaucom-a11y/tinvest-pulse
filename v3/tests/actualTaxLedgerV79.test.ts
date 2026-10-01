import assert from"node:assert/strict";import{buildActualTaxLedger}from"../src/income/actualTaxLedger.ts";
const p=(figi:string,ticker:string)=>({figi,ticker,name:ticker,currentValue:1,expectedYield:0,quantity:1,averagePrice:1,currentPrice:1,costBasis:1} as any);
const e=(date:string,gross:number,net:number,tax:number,figi:string,kind:string)=>({date,gross,net,tax,figi,ticker:figi,name:figi,status:"FACT",confidence:"HIGH",kind} as any);
const items=[e("2026-08-10",100,87,13,"A","COUPON"),e("2026-08-20",200,174,26,"A","DIVIDEND"),e("2026-09-10",100,100,0,"B","COUPON"),e("2026-09-12",50,40,5,"X","OTHER")];
const obs={available:true,from:"2026-08-01",to:"2026-09-30",completeMonths:["2026-08"],partialMonths:["2026-09"]} as any;
const x=buildActualTaxLedger(items,[p("A","AAA"),p("B","BBB")],obs);
assert.equal(x.gross,450);assert.equal(x.net,401);assert.equal(x.tax,44);assert.equal(x.reconciliationDelta,5);assert.equal(Math.round(x.taxRate??0),10);assert.equal(Math.round(x.netRetention??0),89);assert.equal(x.taxedEvents,3);assert.equal(x.zeroTaxEvents,1);assert.equal(x.months.length,2);assert.equal(x.months[0]?.observation,"complete");assert.equal(x.months[1]?.observation,"partial");assert.equal(x.kinds.length,3);assert.equal(x.sources.length,3);assert.equal(x.sources.find(s=>s.figi==="A")?.position?.ticker,"AAA");assert.equal(x.sources.find(s=>s.figi==="X")?.position,null);
const z=buildActualTaxLedger([],[],undefined);assert.equal(z.available,false);assert.equal(z.taxRate,null);assert.equal(z.reconciliationDelta,0);
console.log("actualTaxLedgerV79: ok");