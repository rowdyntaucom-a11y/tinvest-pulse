import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const css=readFileSync(new URL("../src/styles/samuraiRecording1730Correction.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

test("Atlas header is isolated from legacy descendant-header cascade",()=>{
 assert.match(css,/sam-trust-gate:has\(>\.sam-offline-atlas\)[\s\S]*?>\.sam-offline-atlas[\s\S]*?>\.sam-offline-atlas__head\{/);
 assert.match(css,/display:flex!important/);
 assert.match(css,/>\.sam-offline-atlas__head>div[\s\S]*?flex:1 1 auto!important/);
 assert.match(css,/>\.sam-offline-atlas__head>i[\s\S]*?flex:0 0 44px!important/);
});

test("Atlas verification cue cannot overlay the final chapter row",()=>{
 assert.match(css,/>\.sam-trust-depth-cue\{[\s\S]*?position:static!important/);
 assert.match(css,/inset:auto!important/);
 assert.match(css,/margin:12px 0 8px!important/);
});

test("compact Home verification route no longer reserves a viewport of dead space",()=>{
 assert.match(css,/sam-world__awaiting\.sam-world__awaiting--compact\{[\s\S]*?min-height:0!important/);
 assert.match(css,/height:auto!important/);
 assert.match(css,/max-height:none!important/);
});

test("recording 1730 correction loads after recording 1729 correction",()=>{
 const prev=main.indexOf('import"./styles/samuraiRecording1729Correction.css"');
 const next=main.indexOf('import"./styles/samuraiRecording1730Correction.css"');
 const mobile=main.indexOf('import"./styles/mobilePerformance.css"');
 assert.ok(prev>=0&&next>prev&&mobile>next);
});
