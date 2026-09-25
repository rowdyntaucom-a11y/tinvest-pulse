import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiAtlasInteraction.css",import.meta.url),"utf8");

test("recording 1740: selecting an Atlas card no longer auto-scrolls the document",()=>{
 assert.doesNotMatch(atlas,/import\{[^}]*useEffect[^}]*\}from"react"/);
 assert.doesNotMatch(atlas,/detailRef\.current[\s\S]{0,240}scrollIntoView/);
 assert.match(atlas,/scrollToSourceRoute/);
 assert.match(atlas,/scrollToTarget/);
});

test("recording 1740: full-card touch targets yield vertical gestures to page scrolling",()=>{
 assert.match(css,/sam-offline-chapter-hit\{[\s\S]*?touch-action:pan-y/);
 assert.match(css,/data-workspace="analysis"\]\[data-trusted="false"\][\s\S]*?overscroll-behavior-y:auto/);
 assert.match(css,/overflow-anchor:none/);
});
