import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");

test("professional analytics exits the sticky quick-layer stack on mobile",()=>{
 assert.match(core,/sb-analytics"\+\(mode==="depth"\?" is-depth":""\)/);
 assert.match(core,/sb-depth-exit/);
 assert.match(core,/← Быстрая аналитика/);
 assert.match(core,/onMode\("risk"\)/);
 assert.match(css,/\.sb-analytics\.is-depth \.sb-context-help\{display:none\}/);
 assert.match(css,/\.sb-depth-exit\{position:sticky/);
});

test("income overview uses existing verified values for deterministic context",()=>{
 assert.match(core,/incomeFlowMonths=/);
 assert.match(core,/incomeAnnualShare=/);
 assert.match(core,/КОНТЕКСТ ПОТОКА/);
 assert.match(core,/Получено \/ средний месяц/);
 assert.match(core,/12М эквивалент \/ капитал/);
 assert.match(core,/не доходность и не прогноз будущих выплат/);
 assert.match(css,/sb-income-context/);
});

test("v50 adds no new market data or trading capability",()=>{
 assert.doesNotMatch(core,/submitOrder|placeOrder|createOrder|sendOrder/i);
 assert.doesNotMatch(core,/dailyReturn|previousClose|VWAP/);
});
