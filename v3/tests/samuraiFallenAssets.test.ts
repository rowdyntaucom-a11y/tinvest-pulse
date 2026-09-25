import assert from"node:assert/strict";import test from"node:test";import{readFileSync}from"node:fs";
const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/analysis/V3FallenAssetsDiscovery.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiFallenAssets.css",import.meta.url),"utf8");
test("Samurai exposes technical discovery after Portfolio Lab",()=>{assert.match(analysis,/sam-analysis-discovery/);assert.match(analysis,/Просадки/);assert.match(atlas,/Просадки/)});
test("discovery is explicitly descriptive and not a buy signal",()=>{assert.match(ui,/не является сигналом к покупке/);assert.match(ui,/не выдаёт команды купить\/продать/);assert.match(ui,/От максимума/);assert.match(ui,/К SMA50/);assert.match(ui,/К SMA200/)});
test("discovery has 3M 6M 12M windows and mobile treatment",()=>{assert.match(ui,/\[3,6,12\]/);assert.match(css,/@media\(max-width:430px\)/)});
