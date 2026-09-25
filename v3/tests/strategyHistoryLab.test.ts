import assert from"node:assert/strict";
import test from"node:test";
import{alignStrategyLabSeries,runMonthlyRebalancedStrategy,filterStrategyLabWindow}from"../src/analysis/strategyHistoryLab.ts";

test("aligns only common valid dates",()=>{
 const rows=alignStrategyLabSeries(
  [{date:"2026-01-01",value:100},{date:"2026-01-02",value:101}],
  [{date:"2026-01-02",value:200},{date:"2026-01-03",value:201}],
 );
 assert.deepEqual(rows,[{date:"2026-01-02",equity:101,bond:200}]);
});

test("monthly rebalance produces deterministic metrics",()=>{
 const rows=[
  {date:"2026-01-30",equity:100,bond:100},
  {date:"2026-02-02",equity:110,bond:100},
  {date:"2026-02-03",equity:121,bond:100},
  {date:"2026-03-02",equity:121,bond:110},
 ];
 const result=runMonthlyRebalancedStrategy(rows,.5);
 assert.equal(result.available,true);
 assert.equal(result.curve.length,4);
 assert.ok((result.metrics?.totalReturn??0)>0);
 assert.ok((result.metrics?.maxDrawdown??1)<=0);
});

test("window filter preserves a bounded history tail",()=>{
 const rows=[
  {date:"2020-01-01",equity:1,bond:1},
  {date:"2024-01-01",equity:2,bond:2},
  {date:"2026-01-01",equity:3,bond:3},
 ];
 assert.equal(filterStrategyLabWindow(rows,1).length,2);
});
