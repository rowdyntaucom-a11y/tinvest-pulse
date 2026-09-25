import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiAtlasInteraction.css",import.meta.url),"utf8");
const base=readFileSync(new URL("../src/styles/samuraiFailClosedAtlas.css",import.meta.url),"utf8");

test("recording 1741: selected Atlas detail renders inline with its tapped card",()=>{
 assert.match(atlas,/selected===chapter\.id&&renderDetail\(chapter\)/);
 assert.match(atlas,/className="sam-offline-atlas__detail is-inline"/);
 assert.match(atlas,/раскрываются прямо под выбранным пунктом/);
 assert.doesNotMatch(atlas,/\{selected&&<aside/);
});

test("inline detail spans chapter grids without inheriting chapter-card layout",()=>{
 assert.match(css,/sam-offline-atlas__detail\.is-inline\{[\s\S]*?grid-column:1\/-1/);
 assert.match(base,/sam-offline-atlas__chapters>article\{/);
 assert.match(base,/sam-offline-formation__rows>article\{/);
 assert.match(css,/:is\(\.sam-offline-atlas__chapters,\.sam-offline-formation__rows\)>article\{/);
});
