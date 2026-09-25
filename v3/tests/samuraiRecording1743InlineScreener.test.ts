import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const gate=readFileSync(new URL("../src/samurai/SamuraiTrustGate.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiAtlasInteraction.css",import.meta.url),"utf8");

test("recording 1743: fail-closed Screener mounts only inside the tapped Atlas card",()=>{
 assert.match(analysis,/inlineTools=\{\{screener:<Suspense/);
 assert.match(analysis,/samuraiReference&&trusted&&<div id="sam-analysis-screener"/);
 assert.doesNotMatch(analysis,/samuraiReference&&<div id="sam-analysis-screener"/);
 assert.match(gate,/inlineTools\?:Record<string,ReactNode>/);
 assert.match(atlas,/sam-offline-atlas__tool-slot/);
 assert.match(atlas,/inlineTools\?\.\[chapter\.id\]/);
});

test("recording 1743: fail-closed Screener no longer jumps to detached bottom target",()=>{
 const screenerLine=atlas.split("\n").find(line=>line.includes('id:"screener"'))??"";
 assert.doesNotMatch(screenerLine,/targetId/);
 assert.match(css,/sam-offline-atlas__tool-slot\{[\s\S]*?overflow-anchor:none/);
 assert.match(css,/sam-offline-atlas__tool-slot \.sam-screener\{[\s\S]*?min-height:0/);
});
