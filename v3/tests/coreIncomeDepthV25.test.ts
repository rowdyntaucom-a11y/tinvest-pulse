import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const ui=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const income=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8");
const root=readFileSync(new URL("../src/core/CoreRoot.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("light Core promotes the canonical income depth without replacing quick payout views",()=>{
 assert.match(ui,/V3IncomeDepth=lazy/);
 assert.match(ui,/\[\"overview\",\"Обзор\"\],\[\"calendar\",\"Календарь\"\],\[\"depth\",\"Глубина\"\]/);
 assert.match(ui,/V3IncomeDepth positions=\{positions\} onOpenAsset=\{openAsset\}/);
 assert.match(ui,/CorePayoutCalendar/);
});

test("income depth exposes fact calendar sources bonds and market discovery",()=>{
 for(const token of["Календарь","Факт","Источники","Рынок","BOND CASHFLOW · 12М","V3DividendDiscovery"])assert.match(income,new RegExp(token));
 assert.match(income,/type View="calendar"\|"history"\|"sources"\|"market"/);
 assert.match(income,/view===\"market\"/);
 assert.match(income,/точного FIGI/);
 assert.match(income,/fail-closed/);
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
