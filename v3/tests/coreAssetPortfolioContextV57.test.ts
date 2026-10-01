import test from"node:test";import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
test("asset detail compares a position only with the confirmed portfolio snapshot",()=>{assert.match(core,/КОНТЕКСТ ПОРТФЕЛЯ/);assert.match(core,/ranked=\[\.\.\.positions\]\.sort/);assert.match(core,/grossPnl=positions\.reduce/);assert.match(core,/Они не являются рыночным рейтингом бумаги/);});
test("asset context supports direct drill-down into neighboring holdings",()=>{assert.match(core,/onOpenAsset\(row\)/);assert.match(core,/Крупнейшие соседние позиции/);assert.match(core,/positions=\{positions\} onOpenAsset=\{openAsset\}/);});
test("portfolio context has dedicated responsive hierarchy",()=>{assert.match(css,/v57 asset portfolio context/);assert.match(css,/sb-asset-context__metrics/);assert.match(css,/grid-template-columns:1fr 1fr!important/);});
