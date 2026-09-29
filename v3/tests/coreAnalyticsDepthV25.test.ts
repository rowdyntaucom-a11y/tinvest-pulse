import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const depth=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const root=readFileSync(new URL("../src/core/CoreRoot.tsx",import.meta.url),"utf8");
const workspace=readFileSync(new URL("../src/core/CoreWorkspace.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("light Core composes canonical return risk and benchmark engines",()=>{
 for(const token of["buildV3AnalysisDepth","buildV3RelativeDepth","V3ReturnLayer","V3RiskLayer","V3MarketLayer"])assert.match(depth,new RegExp(token));
 for(const token of["Доходность","Риск","IMOEX","ANALYTICS DEPTH // READ-ONLY"])assert.match(depth,new RegExp(token));
 assert.match(depth,/filterHistoryWindow/);
});

test("deep analytics receives verified market context from the trusted snapshot",()=>{
 for(const token of["riskFreeRate","riskFreeRateDate","nextRateMeeting"])assert.match(root,new RegExp(token));
 assert.match(root,/trusted\?snapshot\.riskFreeRate:null/);
 assert.match(workspace,/CoreAnalyticsMarketContext/);
 assert.match(ui,/marketContext=\{marketContext\}/);
});

test("analytics depth is lazy and prefetched only after trusted first paint",()=>{
 assert.match(ui,/CoreAnalyticsDepth=lazy/);
 assert.match(ui,/\[\"depth\",\"Глубина\"\]/);
 assert.match(root,/import\(\"\.\/CoreAnalyticsDepth\"\)/);
 assert.match(root,/if\(!trusted\)return/);
});

test("light analytics keeps risk semantics and no trading action",()=>{
 assert.match(depth,/VaR\/CVaR/);
 assert.match(depth,/не являются прогнозом или торговым сигналом/);
 assert.doesNotMatch(depth,/купить|продать|заявк|order|trade execution/i);
});

test("canonical analytics mobile typography stays above microtype",()=>{
 assert.match(css,/core-analytics-depth/);
 assert.match(css,/v3-risk-contributors-head[^}]*font-size:9px/);
 assert.match(css,/v3-risk-asset-link small[^}]*font-size:9px/);
 assert.match(css,/core-analytics-depth__nav small[^}]*font-size:9px/);
});
