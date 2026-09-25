const assert=require("node:assert/strict");
const test=require("node:test");
const{normalizeMoexScreener}=require("../market-screener-core");

test("normalizes and joins MOEX securities + marketdata",()=>{
 const payload={
  securities:{columns:["SECID","SHORTNAME","LOTSIZE","LISTLEVEL","PREVPRICE"],data:[
   ["AAA","Alpha",10,1,100],["BBB","Beta",1,2,200]
  ]},
  marketdata:{columns:["SECID","LAST","LASTTOPREVPRICE","VALTODAY_RUR","VOLTODAY","NUMTRADES","OPEN","HIGH","LOW"],data:[
   ["AAA",105,5,15000000,100000,1200,101,106,99],["BBB",190,-5,5000000,5000,300,202,203,188]
  ]}
 };
 const rows=normalizeMoexScreener(payload);
 assert.equal(rows.length,2);
 assert.equal(rows[0].secid,"AAA");
 assert.equal(rows[0].turnoverRub,15000000);
 assert.equal(rows[0].dayChangePct,5);
 assert.equal(rows[1].listingLevel,2);
 assert.ok(rows[1].rangePct>0);
});

test("falls back to prev price and derived daily change when LAST is absent",()=>{
 const payload={
  securities:{columns:["SECID","SHORTNAME","PREVPRICE"],data:[["AAA","Alpha",100]]},
  marketdata:{columns:["SECID","MARKETPRICE"],data:[["AAA",102]]}
 };
 const row=normalizeMoexScreener(payload)[0];
 assert.equal(row.last,102);
 assert.equal(Math.round(row.dayChangePct*100)/100,2);
});

test("drops rows without a valid positive price",()=>{
 const payload={
  securities:{columns:["SECID","SHORTNAME"],data:[["BAD","Bad"]]},
  marketdata:{columns:["SECID","LAST"],data:[["BAD",null]]}
 };
 assert.equal(normalizeMoexScreener(payload).length,0);
});
