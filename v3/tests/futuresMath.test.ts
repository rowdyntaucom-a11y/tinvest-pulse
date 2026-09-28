import assert from"node:assert/strict";
import test from"node:test";
import{calculateFuturesRiskProfile,calculateFuturesScenario,futuresScenarioWarnings,parseScenarioNumber}from"../src/terminal/futuresMath.ts";

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


test("short direction reverses scenario P/L without changing notional",()=>{
 const base={futuresPrice:100,spotPrice:98,scenarioPrice:105,contracts:2,priceValuePerPoint:10,marginPerContract:250,daysToExpiry:30} as const;
 const long=calculateFuturesScenario({...base,direction:"LONG"});
 const short=calculateFuturesScenario({...base,direction:"SHORT"});
 assert.equal(long.notional,short.notional);
 assert.equal(long.scenarioPnl,100);
 assert.equal(short.scenarioPnl,-100);
 assert.equal(short.scenarioMarginReturnPct,-20);
});

test("derivatives V2 stress matrix is symmetric and margin-aware",()=>{
 const input={futuresPrice:100,spotPrice:98,scenarioPrice:null,contracts:2,priceValuePerPoint:10,marginPerContract:250,daysToExpiry:30,direction:"LONG" as const};
 const risk=calculateFuturesRiskProfile(input);
 assert.equal(risk.complete,true);
 assert.equal(risk.onePercentPnl,20);
 assert.equal(risk.priceMoveToMarginLossPct,25);
 assert.equal(risk.stress.length,6);
 assert.ok(Math.abs((risk.stress.find(row=>row.movePct===-10)?.pnl??0)+200)<1e-9);
 assert.ok(Math.abs((risk.stress.find(row=>row.movePct===10)?.pnl??0)-200)<1e-9);
 assert.equal(risk.basisState,"CONTANGO");
 assert.ok(risk.expiryBasisDecayPerDayPct!=null&&risk.expiryBasisDecayPerDayPct>0);
});

test("derivatives V2 stays fail-closed without contract specification",()=>{
 const risk=calculateFuturesRiskProfile({futuresPrice:100,spotPrice:null,scenarioPrice:null,contracts:1,priceValuePerPoint:null,marginPerContract:null,daysToExpiry:null,direction:"SHORT"});
 assert.equal(risk.complete,false);
 assert.equal(risk.onePercentPnl,null);
 assert.equal(risk.priceMoveToMarginLossPct,null);
 assert.equal(risk.basisState,"UNAVAILABLE");
 assert.equal(risk.stress.length,6);
 assert.ok(risk.stress.every(row=>row.pnl==null&&row.marginReturnPct==null));
});
