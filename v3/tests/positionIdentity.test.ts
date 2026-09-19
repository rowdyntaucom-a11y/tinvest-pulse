import assert from"node:assert/strict";
import{exactPositionIdentity,positionIdentityKey,resolveExactPosition,resolvePositionByKey}from"../src/assets/positionIdentity.ts";

const rows:any[]=[
 {ticker:"AAA",instrumentUid:"uid-a",figi:"figi-a"},
 {ticker:"BBB",instrumentUid:"uid-b",figi:"figi-b"},
];
assert.deepEqual(exactPositionIdentity({instrumentUid:" uid-a ",figi:"figi-a"}),{kind:"instrumentUid",value:"uid-a"});
assert.deepEqual(exactPositionIdentity({instrumentUid:"",figi:" figi-a "}),{kind:"figi",value:"figi-a"});
assert.equal(exactPositionIdentity({}),null);
assert.equal(positionIdentityKey(rows[0]),"uid-a");
assert.equal(resolveExactPosition(rows,{instrumentUid:"uid-a"}),rows[0]);
assert.equal(resolveExactPosition(rows,{figi:"figi-b"}),rows[1]);
assert.equal(resolvePositionByKey(rows,"uid-a"),rows[0]);
assert.equal(resolvePositionByKey(rows,"figi-b"),rows[1]);
assert.equal(resolvePositionByKey(rows,"AAA"),null);
assert.equal(resolveExactPosition([...rows,{ticker:"AAA2",instrumentUid:"uid-a",figi:"figi-x"}],{instrumentUid:"uid-a"}),null);
assert.equal(resolvePositionByKey([...rows,{ticker:"AAA2",instrumentUid:"uid-x",figi:"figi-a"}],"figi-a"),null);
console.log("v3 exact position identity: ok");
