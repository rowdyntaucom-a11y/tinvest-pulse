import test from"node:test";import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const loader=readFileSync(new URL("../src/data/loadV3Portfolio.ts",import.meta.url),"utf8");
const recovery=readFileSync(new URL("../src/data/fastPortfolioRecovery.ts",import.meta.url),"utf8");
const core=readFileSync(new URL("../src/core/CoreRoot.tsx",import.meta.url),"utf8");

test("slow dashboard is hedged by independent read-only portfolio recovery",()=>{
 assert.match(loader,/RECOVERY_HEDGE_MS=1800/);
 assert.match(loader,/loadFastPortfolioRecovery/);
 assert.match(loader,/firstSuccessful\(\[primary,recovery\]\)/);
 assert.match(recovery,/\/api\/portfolio/);
 assert.match(recovery,/\/api\/accounts/);
 assert.match(recovery,/brokerPortfolio:true/);
 assert.match(recovery,/source:"portfolio"/);
});

test("recovery does not fabricate unsupported analytics or income",()=>{
 assert.match(recovery,/passiveIncomeComplete:false/);
 assert.match(recovery,/xirr:null,cagr:null/);
 assert.match(recovery,/history:\[\]/);
 assert.match(core,/incomeTrusted=trusted&&\(snapshot\.source==="dashboard"\|\|snapshot\.recoveryContext\?\.passiveIncomeComplete===true\)/);
 assert.match(core,/Выплаты пока не подтверждены и не выдаются за ноль/);
});

test("cold start exposes a meaningful recovery state instead of silent dashes",()=>{
 assert.match(core,/Подключаем брокерские данные/);
 assert.match(core,/независимый read-only портфель/);
 assert.match(core,/автоматическое восстановление/);
 assert.match(core,/setReason\(friendlyLoadError\(error\)\)/);
});
console.log("dataRecoveryV103: ok");
