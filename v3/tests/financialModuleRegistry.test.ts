import assert from"node:assert/strict";
import test from"node:test";
import{FINANCIAL_MODULES,assertReadOnlyProductInvariant,modulesForWorkspace}from"../src/product/financialModuleRegistry.ts";

test("financial registry has unique canonical module ownership",()=>{
 const ids=FINANCIAL_MODULES.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.ok(modulesForWorkspace("analysis").some(x=>x.id==="futures-scenario"));
 assert.ok(modulesForWorkspace("assets").some(x=>x.id==="equity-fundamentals"));
});

test("all financial modules preserve the read-only product boundary",()=>{
 assert.equal(assertReadOnlyProductInvariant(),true);
 assert.ok(FINANCIAL_MODULES.every(x=>x.noTrade===true));
});

test("source-gated professional tools do not masquerade as live",()=>{
 const options=FINANCIAL_MODULES.find(x=>x.id==="options-analytics");
 const micro=FINANCIAL_MODULES.find(x=>x.id==="orderbook-microstructure");
 assert.equal(options?.state,"source-gated");
 assert.equal(micro?.state,"source-gated");
 assert.equal(options?.requiresVerifiedMarketData,true);
 assert.equal(micro?.requiresVerifiedMarketData,true);
});
