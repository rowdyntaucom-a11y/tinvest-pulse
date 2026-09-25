import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const chapterNav=readFileSync(new URL("../src/samurai/SamuraiChapterNav.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiMarketScreener.css",import.meta.url),"utf8");

test("recording 1742: deep Samurai navigation no longer leaves a smooth-scroll tail",()=>{
 assert.match(chapterNav,/scrollIntoView\(\{behavior:"auto",block:"start"\}\)/);
 assert.match(atlas,/scrollIntoView\(\{behavior:"auto",block:"start"\}\)/);
 assert.doesNotMatch(chapterNav,/behavior:reduce\?"auto":"smooth"/);
});

test("recording 1742: final Screener chapter has a mobile scroll runway",()=>{
 assert.match(css,/#sam-analysis-screener\{[\s\S]*?min-height:calc\(100dvh - 58px\)/);
 assert.match(css,/\.sam-screener\{[\s\S]*?overflow-anchor:none[\s\S]*?min-height:calc\(100dvh - 118px\)/);
 assert.match(css,/@media\(max-width:430px\)[\s\S]*?#sam-analysis-screener[\s\S]*?padding-bottom:calc\(88px \+ env\(safe-area-inset-bottom\)\)/);
});
