import assert from"node:assert/strict";
import{buildPulseHistoryGeometry,buildV3PulseSnapshot}from"../src/pulse/pulseSnapshot.ts";

const home:any={
 accountName:"Test",value:1000,profit:100,profitPct:10,passiveIncome:50,monthlyIncome:5,positions:3,cagr:null,xirr:.12,updatedAt:"2026-09-19T12:00:00Z",
 history:[
  {date:"2026-09-01",value:900,invested:850},
  {date:"2026-09-02",value:930,invested:850},
  {date:"2026-09-03",value:null,invested:900},
  {date:"2026-09-04",value:970,invested:900},
  {date:"2026-09-05",value:1000,invested:900},
 ],leaders:[],best:null,worst:null,isTrusted:true
};
const positions:any[]=[
 {ticker:"A",instrumentUid:"uid-a",figi:"figi-a",currentValue:400,weight:.4},
 {ticker:"B",instrumentUid:"uid-b",figi:"figi-b",currentValue:300,weight:.3},
 {ticker:"C",instrumentUid:"uid-c",figi:"figi-c",currentValue:200,weight:.2},
 {ticker:"D",instrumentUid:"uid-d",figi:"figi-d",currentValue:100,weight:.1},
];
const snapshot=buildV3PulseSnapshot(home,positions);
assert.equal(snapshot.available,true);
assert.equal(snapshot.value,1000);
assert.equal(snapshot.xirr,.12);
assert.deepEqual(snapshot.allocation.map(x=>x.ticker),["A","B","C","D"]);
assert.ok(Math.abs(snapshot.allocationCoverage-1)<1e-12);
const geometry=buildPulseHistoryGeometry(snapshot.history);
assert.equal(geometry.available,true);
assert.equal(geometry.segments.length,2);
assert.equal(geometry.start,900);
assert.equal(geometry.end,1000);
const untrusted=buildV3PulseSnapshot({...home,isTrusted:false},positions);
assert.equal(untrusted.available,false);
assert.equal(untrusted.value,null);
assert.equal(untrusted.profit,null);
assert.equal(untrusted.history.length,0);
assert.equal(untrusted.allocation.length,0);
const isolated=buildPulseHistoryGeometry([{date:"2026-01-01",value:100},{date:"2026-01-02",value:null},{date:"2026-01-03",value:110}] as any);
assert.equal(isolated.available,false);
assert.equal(isolated.segments.length,0);
console.log("v3 Pulse trusted snapshot and non-interpolated geometry: ok");
