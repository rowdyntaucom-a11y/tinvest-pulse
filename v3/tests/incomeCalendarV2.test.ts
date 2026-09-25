import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const view=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8");
const panel=readFileSync(new URL("../src/income/V3IncomeCalendarV2.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");

test("Samurai income adds forward windows and upcoming payout detail",()=>{
 assert.match(view,/sam-income-upcoming/);
 assert.match(panel,/\[3,6,12\] as IncomeForwardMonths\[\]/);
 assert.match(panel,/\{value\}М/);
 assert.match(panel,/БЛИЖАЙШИЕ ВЫПЛАТЫ/);
 assert.match(panel,/perSecurity/);
 assert.match(panel,/lastBuyDate/);
 assert.match(panel,/recordDate/);
});

test("market payout discovery remains separate from portfolio income",()=>{
 assert.match(view,/sam-income-market/);
 assert.match(panel,/Рыночный календарь/);
 assert.match(panel,/не смешивает календарь текущего портфеля/);
 assert.match(atlas,/Рынок/);
});
