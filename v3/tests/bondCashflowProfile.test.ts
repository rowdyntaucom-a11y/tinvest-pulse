import assert from"node:assert/strict";
import{buildBondCashflowProfile}from"../src/income/bondCashflowProfile.ts";

const linkage:any={eligibleBondCount:3,linkedBondCount:2,totalBondValue:3000,linkedBondValue:2400,valueCoverage:.8,couponEvents:3,scheduledGross:450,rows:[
 {figi:"F1",ticker:"B1",currentValue:1200,couponEvents:2,scheduledGross:300,nextCouponDate:"2026-10-10"},
 {figi:"F2",ticker:"B2",currentValue:1200,couponEvents:1,scheduledGross:150,nextCouponDate:"2026-11-10"},
]};
const events:any[]=[
 {figi:"F1",kind:"COUPON",status:"SCHEDULED",date:"2026-10-10",gross:100},
 {figi:"F1",kind:"COUPON",status:"SCHEDULED",date:"2026-11-10",gross:200},
 {figi:"F2",kind:"COUPON",status:"SCHEDULED",date:"2026-11-20",gross:150},
 {figi:"F1",kind:"COUPON",status:"FACT",date:"2026-09-10",gross:999},
 {figi:"OTHER",kind:"COUPON",status:"SCHEDULED",date:"2026-12-10",gross:999},
 {figi:"F1",kind:"DIVIDEND",status:"SCHEDULED",date:"2026-12-10",gross:999},
];
const profile=buildBondCashflowProfile(linkage,events);
assert.equal(profile.available,true);
assert.equal(profile.scheduledGross,450);
assert.equal(profile.couponEvents,3);
assert.equal(profile.activeMonths,2);
assert.equal(profile.months[0].key,"2026-10");
assert.equal(profile.months[0].gross,100);
assert.equal(profile.months[1].gross,350);
assert.equal(profile.months[1].issues,2);
assert.equal(profile.largestMonthGross,350);
assert.equal(profile.largestMonthShare,350/450);
assert.equal(profile.topIssueGross,300);
assert.equal(profile.topIssueShare,300/450);
assert.equal(profile.valueCoverage,.8);

const empty=buildBondCashflowProfile({...linkage,linkedBondCount:0,rows:[]},events);
assert.equal(empty.available,false);
assert.equal(empty.scheduledGross,0);
console.log("v3 bond cashflow profile: ok");
