import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const glossary=readFileSync(new URL("../src/help/V3GlossaryHelp.tsx",import.meta.url),"utf8");
const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const analytics=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const rebalance=readFileSync(new URL("../src/analysis/V3RebalanceWorkspace.tsx",import.meta.url),"utf8");
const futures=readFileSync(new URL("../src/terminal/V3FuturesScenario.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/glossaryHelp.css",import.meta.url),"utf8");

test("glossary covers core finance and risk concepts without recommendation language",()=>{
 for(const term of["twr","xirr","cagr","pnl","var","cvar","beta","trackingError","basis","margin","drift","coverage","ytm","duration"])assert.match(glossary,new RegExp(term));
 assert.match(glossary,/не являются инвестиционной рекомендацией или прогнозом/);
});

test("glossary sheet is keyboard dismissible and modal on mobile",()=>{
 assert.match(glossary,/e\.key==="Escape"/);
 assert.match(glossary,/role="dialog"/);
 assert.match(glossary,/aria-modal="true"/);
 assert.match(css,/max-height:min\(78dvh,720px\)/);
 assert.match(css,/focus-visible/);
});

test("core and professional workspaces expose contextual help at meaningful boundaries",()=>{
 assert.match(core,/Как читать доходность/);
 assert.match(core,/Пояснить метрики риска/);
 assert.match(analytics,/Методика показателей/);
 assert.match(rebalance,/Как читать ребаланс/);
 assert.match(futures,/Что такое Basis и ГО/);
});
