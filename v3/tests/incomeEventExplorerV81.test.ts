import assert from"node:assert/strict";import{buildIncomeEventExplorer}from"../src/income/incomeEventExplorer.ts";
const p=(figi:string,ticker:string)=>({figi,ticker,name:ticker} as any),e=(kind:string,date:string,figi:string,gross:number,confidence="HIGH")=>({kind,date,figi,gross,status:"FORECAST",confidence,ticker:figi,name:figi} as any);
const events=[e("COUPON","2026-10-10","A",100),e("DIVIDEND","2026-11-10","B",300),e("COUPON","2027-02-10","X",200),e("COUPON","2026-10-20","A",999,"LOW")];
const x=buildIncomeEventExplorer(events,[p("A","AAA"),p("B","BBB")],"2026-10-01",{horizon:180});assert.equal(x.count,3);assert.equal(x.gross,600);assert.equal(x.linkedCount,2);assert.equal(x.unlinkedCount,1);
const c=buildIncomeEventExplorer(events,[p("A","AAA"),p("B","BBB")],"2026-10-01",{horizon:90,kind:"COUPON",link:"LINKED"});assert.equal(c.count,1);assert.equal(c.rows[0]!.position!.ticker,"AAA");
const s=buildIncomeEventExplorer(events,[p("A","AAA"),p("B","BBB")],"2026-10-01",{sort:"AMOUNT"});assert.equal(s.rows[0]!.gross,300);
console.log("incomeEventExplorerV81: ok");