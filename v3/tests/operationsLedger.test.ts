import assert from"node:assert/strict";
import test from"node:test";
import{normalizeOperationsSummary}from"../src/operations/operationsLedger.ts";

test("operations ledger classifies explicit broker events and preserves traceability",()=>{
 const ledger=normalizeOperationsSummary({
  ok:true,
  passiveIncomeTotal:100,
  externalCashTotal:1000,
  fetchedAt:"2026-09-25T08:00:00Z",
  operations:[
   {id:"1",date:"2026-09-01T10:00:00Z",type:"OPERATION_TYPE_INPUT",payment:1000,isExternalCash:true,isIncome:false},
   {id:"2",date:"2026-09-02T10:00:00Z",type:"OPERATION_TYPE_BUY",payment:-500,isExternalCash:false,isIncome:false,figi:"BBG1",ticker:"AAA",quantity:1},
   {id:"3",date:"2026-09-03T10:00:00Z",type:"OPERATION_TYPE_COUPON",payment:100,isExternalCash:false,isIncome:true,figi:"BBG2",ticker:"BOND"}
  ]
 });
 assert.equal(ledger.available,true);
 assert.equal(ledger.integrityLevel,"OK");
 assert.deepEqual(ledger.rows.map(row=>row.kind),["INCOME","TRADE","EXTERNAL_CASH"]);
 assert.equal(ledger.traceableRatio,1);
 assert.equal(ledger.instrumentIdentityRatio,1);
 assert.equal(ledger.aggregatesMatch,true);
});

test("operations ledger fails partial when traceability, duplicates or aggregates are not clean",()=>{
 const ledger=normalizeOperationsSummary({
  ok:true,
  passiveIncomeTotal:99,
  externalCashTotal:1000,
  operations:[
   {id:"dup",date:"2026-09-01T10:00:00Z",type:"OPERATION_TYPE_INPUT",payment:1000,isExternalCash:true},
   {id:"dup",date:"2026-09-02T10:00:00Z",type:"OPERATION_TYPE_BUY",payment:-500},
   {date:"2026-09-03T10:00:00Z",type:"OPERATION_TYPE_COUPON",payment:100,isIncome:true}
  ]
 });
 assert.equal(ledger.available,true);
 assert.equal(ledger.duplicates,1);
 assert.equal(ledger.traceableRatio,.5);
 assert.equal(ledger.aggregatesMatch,false);
 assert.equal(ledger.integrityLevel,"PARTIAL");
});

test("malformed source fails closed instead of inventing events",()=>{
 const ledger=normalizeOperationsSummary({ok:false,operations:[{date:"today",type:"BUY",payment:1}]});
 assert.equal(ledger.available,false);
 assert.equal(ledger.rows.length,0);
 assert.equal(ledger.integrityLevel,"UNAVAILABLE");
});
