import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const mobile=readFileSync(new URL("../src/styles/mobilePerformance.css",import.meta.url),"utf8");

test("Cosmos real-device safe-zone pass keeps functional modules on side rails",()=>{
 const marker=mobile.lastIndexOf("Cosmos Safe-Zone Instruments");
 assert.ok(marker>=0);
 const css=mobile.slice(marker);
 assert.match(css,/cos-gate__modules--assets \.cos-module--allocation[^]*left:0!important[^]*width:31%!important/);
 assert.match(css,/cos-gate__modules--assets \.cos-module--holdings[^]*right:0!important[^]*width:30%!important/);
 assert.match(css,/cos-gate__modules--analysis \.cos-module--performance[^]*left:0!important[^]*width:34%!important/);
 assert.match(css,/cos-gate__modules--analysis \.cos-module--risk[^]*right:0!important[^]*width:29%!important/);
 assert.match(css,/cos-gate__modules--income \.cos-module--cashflow[^]*left:0!important[^]*width:35%!important/);
 assert.match(css,/cos-gate__modules--income \.cos-module--calendar[^]*right:0!important[^]*width:29%!important/);
});

test("Cosmos Goal keeps a compact command surface and edge instruments",()=>{
 const marker=mobile.lastIndexOf("Cosmos Safe-Zone Instruments");
 const css=mobile.slice(marker);
 assert.match(css,/data-workspace="goal"\] \.v3-page-head[^]*width:36%!important/);
 assert.match(css,/data-workspace="goal"\] \.v3-goal-hero[^]*width:38%!important/);
 assert.match(css,/cos-goal-mission__target[^]*display:none!important/);
 assert.match(css,/cos-goal-mission__vector[^]*left:10px!important[^]*width:31%!important/);
 assert.match(css,/cos-goal-mission__scenarios[^]*right:10px!important[^]*width:31%!important/);
});

test("safe-zone responsive patch adds no phone animation or visual filters",()=>{
 const marker=mobile.lastIndexOf("Cosmos Safe-Zone Instruments");
 const css=mobile.slice(marker);
 assert.doesNotMatch(css,/animation\s*:/);
 assert.doesNotMatch(css,/filter\s*:(?!none)/);
 assert.doesNotMatch(css,/backdrop-filter\s*:/);
});
