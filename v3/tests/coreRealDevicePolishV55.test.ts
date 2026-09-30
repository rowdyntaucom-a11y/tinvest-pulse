import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");

test("mobile header uses a compact semantic live status",()=>{
 assert.match(core,/className={"sb-data-status "/);
 assert.match(core,/connection\.source==="portfolio"\?"BASE":"LIVE"/);
 assert.match(core,/aria-label=\{trusted\?"Обновить подтверждённые данные"/);
 assert.match(css,/\.sb-data-status/);
 assert.match(css,/\.sb-data-status\.live/);
});

test("phone segmented controls do not expose half-visible tabs",()=>{
 assert.match(css,/\.sb-switch\{width:100%!important/);
 assert.match(css,/grid-auto-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/\.v3-assets-depth__nav\{display:grid!important;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
});

test("bottom dock gets stronger touch and active-state hierarchy",()=>{
 assert.match(css,/\.sb-nav button\{min-width:0!important;min-height:58px!important/);
 assert.match(css,/\.sb-nav button\.active:after/);
});
