import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const ui=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
for(const token of[
"V3HistoryCoverageV203","V3CapitalBridgeV204","V3BenchmarkHitRateV205","V3BenchmarkCaptureV206",
"V3ReturnQuartilesV207","V3RollingRangeV208","V3ValueHighWaterV209","V3HistoryTrustV210"
])assert.ok(ui.includes(token),token);
for(const name of["historyCoverageV203","capitalBridgeV204","benchmarkHitRateV205","benchmarkCaptureV206","returnQuartilesV207","rollingRangeV208","valueHighWaterV209","historyTrustV210"]){
 const source=readFileSync(new URL("../src/analysis/"+name+".ts",import.meta.url),"utf8");
 assert.doesNotMatch(source,/Math\.random|\bbuy signal\b|\bsell signal\b|рекоменд(овать|ация)/i,name);
}
assert.match(ui,/Пополнения не выдаются за доходность/);
assert.match(ui,/filterHistoryWindow\(history,window\)/);
console.log("analytics performance depth v203-v210 integration tests passed");