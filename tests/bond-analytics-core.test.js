const assert=require("node:assert/strict");
const test=require("node:test");
const{bondDirtyPriceRub,marketYieldPct,cashflowYield,modifiedDuration,maturityBucket}=require("../bond-analytics-core");

test("bond dirty price converts percent-of-nominal quote and adds ACI",()=>{
 assert.equal(bondDirtyPriceRub(82.5,1000,17.4),842.4);
 assert.equal(bondDirtyPriceRub(100,1000,0),1000);
 assert.equal(bondDirtyPriceRub(null,1000,10),null);
});

test("market yield parser accepts GetMarketValues yield payload",()=>{
 const response={instruments:[{instrumentUid:"uid-1",values:[{type:"INSTRUMENT_VALUE_LAST_PRICE",value:{units:82,nano:500000000}},{type:"INSTRUMENT_VALUE_YIELD",value:{units:14,nano:250000000}}]}]};
 assert.equal(marketYieldPct(response,"uid-1"),14.25);
});

test("cashflow fallback and duration are deterministic",()=>{
 const flows=[{t:.5,amount:40},{t:1,amount:1040}];
 const y=cashflowYield(1000,flows);
 assert.ok(y!=null&&y>0);
 const d=modifiedDuration(y,flows);
 assert.ok(d!=null&&d>0&&d<1.1);
});

test("maturity buckets remain explicit",()=>{
 assert.equal(maturityBucket(2.9),"0-3");
 assert.equal(maturityBucket(5),"3-7");
 assert.equal(maturityBucket(10),"7-15");
 assert.equal(maturityBucket(20),"15+");
 assert.equal(maturityBucket(null),"unknown");
});
