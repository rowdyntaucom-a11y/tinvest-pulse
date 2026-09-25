import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const css=readFileSync(new URL("../src/styles/samuraiRecording1731Polish.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

test("untrusted Home removes the duplicate outer history heading",()=>{
 assert.match(css,/data-workspace="home"\]\[data-trusted="false"\][\s\S]*?\.sam-world__analytics-head\{[\s\S]*?display:none!important/);
 assert.match(css,/\.sam-world__analytics-page\{[\s\S]*?padding-top:max\(22px/);
});

test("Home source route is a safe second scroll chapter",()=>{
 assert.match(css,/sam-world__awaiting\.sam-world__awaiting--compact\{[\s\S]*?scroll-snap-align:start!important/);
 assert.match(css,/scroll-margin-top:58px!important/);
 assert.match(css,/margin-bottom:max\(126px/);
});

test("verification text gains a readable lane over the Samurai art",()=>{
 assert.match(css,/sam-trust-gate__route\{[\s\S]*?rgba\(2,8,7,\.88\)/);
 assert.match(css,/sam-trust-gate__route small\{[\s\S]*?color:#98a7a1!important/);
});

test("Samurai Goal checkboxes are shell-authored instead of native white controls",()=>{
 assert.match(css,/input\[type="checkbox"\]\{[\s\S]*?appearance:none!important/);
 assert.match(css,/input\[type="checkbox"\]:checked:after\{[\s\S]*?content:"✓"!important/);
 assert.match(css,/input\[type="checkbox"\]:focus-visible/);
});

test("recording 1731 polish loads after the 1730 cascade guard",()=>{
 const prev=main.indexOf('import"./styles/samuraiRecording1730Correction.css"');
 const next=main.indexOf('import"./styles/samuraiRecording1731Polish.css"');
 const mobile=main.indexOf('import"./styles/mobilePerformance.css"');
 assert.ok(prev>=0&&next>prev&&mobile>next);
});
