import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";
import{buildIncomeWorkspaceSummary}from"../src/income/incomeWorkspaceSummary.ts";

const ui=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const income=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8");
const root=readFileSync(new URL("../src/core/CoreRoot.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");
const incomeCss=readFileSync(new URL("../src/styles/incomeDepth.css",import.meta.url),"utf8");

test("light Core promotes the canonical income depth without replacing quick payout views",()=>{
 assert.match(ui,/V3IncomeDepth=lazy/);
 assert.match(ui,/\[\"overview\",\"Обзор\"\],\[\"calendar\",\"Календарь\"\],\[\"depth\",\"Глубина\"\]/);
 assert.match(ui,/V3IncomeDepth positions=\{positions\} onOpenAsset=\{openAsset\}/);
 assert.match(ui,/CorePayoutCalendar/);
});

test("income depth exposes concise overview plus fact calendar sources data trust bonds and market discovery",()=>{
 for(const token of["Сводка","Календарь","Факт","Источники","Данные","Рынок","КУПОННЫЙ ПОТОК · 12М","V3IncomeDataTrust","V3DividendDiscovery"])assert.match(income,new RegExp(token));
 assert.match(income,/type View="overview"\|"calendar"\|"history"\|"sources"\|"trust"\|"market"/);
 assert.match(income,/useState<View>\("overview"\)/);
 assert.match(income,/v3-income-overview/);
 assert.match(income,/view==="trust"/);
 assert.match(income,/view==="market"/);
 assert.match(income,/точного FIGI/);
 assert.match(income,/fail-closed/);
});

test("mobile summary is deterministic and keeps FACT separate from confirmed future HIGH",()=>{
 const event=(date:string,gross:number,confidence="HIGH",status="SCHEDULED")=>({kind:"COUPON",ticker:"T",name:"T",date,gross,confidence,status}) as any;
 const summary=buildIncomeWorkspaceSummary([event("2026-10-10",100),event("2026-12-01",200),event("2027-06-01",300),event("2026-10-05",999,"LOW"),event("2026-10-07",555,"HIGH","FACT")],"2026-10-02T12:00:00Z");
 assert.equal(summary.confirmedGross,600);
 assert.equal(summary.confirmedCount,3);
 assert.equal(summary.nextDays,8);
 assert.deepEqual(summary.buckets.map(row=>[row.days,row.gross,row.count]),[[30,100,1],[90,300,2],[365,600,3]]);
 assert.match(income,/Будущие суммы остаются gross и не складываются с FACT net/);
 assert.match(incomeCss,/v86 · mobile-first progressive disclosure for Income/);
});

test("full income depth is prefetched only after trusted first paint",()=>{
 assert.match(root,/import\(\"\.\.\/income\/V3IncomeDepth\"\)/);
 assert.match(root,/if\(!trusted\)return/);
});

test("light income depth removes legacy dark material and mobile microtype",()=>{
 assert.match(css,/v3-income-depth[^}]*background:#fff/);
 assert.match(css,/v3-dividend-discovery[^}]*background:#fff/);
 assert.match(css,/v3-income-event-row small[^}]*font-size:9px/);
 assert.match(css,/v3-income-history-bars small[^}]*font-size:9px/);
 assert.match(css,/v3-dividend-discovery__row small[^}]*font-size:9px/);
});
