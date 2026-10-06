import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/proTools.css",import.meta.url),"utf8");
const workspaceCss=readFileSync(new URL("../src/styles/proToolsWorkspaceV100.css",import.meta.url),"utf8");
const futures=readFileSync(new URL("../src/terminal/V3FuturesScenario.tsx",import.meta.url),"utf8");

test("Samurai analysis exposes one professional toolbox entry instead of four permanent chapters",()=>{
 assert.match(analysis,/sam-analysis-tools/);
 for(const token of["V3AnalysisToolbox","ДАЛЬШЕ · ИНСТРУМЕНТЫ"])assert.match(analysis,new RegExp(token));
 assert.doesNotMatch(analysis,/id="sam-analysis-rebalance"/);
 assert.doesNotMatch(analysis,/id="sam-analysis-lab"/);
 assert.doesNotMatch(analysis,/id="sam-analysis-discovery"/);
 assert.doesNotMatch(analysis,/id="sam-analysis-screener"/);
});

test("toolbox contains current professional modules and read-only futures scenarios",()=>{
 for(const token of["Ребаланс","Лаборатория","Рынок","Фьючерсы","Отчёт","ТОЛЬКО ЧТЕНИЕ","V3PortfolioReportDepth"])assert.match(toolbox,new RegExp(token));
});

test("toolbox groups modules by user task instead of one flat rail",()=>{
 assert.match(toolbox,/Управление портфелем/);
 assert.match(toolbox,/Сценарии и исследование/);
 assert.match(toolbox,/v3-pro-tools__focus/);
 assert.match(toolbox,/v3-pro-tools__groups/);
});

test("Derivatives Intelligence V2 exposes directional stress without trading semantics",()=>{
 for(const token of["DERIVATIVES INTELLIGENCE V2","Stress matrix","LONG","SHORT","SPEC COMPLETE","не является ценой ликвидации"])assert.match(futures,new RegExp(token));
 assert.doesNotMatch(futures,/отправить заявку|купить контракт|продать контракт/i);
 assert.match(css,/v3-futures-stress/);
 assert.match(css,/@media\(max-width:430px\)/);
});

test("light Core can hide duplicate market entry while keeping shared toolbox reusable",()=>{assert.match(toolbox,/includeMarket=true/);assert.match(toolbox,/TOOLS\.filter\(item=>item\.id!=="market"\)/);assert.match(toolbox,/tools\.some\(item=>item\.id===tool\)/)});

test("v100 restores the selected professional tool for the current session",()=>{assert.match(toolbox,/qvanix-pro-tools-v100/);assert.match(toolbox,/sessionStorage\.getItem/);assert.match(toolbox,/sessionStorage\.setItem/);assert.match(toolbox,/readStoredTool\(includeMarket\)/);assert.match(toolbox,/writeStoredTool\(id\)/)});

test("v100 lazily opens every heavy tool including futures",()=>{for(const token of["V3RebalanceWorkspace=lazy","V3PortfolioLab=lazy","V3MarketIntelligenceWorkspace=lazy","V3PortfolioReportDepth=lazy","V3FuturesScenario=lazy"])assert.match(toolbox,new RegExp(token));assert.doesNotMatch(toolbox,/import\{V3FuturesScenario\}from/)});

test("v100 keeps visited tool state mounted while hiding inactive stages",()=>{assert.match(toolbox,/visited,setVisited/);assert.match(toolbox,/next\.add\(id\)/);assert.match(toolbox,/tools\.filter\(item=>visited\.has\(item\.id\)\)\.map/);assert.match(toolbox,/hidden=\{tool!==item\.id\}/);assert.match(toolbox,/aria-hidden=\{tool!==item\.id\}/);assert.match(workspaceCss,/stage-pane\[hidden\]\{display:none\}/)});

test("v100 mobile tool focus stays oriented and heavy panes defer paint",()=>{assert.match(workspaceCss,/\.v3-pro-tools__focus\{position:sticky/);assert.match(workspaceCss,/content-visibility:auto/);assert.match(workspaceCss,/contain-intrinsic-size/);assert.match(workspaceCss,/overscroll-behavior:contain/);assert.match(workspaceCss,/@media\(max-width:520px\)/)});
