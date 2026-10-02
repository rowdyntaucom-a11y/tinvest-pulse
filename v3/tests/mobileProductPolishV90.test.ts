import assert from"node:assert/strict";import test from"node:test";import{readFileSync}from"node:fs";
const core=readFileSync(new URL("../src/core/CoreWorkspace.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/mobileProductPolishV90.css",import.meta.url),"utf8");
const screener=readFileSync(new URL("../src/analysis/V3MarketScreener.tsx",import.meta.url),"utf8");
const tax=readFileSync(new URL("../src/income/actualTaxLedger.ts",import.meta.url),"utf8");

test("v90 polish is registered in Core only",()=>{
 assert.ok(core.includes('import"./mobileProductPolishV90.css"'));
 assert.match(css,/\.sb \.sb-top/);
 assert.match(css,/height:46px/);
});

test("compact payout overview keeps accounting diagnostics out of the primary path",()=>{
 assert.match(css,/qpay\.qpay-compact \.qpay-tax--compact/);
 assert.match(css,/qpay\.qpay-compact \.qpay-continuity--compact/);
 assert.match(css,/display:none!important/);
 assert.match(css,/v3-income-history-bars/);
 assert.match(css,/data-observation="partial"/);
});

test("market screener shows a descriptive snapshot before filters",()=>{
 assert.match(screener,/sam-screener__snapshot/);
 assert.match(screener,/Короткий срез перед фильтрами/);
 assert.match(screener,/Рост \/ падение/);
 assert.match(screener,/Медиана дня/);
 assert.match(screener,/Оборот среза/);
 assert.match(screener,/не является оценкой направления рынка или прогнозом/);
});

test("tax reconciliation fails closed when gross evidence is incomplete",()=>{
 assert.match(tax,/reconciliationAvailable:boolean/);
 assert.match(tax,/grossCoverage:number\|null/);
 assert.match(tax,/grossEvents===items\.length/);
 assert.match(tax,/reconciliationAvailable\?gross-net-tax:null/);
});
