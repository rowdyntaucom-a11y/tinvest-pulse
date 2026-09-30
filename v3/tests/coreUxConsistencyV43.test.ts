import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const analytics=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const toolsCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");
const market=readFileSync(new URL("../src/analysis/V3MarketIntelligenceWorkspace.tsx",import.meta.url),"utf8");
const marketCss=readFileSync(new URL("../src/styles/marketIntelligenceWorkspace.css",import.meta.url),"utf8");
const assets=readFileSync(new URL("../src/assets/V3AssetsDepth.tsx",import.meta.url),"utf8");
const bonds=readFileSync(new URL("../src/assets/V3BondYieldDepth.tsx",import.meta.url),"utf8");
const fundamentals=readFileSync(new URL("../src/assets/V3EquityFundamentalsDepth.tsx",import.meta.url),"utf8");
const report=readFileSync(new URL("../src/report/V3PortfolioReportDepth.tsx",import.meta.url),"utf8");
const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const coreCss=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const terms=readFileSync(new URL("../src/i18n/financialTerms.ts",import.meta.url),"utf8");

test("analytics mobile section chooser is a QVANIX bottom sheet, not a native select",()=>{
 assert.doesNotMatch(analytics,/<select/);
 assert.match(analytics,/aria-haspopup="dialog"/);
 assert.match(analytics,/Выберите срез/);
 assert.match(analytics,/role="dialog"/);
 assert.match(analytics,/Escape/);
 assert.match(toolsCss,/core-analytics-depth__picker-backdrop/);
 assert.match(toolsCss,/align-items:flex-end/);
});

test("audit terminology is localized consistently",()=>{
 for(const token of["government","financial","dirtyValue","verifiedFundamentals","usableMetrics"])assert.ok(terms.includes(token));
 assert.doesNotMatch(bonds,/dirty value|BOND INTELLIGENCE|STALE/);
 assert.doesNotMatch(fundamentals,/EQUITY INTELLIGENCE|usable metrics|verified fundamentals|NO DATA/);
 assert.doesNotMatch(report,/Broker P\/L|Cost basis|REPORT/);
 assert.match(assets,/localizeFinancialLabel\(row\.label\)/);
});

test("market retry copy is single and automatic",()=>{
 assert.match(market,/Не удалось получить данные рынка — пробуем ещё раз автоматически/);
 assert.doesNotMatch(market,/QVANIX попробует ещё раз/);
 assert.doesNotMatch(market,/QVANIX повторит запрос автоматически/);
});

test("short structure and market states do not reserve dead viewport height",()=>{
 assert.match(core,/sb-portfolio-structure__next/);
 assert.match(core,/Проф\. анализ →/);
 assert.match(coreCss,/\.sb-portfolio-structure\{min-height:0!important;height:auto!important\}/);
 assert.match(toolsCss,/\.sb \.v3-market-pulse__gate\{min-height:0/);
 assert.match(marketCss,/\.v3-market-pulse__gate\{min-height:0/);
});
