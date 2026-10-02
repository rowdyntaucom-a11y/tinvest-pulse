import test from"node:test";
import assert from"node:assert/strict";
import{buildIncomeWorkspaceSummary}from"../src/income/incomeWorkspaceSummary.ts";

const event=(date:string,gross:number,confidence="HIGH",status="SCHEDULED",ticker="A")=>({kind:"COUPON",ticker,name:ticker,date,gross,confidence,status}) as any;

test("workspace summary keeps only future HIGH events and uses cumulative 30/90/365 horizons",()=>{
 const summary=buildIncomeWorkspaceSummary([
  event("2026-10-10",100),event("2026-12-01",200),event("2027-06-01",300),event("2026-10-05",999,"LOW"),event("2026-09-01",777),event("2026-10-07",555,"HIGH","FACT")
 ],"2026-10-02T12:00:00Z");
 assert.equal(summary.available,true);
 assert.equal(summary.confirmedCount,3);
 assert.equal(summary.confirmedGross,600);
 assert.equal(summary.next?.date,"2026-10-10");
 assert.equal(summary.nextDays,8);
 assert.deepEqual(summary.buckets.map(row=>[row.days,row.gross,row.count]),[[30,100,1],[90,300,2],[365,600,3]]);
});

test("workspace summary fails closed when calendar anchor is missing",()=>{
 const summary=buildIncomeWorkspaceSummary([event("2026-10-10",100)],null);
 assert.equal(summary.available,false);
 assert.equal(summary.confirmedCount,0);
 assert.equal(summary.next,null);
});
