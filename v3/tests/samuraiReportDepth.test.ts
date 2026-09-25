import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const assets=readFileSync(new URL("../src/assets/V3Assets.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/report/V3PortfolioReportDepth.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiReportDepth.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

test("Samurai adds explicit Report, Categories and Currencies chapters",()=>{
 for(const id of["sam-assets-report","sam-assets-categories","sam-assets-currencies"]) assert.ok(assets.includes(id));
 assert.match(ui,/08 · REPORT/);
 assert.match(ui,/09 · КАТЕГОРИИ/);
 assert.match(ui,/10 · ВАЛЮТЫ/);
});

test("report is mounted after operations only for the Samurai reference shell",()=>{
 assert.match(assets,/shell==="samurai"&&allowAssetWorkspace&&<Suspense[\s\S]*?<V3PortfolioReportDepth positions=\{base\}/);
});

test("fail-closed Atlas advertises the new breadth without values",()=>{
 assert.match(atlas,/Отчёт/);
 assert.match(atlas,/Категории/);
 assert.match(atlas,/Валюты/);
 assert.doesNotMatch(atlas,/\d+[\s\u00A0]*₽/);
});

test("currency method explicitly forbids guessing",()=>{
 assert.match(ui,/RUB не подставляется автоматически/);
 assert.match(ui,/не предполагает валюту/);
});

test("Samurai report styles are registered",()=>{
 assert.match(css,/sam-report-depth__row/);
 assert.ok(main.includes('import"./styles/samuraiReportDepth.css"'));
});
