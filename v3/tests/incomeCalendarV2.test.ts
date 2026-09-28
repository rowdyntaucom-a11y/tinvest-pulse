import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const view=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8");
const panel=readFileSync(new URL("../src/income/V3IncomeCalendarV2.tsx",import.meta.url),"utf8");
const discovery=readFileSync(new URL("../src/income/V3DividendDiscovery.tsx",import.meta.url),"utf8");
const discoveryApi=readFileSync(new URL("../src/income/dividendDiscoveryApi.ts",import.meta.url),"utf8");
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

test("Samurai market discovery mounts the live read-only endpoint instead of a placeholder",()=>{
 assert.match(view,/sam-income-market/);
 assert.match(view,/V3DividendDiscovery/);
 assert.match(discovery,/loadDividendDiscovery/);
 assert.match(discoveryApi,/\/api\/dividend-discovery/);
 assert.match(discoveryApi,/dividend_yield_daily_ttm/);
 assert.match(discoveryApi,/trailing_twelve_months/);
 assert.doesNotMatch(panel,/Источник рынка ещё не подключён/);
 assert.doesNotMatch(discovery,/onTrade|onOrder|submitOrder|placeOrder|brokerToken|localStorage/);
 assert.match(atlas,/Рынок/);
});
