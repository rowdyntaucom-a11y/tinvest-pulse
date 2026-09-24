import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const mobile=readFileSync(new URL("../src/styles/mobilePerformance.css",import.meta.url),"utf8");

test("Cosmos lazy workspace transit preserves the world instead of flashing black",()=>{
 const marker=mobile.lastIndexOf("Cosmos Transit Continuity — recording 1000031542.mp4");
 assert.ok(marker>=0);
 const css=mobile.slice(marker);
 assert.match(css,/\.v3-workspace-loading\[data-shell="carbon"\]/);
 assert.match(css,/cosmos-mixc-master\.webp/);
 assert.match(css,/min-height:calc\(100svh - 50px\)!important/);
 assert.match(css,/\.v3-workspace-loading__panel\{[^]*bottom:90px!important/);
 assert.match(css,/background:linear-gradient\(100deg,rgba\(3,12,34/);
});
