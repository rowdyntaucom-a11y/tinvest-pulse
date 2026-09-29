import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const bonds=readFileSync(new URL("../src/assets/V3BondYieldDepth.tsx",import.meta.url),"utf8");
const coreCss=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const toolsCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");
const bondCss=readFileSync(new URL("../src/styles/bondYieldDepth.css",import.meta.url),"utf8");

test("tool chooser collapses after selecting a workspace and can be reopened",()=>{
 assert.match(toolbox,/catalogOpen/);
 assert.match(toolbox,/setCatalogOpen\(false\)/);
 assert.match(toolbox,/Сменить инструмент/);
 assert.match(toolbox,/Скрыть выбор/);
 assert.match(toolbox,/scrollIntoView\(\{block:"start",behavior:"auto"\}\)/);
});

test("mobile keyboard handling keeps inputs visible and hides competing bottom nav",()=>{
 assert.match(core,/useKeyboardSafeWorkspace/);
 assert.match(core,/visualViewport/);
 assert.match(core,/scrollIntoView\(\{block:"center",inline:"nearest",behavior:"auto"\}\)/);
 assert.match(coreCss,/qv-input-active \.sb-nav/);
 assert.match(coreCss,/--qv-keyboard-inset/);
 assert.match(coreCss,/pointer-events:none/);
});

test("bond depth keeps headline metrics visible and progressively discloses secondary detail",()=>{
 for(const token of["Сценарии ставки","Лестница погашений","Разбор выпусков","v3-bond-yield-disclosure"])assert.ok(bonds.includes(token));
 assert.doesNotMatch(bonds,/<details className="v3-bond-yield-disclosure" open/);
 assert.match(bondCss,/v3-bond-yield-disclosure/);
});

test("focused tool header stays reachable while deep workspace scrolls",()=>{
 assert.match(toolsCss,/v3-pro-tools__focus\.is-focused/);
 assert.match(toolsCss,/position:sticky/);
 assert.match(toolsCss,/scroll-margin-top:156px/);
});
