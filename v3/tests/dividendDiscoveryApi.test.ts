import assert from"node:assert/strict";
import test from"node:test";
import{loadDividendDiscovery,normalizeDividendDiscoveryPayload}from"../src/income/dividendDiscoveryApi.ts";

const payload={
 available:true,
 updatedAt:"2026-09-28T00:00:00.000Z",
 yieldField:"dividend_yield_daily_ttm",
 yieldSemantics:"trailing_twelve_months",
 semantics:"descriptive_market_discovery",
 rows:[{assetUid:"asset-1",instrumentUid:"instrument-1",ticker:"REAL",name:"Real Company",dividendYieldDailyTtm:6.75,marketCapitalization:125_000_000_000}],
 coverage:{shares:10,fundamentals:9,matchedFundamentals:8,dividendRows:1,missingDividendYieldTtm:4,nonPositiveDividendYieldTtm:3},
}as const;

test("Samurai discovery accepts the explicit TTM API contract",()=>{
 const normalized=normalizeDividendDiscoveryPayload(payload);
 assert.ok(normalized);
 assert.equal(normalized.rows[0].dividendYieldDailyTtm,6.75);
 assert.equal(normalized.rows[0].marketCapitalization,125_000_000_000);
});

test("Samurai discovery rejects ambiguous, zero and inconsistent payloads",()=>{
 assert.equal(normalizeDividendDiscoveryPayload({...payload,yieldField:"forward_annual_dividend_yield"}),null);
 assert.equal(normalizeDividendDiscoveryPayload({...payload,rows:[{...payload.rows[0],dividendYieldDailyTtm:0}]}),null);
 assert.equal(normalizeDividendDiscoveryPayload({...payload,coverage:{...payload.coverage,dividendRows:2}}),null);
});

test("Samurai loader fetches the read-only discovery endpoint",async()=>{
 const original=globalThis.fetch;
 let request:RequestInfo|URL|undefined;
 globalThis.fetch=async(input)=>{request=input;return new Response(JSON.stringify(payload),{status:200,headers:{"Content-Type":"application/json"}})};
 try{
  const result=await loadDividendDiscovery();
  assert.equal(request,"/api/dividend-discovery");
  assert.equal(result.semantics,"descriptive_market_discovery");
 }finally{globalThis.fetch=original}
});
