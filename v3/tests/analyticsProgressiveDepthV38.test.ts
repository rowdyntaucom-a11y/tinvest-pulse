import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const ui=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("deep analytics exposes one mobile section selector with full human labels",()=>{
 assert.match(ui,/select value=\{section\}/);
 assert.match(ui,/Выбрать раздел глубокой аналитики/);
 assert.match(ui,/Сравнение с IMOEX/);
 assert.match(ui,/Просадка · хвостовые риски · связи активов/);
 assert.doesNotMatch(ui,/DD · VaR\/CVaR · корреляции/);
 assert.doesNotMatch(ui,/beta · TE · excess/);
});

test("each professional analytics section has a quick answer before depth",()=>{
 assert.match(ui,/core-analytics-depth__decision/);
 assert.match(ui,/ГЛАВНЫЙ ОТВЕТ/);
 assert.match(ui,/TWR \$\{signedPct/);
 assert.match(ui,/Max Drawdown/);
 assert.match(ui,/Относительно IMOEX/);
});

test("mobile hides permanent depth pills and keeps desktop navigation",()=>{
 assert.match(css,/core-analytics-depth__nav\{display:none\}/);
 assert.match(css,/core-analytics-depth__route\{display:grid/);
 assert.match(css,/min-height:44px/);
 assert.match(css,/v38 analytics progressive depth/);
});
