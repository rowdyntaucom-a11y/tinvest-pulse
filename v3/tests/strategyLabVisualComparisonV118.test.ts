import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const lab=readFileSync(new URL("../src/analysis/V3PortfolioLab.tsx",import.meta.url),"utf8");
const compare=readFileSync(new URL("../src/analysis/V3StrategyLabComparisonV118.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/strategyLabComparisonV118.css",import.meta.url),"utf8");

test("strategy lab mounts a shared-scale comparison only after verified history is available",()=>{
 assert.match(lab,/V3StrategyLabComparisonV118/);
 assert.match(lab,/a=\{ha\} b=\{hb\} windowYears=\{windowYears\}/);
 assert.match(compare,/if\(!a\?\.available\|\|!b\?\.available/);
 assert.match(compare,/Обе линии начинаются со 100/);
 assert.match(compare,/Это сравнение прошлой модели, не прогноз/);
});

test("strategy comparison uses exact existing curves and descriptive path diagnostics",()=>{
 assert.match(compare,/chartPoints\(a\.curve,min,max\)/);
 assert.match(compare,/chartPoints\(b\.curve,min,max\)/);
 assert.match(compare,/maxDivergence\(a\.curve,b\.curve\)/);
 assert.match(compare,/leadShare\(a\.curve,b\.curve\)/);
 assert.match(compare,/crossings\(a\.curve,b\.curve\)/);
 assert.match(compare,/currentDrawdown\(a\.curve\)/);
 assert.match(compare,/Финальная разница индекса/);
 assert.match(compare,/Макс\. расхождение/);
 assert.match(compare,/Пересечения/);
 assert.match(compare,/не рейтинг/);
 assert.match(compare,/не вероятность будущего/);
});

test("comparison exposes a readable common scale with 100 baseline and date anchors",()=>{
 assert.match(compare,/baseY:min<=1&&max>=1/);
 assert.match(compare,/className="is-baseline"/);
 assert.match(compare,/middle:a\.curve\[midIndex\]/);
 assert.match(compare,/v3-strategy-compare-v118__dates/);
 assert.match(compare,/fmtDate\(model\.middle\)/);
 assert.match(css,/line\.is-baseline/);
 assert.match(css,/v3-strategy-compare-v118__dates/);
});

test("comparison is collision-free and keeps lines on a common readable scale",()=>{
 assert.match(compare,/<polyline className="is-a"/);
 assert.match(compare,/<polyline className="is-b"/);
 assert.match(compare,/viewBox="0 0 100 100"/);
 assert.doesNotMatch(compare,/<circle/);
 assert.match(css,/height:240px/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:430px\)/);
 assert.match(css,/height:205px/);
 assert.match(css,/content-visibility:auto/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("visual layer does not add trade or recommendation behavior",()=>{
 assert.doesNotMatch(compare,/placeOrder|sendOrder|brokerWrite|buySignal|sellSignal|targetPrice|targetYield/);
 assert.match(compare,/не выбирает «лучший»/);
});
