import test from"node:test";import assert from"node:assert/strict";import{readFileSync}from"node:fs";
import{shouldShowCoreScrollTop}from"../src/core/coreNavigationMemoryModel.ts";
import{coreIncomeScrollStorageKey,normalizeCoreIncomeScroll}from"../src/core/coreIncomeWorkspaceV93.ts";
import{coreResultScrollStorageKey,normalizeCoreResultScroll}from"../src/core/coreResultWorkspaceV94.ts";

const nav=readFileSync(new URL("../src/core/CoreNavigationMemory.tsx",import.meta.url),"utf8");
const navCss=readFileSync(new URL("../src/core/coreNavigationMemoryV91.css",import.meta.url),"utf8");
const recordingCss=readFileSync(new URL("../src/core/coreRecording20261007.css",import.meta.url),"utf8");
const root=readFileSync(new URL("../src/core/CoreRoot.tsx",import.meta.url),"utf8");
const payout=readFileSync(new URL("../src/core/CorePayoutCalendar.tsx",import.meta.url),"utf8");
const payoutApi=readFileSync(new URL("../../v2/src/lib/payoutsApi.ts",import.meta.url),"utf8");
const incomeDepth=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8");
const incomeRouter=readFileSync(new URL("../src/core/CoreIncomeWorkspaceRouterV93.tsx",import.meta.url),"utf8");
const resultRouter=readFileSync(new URL("../src/core/CoreResultWorkspaceRouterV94.tsx",import.meta.url),"utf8");
const snowball=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");

test("touch devices do not render a second floating scroll-top control",()=>{
 assert.equal(shouldShowCoreScrollTop(1000,false,false),true);
 assert.equal(shouldShowCoreScrollTop(1000,false,true),false);
 assert.match(nav,/pointer: coarse/);
 assert.match(nav,/requestAnimationFrame/);
 assert.match(navCss,/@media\(pointer:coarse\).*sb-scroll-top-v91\{display:none!important\}/s);
});

test("recording pass keeps mobile task controls readable and away from bottom nav",()=>{
 assert.match(recordingCss,/padding-bottom:calc\(94px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(recordingCss,/font-size:9px!important/);
 assert.match(recordingCss,/scroll-margin-top:106px/);
 assert.match(recordingCss,/min-height:76px!important/);
 assert.match(recordingCss,/\.v3-section-sheet\{[\s\S]*backdrop-filter:none!important/);
 assert.match(recordingCss,/overscroll-behavior:contain/);
});

test("warm payout calendar is reused during compact/full remounts",()=>{
 assert.match(payoutApi,/export function peekPayoutCalendarCache/);
 assert.match(payout,/const warm=peekPayoutCalendarCache\(\)/);
 assert.match(payout,/setData\(cached\);setLoading\(false\)/);
 assert.match(incomeDepth,/const warm=peekPayoutCalendarCache\(\)/);
 assert.match(incomeDepth,/if\(cached\)\{setCalendar\(cached\);setLoading\(false\)\}/);
});

test("deep Core workspaces are prefetched before a fast mobile tab change",()=>{
 for(const module of["V3AnalysisToolbox","V3MarketIntelligenceWorkspace","V3AssetsDepth","CoreAnalyticsDepth","V3IncomeDepth","V3OperationsDepth","V3PortfolioReportDepth"]) assert.ok(root.includes(module),module);
 assert.match(root,/\}\,500\);/);
});

test("income and result subviews remember reading position and support keyboard task navigation",()=>{
 assert.equal(coreIncomeScrollStorageKey("events"),"qvanix-core-income-scroll-v93:events");
 assert.equal(coreResultScrollStorageKey("period"),"qvanix-core-result-scroll-v94:period");
 assert.equal(normalizeCoreIncomeScroll("812.4"),812);
 assert.equal(normalizeCoreResultScroll(-2),0);
 for(const source of[incomeRouter,resultRouter]){
  assert.match(source,/writeScroll\(mode,window\.scrollY\)/);
  assert.match(source,/readScroll\(next\)/);
  assert.match(source,/role="tablist"/);
  assert.match(source,/role="tab"/);
  for(const key of["ArrowRight","ArrowLeft","Home","End"])assert.ok(source.includes(key),key);
 }
});

test("bottom mobile navigation exposes the active page without changing its visual structure",()=>{
 assert.match(snowball,/aria-label="Основные разделы Core"/);
 assert.match(snowball,/aria-current=\{tab===id\?"page":undefined\}/);
 assert.match(snowball,/<i aria-hidden="true">\{icon\}<\/i>/);
});
console.log("core recording 2026-10-07: ok");
