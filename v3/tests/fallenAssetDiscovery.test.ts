import assert from"node:assert/strict";import test from"node:test";
import{scanFallenAssets}from"../src/analysis/fallenAssetDiscovery.ts";
const series:any[]=[
 {key:"A",label:"Alpha",instrumentId:"a",integrity:"VALID",duplicateRowsCollapsed:0,conflictingDates:0,points:Array.from({length:80},(_,i)=>({date:new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10),value:i<40?100+i:140-(i-39)*1.5}))},
 {key:"B",label:"Beta",instrumentId:"b",integrity:"VALID",duplicateRowsCollapsed:0,conflictingDates:0,points:[{date:"2026-01-01",value:100},{date:"2026-02-01",value:120},{date:"2026-03-01",value:118}]},
 {key:"C",label:"Conflict",instrumentId:"c",integrity:"CONFLICT",duplicateRowsCollapsed:0,conflictingDates:1,points:[]},
];
test("discovery sorts deepest current drawdown first and rejects conflict rows",()=>{const result=scanFallenAssets(series,12);assert.equal(result.rows[0].key,"A");assert.ok(result.rows[0].drawdownFromHigh<0);assert.equal(result.rejected,1)});
test("discovery exposes only factual close-derived metrics",()=>{const row=scanFallenAssets(series,12).rows[0];assert.ok(row.high>=row.latest);assert.ok(row.low<=row.latest);assert.ok(row.maxDrawdown<=0);assert.notEqual(row.sma50,null)});
test("short windows remain bounded by the series end date",()=>{const result=scanFallenAssets(series,3);assert.equal(result.window,3);assert.ok(result.rows.every(row=>row.observations>=2))});
