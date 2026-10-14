import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";
import{FACTUAL_TOOLS,resolveFactualToolId}from"../src/analysis/factualToolsV252.ts";

const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const workspaceCss=readFileSync(new URL("../src/styles/proToolsWorkspaceV100.css",import.meta.url),"utf8");
const futures=readFileSync(new URL("../src/terminal/V3FuturesScenario.tsx",import.meta.url),"utf8");

test("Samurai keeps one factual reporting entry rather than permanently repeating tools",()=>{
 assert.match(analysis,/sam-analysis-tools/);
 for(const token of["V3AnalysisToolbox","ДАЛЬШЕ · ОТЧЁТЫ"])assert.match(analysis,new RegExp(token));
 for(const old of["sam-analysis-rebalance","sam-analysis-lab","sam-analysis-discovery","sam-analysis-screener"])assert.doesNotMatch(analysis,new RegExp('id="'+old+'"'));
});

test("reporting catalog contains exactly two useful evidence-based destinations",()=>{
 assert.deepEqual(FACTUAL_TOOLS.map(x=>x.id),["bonds","report"]);
 assert.ok(FACTUAL_TOOLS.every(x=>x.hero.length>30));
 for(const token of["Облигации и отчёт","ТОЛЬКО ПРОСМОТР","V3PortfolioReportDepth","V3BondIntelligenceWorkspace"])assert.match(toolbox,new RegExp(token));
});

test("simulation modules are not mounted or dynamically imported in reporting UI",()=>{
 for(const token of["V3RebalanceWorkspace","V3PortfolioLab","V3FuturesScenario","V3MarketIntelligenceWorkspace","Сценарии и исследование","v3-pro-tools__glossary"])assert.doesNotMatch(toolbox,new RegExp(token));
});

test("futures simulation remains isolated from visible portfolio reports and never trades",()=>{
 for(const token of["DERIVATIVES INTELLIGENCE V2","Stress matrix","LONG","SHORT","SPEC COMPLETE","не является ценой ликвидации"])assert.match(futures,new RegExp(token));
 assert.doesNotMatch(futures,/отправить заявку|купить контракт|продать контракт/i);
 assert.doesNotMatch(toolbox,/V3FuturesScenario=lazy/);
});

test("old scenario tool selection is safely migrated to bonds",()=>{
 for(const id of["rebalance","lab","market","futures","WHAT IF",null,undefined,42])assert.equal(resolveFactualToolId(id),"bonds");
 assert.equal(resolveFactualToolId("report"),"report");
 assert.equal(resolveFactualToolId("bonds"),"bonds");
});

test("returning to reports remembers only valid selection",()=>{
 assert.match(toolbox,/FACTUAL_TOOL_STORAGE_KEY/);
 assert.match(toolbox,/sessionStorage\.getItem/);
 assert.match(toolbox,/sessionStorage\.setItem/);
 assert.match(toolbox,/resolveFactualToolId\(sessionStorage\.getItem/);
 assert.match(toolbox,/writeStoredTool\(id\)/);
});

test("one-tap report buttons are touch and keyboard accessible",()=>{
 assert.match(toolbox,/v3-factual-tools__nav/);
 assert.match(toolbox,/aria-pressed=\{tool===item\.id\}/);
 assert.match(workspaceCss,/\.v3-factual-tools__nav button:focus-visible/);
 assert.match(workspaceCss,/min-height:56px/);
 assert.match(workspaceCss,/@media\(max-width:420px\)/);
});

test("both factual modules remain lazy and visited views retain state",()=>{
 for(const token of["V3BondIntelligenceWorkspace=lazy","V3PortfolioReportDepth=lazy","visited,setVisited","next.add(id)","FACTUAL_TOOLS.filter(item=>visited.has(item.id))","hidden={tool!==item.id}","aria-hidden={tool!==item.id}"])assert.ok(toolbox.includes(token));
 assert.match(workspaceCss,/stage-pane\[hidden\]\{display:none\}/);
});

test("mobile reports never lock the user into a scrollable tool-catalog overlay",()=>{
 assert.doesNotMatch(toolbox,/setCatalogOpen|catalogOpen|Сменить инструмент/);
 assert.match(workspaceCss,/\.v3-factual-tools__nav/);
 assert.match(workspaceCss,/@media\(max-width:420px\)/);
 assert.match(workspaceCss,/@media\(max-width:520px\)/);
});
