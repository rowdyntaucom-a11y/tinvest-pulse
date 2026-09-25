import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const gate=readFileSync(new URL("../src/samurai/SamuraiTrustGate.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiAtlasInteraction.css",import.meta.url),"utf8");

test("recording 1743: fail-closed public Screener stays inline inside the consolidated Tools card",()=>{
 assert.match(analysis,/inlineTools=\{\{tools:<Suspense/);
 assert.match(analysis,/sam-analysis-tools/);
 assert.doesNotMatch(analysis,/samuraiReference&&<div id="sam-analysis-screener"/);
 assert.match(gate,/inlineTools\?:Record<string,ReactNode>/);
 assert.match(atlas,/id:"tools"/);
 assert.match(atlas,/sam-offline-atlas__tool-slot/);
 assert.match(atlas,/inlineTools\?\.\[chapter\.id\]/);
});

test("recording 1743: fail-closed Screener no longer jumps to a detached bottom target",()=>{
 const toolsLine=atlas.split("\n").find(line=>line.includes('id:"tools"'))??"";
 assert.doesNotMatch(toolsLine,/targetId/);
 assert.match(css,/sam-offline-atlas__tool-slot\{[\s\S]*?overflow-anchor:none/);
 assert.match(css,/sam-offline-atlas__tool-slot \.sam-screener\{[\s\S]*?min-height:0/);
});
