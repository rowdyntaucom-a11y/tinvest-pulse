import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const css=readFileSync(new URL("../src/styles/samuraiRecording1729Correction.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

test("recording 1729 removes duplicate fail-closed chapter chrome",()=>{
 assert.match(css,/sam-trust-gate__chapter/);
 assert.match(css,/>header\{[\s\S]*display:none!important/);
 assert.match(css,/sam-trust-gate__watermark/);
});

test("atlas is readable instead of microtype on Samsung",()=>{
 assert.match(css,/sam-offline-atlas__head strong[\s\S]*font-size:22px!important/);
 assert.match(css,/sam-offline-formation[\s\S]*grid-template-columns:1fr!important/);
 assert.match(css,/sam-offline-formation__rows b\{font-size:10px!important/);
 assert.match(css,/sam-offline-atlas__chapters b\{font-size:9\.5px!important/);
});

test("verification cue remains actionable and route follows atlas directly",()=>{
 assert.match(css,/sam-offline-atlas\+\.sam-trust-depth-cue[\s\S]*pointer-events:auto!important/);
 assert.match(css,/sam-trust-gate:has\(>\.sam-offline-atlas\)>\.sam-trust-gate__route[\s\S]*margin:10px 0 0!important/);
});

test("placeholder history cannot masquerade as a real performance line",()=>{
 assert.match(css,/sam-offline-history__chart polyline[\s\S]*opacity:\.18!important/);
 assert.match(css,/stroke-dasharray:4 7!important/);
});

test("video correction loads after the fail-closed atlas styles",()=>{
 const atlas=main.indexOf('import"./styles/samuraiFailClosedAtlas.css"');
 const correction=main.indexOf('import"./styles/samuraiRecording1729Correction.css"');
 const mobile=main.indexOf('import"./styles/mobilePerformance.css"');
 assert.ok(atlas>=0&&correction>atlas&&mobile>correction);
});
