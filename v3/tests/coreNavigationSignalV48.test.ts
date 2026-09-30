import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const analytics=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const income=readFileSync(new URL("../src/income/V3IncomeDepth.tsx",import.meta.url),"utf8");

test("primary return workspace is named Доходность rather than generic Результат",()=>{
 assert.match(core,/Title title="Доходность"/);
 assert.match(core,/\["result","Доходность","↗"\]/);
 assert.match(core,/>Доходность →<\/button>/);
 assert.doesNotMatch(core,/\["result","Результат","↗"\]/);
});

test("trusted recovery state is visually demoted without hiding it",()=>{
 assert.match(css,/\.sb-alert-cached\{/);
 assert.match(css,/background:#fffaf0/);
 assert.match(css,/white-space:nowrap/);
 assert.match(css,/text-overflow:ellipsis/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/\.sb-alert-cached span\{display:none\}/);
});

test("hard untrusted state keeps the full alert treatment",()=>{
 assert.match(core,/Нет подтверждённых данных/);
 assert.match(core,/Подключаем брокерские данные/);
 assert.match(css,/\.sb-alert\{/);
});


test("professional surfaces use one naming system",()=>{
 assert.match(core,/Аналитика портфеля/);
 assert.match(core,/>Портфель<\/button>/);
 assert.match(analytics,/Профессиональная аналитика/);
 assert.match(income,/ПРОФЕССИОНАЛЬНЫЙ ДОХОД/);
 assert.match(income,/КУПОННЫЙ ПОТОК · 12М/);
});
