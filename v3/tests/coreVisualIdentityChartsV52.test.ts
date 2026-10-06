import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";
import{filterHistoryWindow,V3_HISTORY_WINDOWS}from"../src/history/historyLens.ts";

const server=readFileSync(new URL("../../server-core.js",import.meta.url),"utf8");
const api=readFileSync(new URL("../../v2/src/lib/portfolioApi.ts",import.meta.url),"utf8");
const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const avatar=readFileSync(new URL("../src/assets/InstrumentAvatar.tsx",import.meta.url),"utf8");
const chart=readFileSync(new URL("../src/home/V3HistorySparkline.tsx",import.meta.url),"utf8");
const chartCss=readFileSync(new URL("../src/history/historyInteraction.css",import.meta.url),"utf8");
const breadth=readFileSync(new URL("../src/core/CoreBreadthVisualIntelligenceV108.tsx",import.meta.url),"utf8");
const breadthCss=readFileSync(new URL("../src/core/coreBreadthVisualV108.css",import.meta.url),"utf8");
const command=readFileSync(new URL("../src/core/CoreCommandCenterV110.tsx",import.meta.url),"utf8");
const commandCss=readFileSync(new URL("../src/core/coreCommandCenterV110.css",import.meta.url),"utf8");

test("server enriches dashboard identity from verified T-Bank instrument metadata",()=>{
 assert.match(server,/INSTRUMENT_META_CACHE_TTL_MS = 24 \* 60 \* 60 \* 1000/);
 assert.match(server,/InstrumentsService\/ShareBy/);
 assert.match(server,/InstrumentsService\/BondBy/);
 assert.match(server,/InstrumentsService\/FutureBy/);
 assert.match(server,/brand\.logoName/);
 assert.match(server,/invest-brands\.cdn-tinkoff\.ru/);
 assert.match(server,/await enrichPositionsIdentity\(positions\)/);
 // Isolated broker fallback remains intentionally free of metadata latency.
 const fallback=server.slice(server.indexOf("app.get('/api/portfolio'"),server.indexOf("app.get('/api/version'"));
 assert.doesNotMatch(fallback,/enrichPositionsIdentity/);
});

test("frontend preserves verified brand identity and has a safe initials fallback",()=>{
 assert.match(api,/PORTFOLIO_NORMALIZATION_VERSION = '1\.6'/);
 assert.match(api,/export type InstrumentBrand/);
 assert.match(api,/brand: normaliseBrand\(row\.brand\)/);
 assert.match(avatar,/position\.brand\?\.logoUrl/);
 assert.match(avatar,/onError=\{\(\)=>setFailed\(true\)\}/);
 assert.match(core,/InstrumentAvatar/);
 assert.match(core,/sb-asset-identity/);
 assert.match(core,/AllocationDonut/);
});

test("history controls expose Snowball-parity periods including YTD and five years",()=>{
 assert.deepEqual(V3_HISTORY_WINDOWS.map(x=>x.label),["7Д","1М","3М","6М","YTD","1Г","5Л","Всё"]);
 const points=[
  {date:"2025-12-30",portfolio:100,imoex:100,value:100,invested:90},
  {date:"2026-01-02",portfolio:101,imoex:102,value:101,invested:90},
  {date:"2026-03-01",portfolio:103,imoex:101,value:103,invested:95},
 ];
 assert.deepEqual(filterHistoryWindow(points,"ytd").map(x=>x.date),["2026-01-02","2026-03-01"]);
});

test("detailed history can switch between value and rebased TWR versus IMOEX",()=>{
 assert.match(chart,/type V3HistoryChartMode="value"\|"performance"/);
 assert.match(chart,/TWR vs IMOEX/);
 assert.match(chart,/rebase\(windowPoints,"portfolio"\)/);
 assert.match(chart,/rebase\(windowPoints,"imoex"\)/);
 assert.match(chart,/денежные потоки нейтрализованы/);
 assert.match(chart,/не прогноз и не рейтинг/);
 assert.match(chartCss,/v3-history-mode/);
 assert.match(chartCss,/v3-chart-primary/);
 assert.match(chartCss,/v3-chart-secondary/);
});

test("core analytical maps use collision-free zero-centered rails instead of bubble clouds",()=>{
 assert.doesNotMatch(breadth,/<circle/);
 assert.match(breadth,/Доходность крупных позиций/);
 assert.match(breadth,/core-breadth-visual-v108__center-rail/);
 assert.match(breadthCss,/grid-template-columns:1fr 1fr/);
 assert.match(breadthCss,/49\.5% 50\.5%/);
 assert.doesNotMatch(command,/allocation-ring/);
 assert.match(command,/allocation-stack/);
 assert.match(command,/ВКЛАД В P\/L/);
 assert.match(commandCss,/core-command-center-v110__impact-axis/);
 assert.match(commandCss,/grid-template-columns:1fr 1fr/);
});
