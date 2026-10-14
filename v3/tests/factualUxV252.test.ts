import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";
import{FACTUAL_TOOLS,FACTUAL_TOOL_STORAGE_KEY,resolveFactualToolId}from"../src/analysis/factualToolsV252.ts";

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),"utf8");
const toolbox=read("../src/analysis/V3AnalysisToolbox.tsx");
const core=read("../src/core/SnowballCore.tsx");
const compact=read("../src/core/CoreCompactCockpit.tsx");
const analysis=read("../src/analysis/V3Analysis.tsx");
const style=read("../src/styles/proToolsWorkspaceV100.css");

test("only bond evidence and portfolio report remain directly available",()=>{
 assert.deepEqual(FACTUAL_TOOLS.map(x=>x.id),["bonds","report"]);
 assert.equal(FACTUAL_TOOLS.length,2);
});
test("each remaining destination describes concrete portfolio evidence",()=>{
 for(const t of FACTUAL_TOOLS){assert.ok(t.label.length>3);assert.ok(t.note.includes("·"));assert.ok(t.hero.length>40)}
});
test("obsolete saved simulator tabs redirect to useful bonds by default",()=>{
 for(const obsolete of["rebalance","lab","futures","market","scenario","what-if","","tools",null,undefined,0,{},[]])assert.equal(resolveFactualToolId(obsolete),"bonds")
});
test("stored valid report selection survives next visit",()=>{
 assert.equal(resolveFactualToolId("report"),"report");
 assert.equal(resolveFactualToolId("bonds"),"bonds");
});
test("existing persisted key migrates without losing user data elsewhere",()=>{
 assert.equal(FACTUAL_TOOL_STORAGE_KEY,"qvanix-pro-tools-v100");
 assert.match(toolbox,/sessionStorage\.getItem\(FACTUAL_TOOL_STORAGE_KEY\)/);
 assert.match(toolbox,/sessionStorage\.setItem\(FACTUAL_TOOL_STORAGE_KEY,id\)/);
});
test("toolbox does not import arbitrary forecasting modules",()=>{
 for(const old of["V3RebalanceWorkspace","V3PortfolioLab","V3FuturesScenario","V3MarketIntelligenceWorkspace"])assert.doesNotMatch(toolbox,new RegExp(old))
});
test("catalog no longer contains manual what-if, price shocks or hypothetical trading",()=>{
 for(const phrase of["Ребаланс","Лаборатория","Стресс-тест","Сценарии и исследование","WHAT IF","Фьючерсы"])assert.doesNotMatch(toolbox,new RegExp(phrase,"i"));
});
test("toolbar is a simple two-button layout instead of a nested pop-up catalog",()=>{
 assert.match(toolbox,/<nav className="v3-factual-tools__nav"/);
 assert.doesNotMatch(toolbox,/catalogOpen|setCatalogOpen|qvanix-tool-catalog|glossaryOpen|setGlossaryOpen/);
});
test("report buttons declare exact selected state and remain native buttons",()=>{
 assert.match(toolbox,/aria-pressed=\{tool===item\.id\}/);
 assert.match(toolbox,/onClick=\{\(\)=>selectTool\(item\.id\)\}/);
});
test("reports preserve client-side work across switching without duplicate panels",()=>{
 assert.match(toolbox,/new Set\(\[readStoredTool\(\)\]\)/);
 assert.match(toolbox,/visited\.has\(item\.id\)/);
 assert.match(toolbox,/hidden=\{tool!==item\.id\}/);
 assert.match(toolbox,/aria-hidden=\{tool!==item\.id\}/);
});
test("report data remains genuinely lazy-loaded and does not slow the first screen",()=>{
 assert.match(toolbox,/V3BondIntelligenceWorkspace=lazy/);
 assert.match(toolbox,/V3PortfolioReportDepth=lazy/);
 assert.match(toolbox,/<Suspense fallback=/);
});
test("report header identifies actual evidence rather than promising financial advice",()=>{
 assert.match(toolbox,/СОСТАВ И ДОКУМЕНТЫ/);
 assert.match(toolbox,/Облигации и отчёт/);
 assert.match(toolbox,/ТОЛЬКО ПРОСМОТР/);
});
test("Core exposes reports as a visible destination, not tools or simulations",()=>{
 assert.match(core,/onClick=\{\(\)=>selectHub\("tools"\)\}>Отчёты<\/button>/);
 assert.match(core,/hub==="market"\?"Рынок":"Отчёты"/);
 assert.match(core,/облигации · состав · результаты/);
 assert.doesNotMatch(core,/onClick=\{\(\)=>selectHub\("tools"\)\}>Инструменты/);
});
test("Core opens the same reports implementation without reintroducing a second catalog",()=>{
 assert.match(core,/<V3AnalysisToolbox positions=\{positions\}\/>/);
 assert.doesNotMatch(core,/<V3AnalysisToolbox positions=\{positions\} includeMarket=/);
});
test("saved compact report button chooses the right factual tool on full-mode navigation",()=>{
 assert.match(core,/sessionStorage\.setItem\("qvanix-pro-tools-v100",sub==="Отчёт"\?"report":"bonds"\)/);
 assert.match(core,/setDensity\("full"\)/);
});
test("compact report landing has two distinct useful links",()=>{
 assert.match(compact,/onOpen\("tools","Облигации"\)/);
 assert.match(compact,/onOpen\("tools","Отчёт"\)/);
 assert.match(compact,/сроки и купоны/);
 assert.match(compact,/структура и результат/);
});
test("compact risk no longer sends users to simulation instead of holding PnL",()=>{
 assert.doesNotMatch(compact,/onOpen\("analytics","Сценарии"\)/);
 assert.match(compact,/onOpen\("analytics","P\/L позиций"\)/);
 assert.match(core,/sub==="P\/L позиций"\)setAnalyticsMode\("breadth"\)/);
});
test("compact positions no longer contain two buttons opening the same asset list",()=>{
 assert.equal((compact.match(/onOpen\("portfolio","Активы"\)/g)||[]).length,1);
 assert.match(compact,/onOpen\("portfolio","Структура"\)/);
});
test("full portfolio and market sections remain reachable without reporting tab",()=>{
 assert.match(core,/selectHub\("analytics"\)/);
 assert.match(core,/selectHub\("market"\)/);
 assert.match(core,/Выплаты/);
 assert.match(core,/Доходность/);
});
test("secondary V3 shells use real report label rather than a speculative laboratory",()=>{
 assert.match(analysis,/label:"Отчёты",description:/);
 assert.match(analysis,/Облигации и состав/);
 assert.match(analysis,/ДАЛЬШЕ · ОТЧЁТЫ/);
 assert.doesNotMatch(analysis,/<strong>Лаборатория<\/strong>/);
});
test("report navigation is usable with touch and keyboard, including narrow phones",()=>{
 assert.match(style,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(style,/min-height:56px/);
 assert.match(style,/button:focus-visible/);
 assert.match(style,/@media\(max-width:420px\)/);
 assert.match(style,/touch-action:manipulation/);
});
test("mobile report cards use evidence descriptions rather than unsupported predictions",()=>{
 assert.match(toolbox,/FACTUAL_TOOLS.find/);
 const content=FACTUAL_TOOLS.map(x=>x.hero).join(" ");
 assert.match(content,/Фактический состав облигаций/);
 assert.match(content,/Текущие позиции/);
 assert.doesNotMatch(content,/возможная доходность|прогноз на год|будущая цена/i);
});
test("data integrity rules and interactive order execution are untouched",()=>{
 for(const source of[toolbox,compact,core,analysis])assert.doesNotMatch(source,/submitOrder|placeOrder|sendOrder/);
 assert.match(toolbox,/V3PortfolioReportDepth/);
 assert.match(toolbox,/V3BondIntelligenceWorkspace/);
});
