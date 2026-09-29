import assert from"node:assert/strict";
import test from"node:test";
import{
 FINANCIAL_MODULES,
 assertFinancialRegistryInvariant,
 assertReadOnlyProductInvariant,
 availabilityFor,
 compositionFor,
 liveModules,
 moduleById,
 modulesForWorkspace,
}from"../src/product/financialModuleRegistry.ts";

const liveContext={hasPortfolio:true,hasVerifiedMarketData:true};
const emptyContext={hasPortfolio:false,hasVerifiedMarketData:false};

test("financial registry has unique canonical module ownership",()=>{
 const ids=FINANCIAL_MODULES.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.ok(modulesForWorkspace("analysis").some(x=>x.id==="futures-scenario"));
 assert.ok(modulesForWorkspace("assets").some(x=>x.id==="equity-fundamentals"));
 assert.equal(assertFinancialRegistryInvariant(),true);
});

test("all financial modules preserve the read-only product boundary",()=>{
 assert.equal(assertReadOnlyProductInvariant(),true);
 assert.ok(FINANCIAL_MODULES.every(x=>x.noTrade===true));
});

test("source-gated professional tools do not masquerade as live",()=>{
 const options=moduleById("options-analytics");
 const micro=moduleById("orderbook-microstructure");
 assert.equal(options?.state,"source-gated");
 assert.equal(micro?.state,"source-gated");
 assert.equal(options?.requiresVerifiedMarketData,true);
 assert.equal(micro?.requiresVerifiedMarketData,true);
 assert.equal(options&&availabilityFor(options,liveContext),"SOURCE_CONTRACT_REQUIRED");
 assert.equal(micro&&availabilityFor(micro,liveContext),"SOURCE_CONTRACT_REQUIRED");
 assert.ok(!liveModules().some(x=>x.id==="options-analytics"||x.id==="orderbook-microstructure"));
});

test("implemented broad-market dividend discovery is registered as live",()=>{
 const discovery=moduleById("market-dividend-discovery");
 assert.equal(discovery?.state,"live");
 assert.deepEqual(discovery?.dataBoundaries,["fundamentals"]);
 assert.equal(discovery&&availabilityFor(discovery,liveContext),"AVAILABLE");
 assert.equal(discovery&&availabilityFor(discovery,emptyContext),"VERIFIED_MARKET_DATA_REQUIRED");
});

test("composition fails closed when portfolio or market contracts are missing",()=>{
 const blocked=compositionFor("analysis","mobile",emptyContext,{includeBlocked:true});
 const byId=new Map(blocked.map(item=>[item.module.id,item.availability]));
 assert.equal(byId.get("performance"),"PORTFOLIO_REQUIRED");
 assert.equal(byId.get("market-relative"),"PORTFOLIO_REQUIRED");
 assert.equal(byId.get("market-screener"),"VERIFIED_MARKET_DATA_REQUIRED");
 assert.equal(byId.get("futures-scenario"),"AVAILABLE");
 assert.equal(byId.get("options-analytics"),"SOURCE_CONTRACT_REQUIRED");
});

test("default composition exposes only currently available modules",()=>{
 const withoutData=compositionFor("analysis","mobile",emptyContext);
 assert.deepEqual(withoutData.map(item=>item.module.id),["futures-scenario"]);
 const marketOnly=compositionFor("analysis","mobile",{hasPortfolio:false,hasVerifiedMarketData:true});
 assert.deepEqual(marketOnly.map(item=>item.module.id),["technical-discovery","market-screener","futures-scenario"]);
});

test("mobile and desktop composition are deterministic and priority ordered",()=>{
 const mobile=compositionFor("analysis","mobile",liveContext);
 const desktop=compositionFor("analysis","desktop",liveContext);
 assert.deepEqual(mobile.map(item=>item.module.id),[
  "performance","risk","market-relative","rebalance","portfolio-lab","technical-discovery","market-screener","futures-scenario",
 ]);
 assert.deepEqual(desktop.map(item=>item.module.id),[
  "performance","risk","market-relative","rebalance","portfolio-lab","market-screener","futures-scenario","technical-discovery",
 ]);
 assert.deepEqual(compositionFor("analysis","desktop",liveContext),desktop);
});

test("architecture modules stay outside product composition unless explicitly requested",()=>{
 assert.deepEqual(compositionFor("account","mobile",liveContext),[]);
 const architecture=compositionFor("account","mobile",liveContext,{includeBlocked:true,includeArchitecture:true});
 assert.deepEqual(architecture.map(item=>item.module.id),["registration","broker-connections"]);
 assert.ok(architecture.every(item=>item.availability==="ARCHITECTURE_ONLY"&&item.blocked));
});

test("live modules declare explicit source boundaries",()=>{
 const live=liveModules();
 assert.ok(live.length>0);
 assert.ok(live.every(module=>module.dataBoundaries.length>0));
 assert.deepEqual(moduleById("performance")?.dataBoundaries,["portfolio","portfolio-history"]);
 assert.deepEqual(moduleById("income-calendar")?.dataBoundaries,["portfolio","payouts"]);
 assert.deepEqual(moduleById("futures-scenario")?.dataBoundaries,["scenario-input"]);
});
