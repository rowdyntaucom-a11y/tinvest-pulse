import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const prototype=readFileSync(new URL("../src/samurai/SamuraiPrototype.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiAtlasInteraction.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

test("fail-closed Atlas chapter cards are real buttons",()=>{
 assert.match(atlas,/sam-offline-chapter-hit/);
 assert.match(atlas,/aria-expanded=\{selected\}/);
 assert.match(atlas,/aria-controls="sam-offline-atlas-detail"/);
 assert.match(atlas,/TAP \/ DETAILS/);
});

test("clicking a chapter opens a source-aware detail panel",()=>{
 assert.match(atlas,/sam-offline-atlas__detail/);
 assert.match(atlas,/DATA LOCK/);
 assert.match(atlas,/НУЖЕН ИСТОЧНИК/);
 assert.match(atlas,/Маршрут проверки/);
 assert.match(atlas,/scrollToSourceRoute/);
});

test("Home Atlas can navigate to real workspaces",()=>{
 assert.match(atlas,/destination:"analysis"/);
 assert.match(atlas,/destination:"income"/);
 assert.match(atlas,/destination:"assets"/);
 assert.match(prototype,/SamuraiFailClosedAtlas kind="home" onNavigate=\{onNavigate\}/);
});

test("locked Assets Atlas stays in parity with live equity and bond chapters",()=>{
 assert.match(atlas,/id:"fundamentals",code:"肆",label:"Акции"/);
 assert.match(atlas,/GetAssetFundamentals/);
 assert.match(atlas,/id:"bonds",code:"伍",label:"Облигации"/);
 assert.match(atlas,/GetMarketValues/);
});

test("interaction layer has mobile tap/focus treatment",()=>{
 assert.match(css,/cursor:pointer/);
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:430px\)/);
 assert.ok(main.includes('import"./styles/samuraiAtlasInteraction.css"'));
});
