import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const ui=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/incomeDepth.css",import.meta.url),"utf8");

test("income depth opens on a concise summary instead of the deep calendar",()=>{
 assert.match(ui,/type View="overview"\|"calendar"\|"history"\|"sources"\|"trust"\|"market"/);
 assert.match(ui,/useState<View>\("overview"\)/);
 assert.match(ui,/label:"Сводка"/);
 assert.match(ui,/v3-income-overview/);
});

test("summary keeps FACT and confirmed future horizons visibly separate",()=>{
 assert.match(ui,/Получено фактически/);
 assert.match(ui,/Ближайшая подтверждённая/);
 assert.match(ui,/workspaceSummary\.buckets/);
 assert.match(ui,/Будущие суммы остаются gross и не складываются с FACT net/);
});

test("deep income modes remain one tap away",()=>{
 for(const mode of["calendar","history","sources","trust"])assert.match(ui,new RegExp(`setView\\("${mode}"\\)`));
 assert.match(css,/v86 · mobile-first progressive disclosure for Income/);
 assert.match(css,/@media\(max-width:430px\)[\s\S]*v3-income-overview-actions/);
});
