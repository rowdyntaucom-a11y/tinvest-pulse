import assert from"node:assert/strict";
import test from"node:test";
import{buildFuturesShockGrid,calculateFuturesScenario,futuresScenarioWarnings,parseScenarioNumber}from"../src/terminal/futuresMath.ts";

test("futures scenario calculates notional leverage pnl and basis deterministically",()=>{
 const input={futuresPrice:100,spotPrice:98,scenarioPrice:105,contracts:2,priceValuePerPoint:10,marginPerContract:250,daysToExpiry:30};
 const r=calculateFuturesScenario(input);
 assert.equal(r.notional,2000);
 assert.equal(r.totalMargin,500);
 assert.equal(r.leverage,4);
 assert.equal(r.scenarioPnl,100);
 assert.equal(r.scenarioMarginReturnPct,20);
 assert.ok(r.basisPct!=null&&r.basisPct>2&&r.basisPct<2.1);
 assert.ok(r.annualizedBasisPct!=null&&r.annualizedBasisPct>24&&r.annualizedBasisPct<26);
});

test("futures scenario stays fail-closed when specification inputs are missing",()=>{
 const r=calculateFuturesScenario({futuresPrice:100,spotPrice:null,scenarioPrice:105,contracts:1,priceValuePerPoint:null,marginPerContract:null,daysToExpiry:null});
 assert.equal(r.notional,null);
 assert.equal(r.scenarioPnl,null);
 assert.equal(r.leverage,null);
 assert.equal(r.basisPct,null);
 assert.equal(r.annualizedBasisPct,null);
});

test("scenario parser accepts Russian decimal comma and warnings flag extreme leverage",()=>{
 assert.equal(parseScenarioNumber("12,5"),12.5);
 const input={futuresPrice:100,spotPrice:100,scenarioPrice:101,contracts:1,priceValuePerPoint:10,marginPerContract:50,daysToExpiry:5};
 const result=calculateFuturesScenario(input);
 assert.ok(futuresScenarioWarnings(input,result).some(x=>/плечо/i.test(x)));
});


test("futures shock grid is deterministic, symmetric and margin-aware",()=>{
 const input={futuresPrice:100,spotPrice:null,scenarioPrice:null,contracts:2,priceValuePerPoint:10,marginPerContract:250,daysToExpiry:null};
 const grid=buildFuturesShockGrid(input,[-5,5]);
 assert.deepEqual(grid.map(x=>x.movePct),[-5,5]);
 assert.equal(grid[0]?.scenarioPrice,95);
 assert.equal(grid[0]?.pnl,-100);
 assert.equal(grid[0]?.marginReturnPct,-20);
 assert.equal(grid[1]?.scenarioPrice,105);
 assert.equal(grid[1]?.pnl,100);
 assert.equal(grid[1]?.marginReturnPct,20);
});

test("futures shock grid fails closed without contract value inputs",()=>{
 const input={futuresPrice:100,spotPrice:null,scenarioPrice:null,contracts:1,priceValuePerPoint:null,marginPerContract:250,daysToExpiry:null};
 assert.deepEqual(buildFuturesShockGrid(input),[]);
});
