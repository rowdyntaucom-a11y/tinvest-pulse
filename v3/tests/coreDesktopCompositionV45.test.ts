import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const proCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("desktop overview is an authored cockpit rather than a phone stack",()=>{
 assert.match(core,/sb-home-cockpit/);
 assert.match(core,/sb-home-side/);
 assert.match(core,/sb-home-assets/);
 assert.match(css,/grid-template-columns:minmax\(0,1\.7fr\) minmax\(310px,\.75fr\)/);
 assert.match(css,/min-height:430px/);
 assert.match(css,/height:310px!important/);
});

test("desktop canvas and navigation use the wide monitor deliberately",()=>{
 assert.match(css,/--desktop-rail:228px/);
 assert.match(css,/--desktop-canvas:1380px/);
 assert.match(css,/padding:34px 0 64px calc\(var\(--desktop-rail\) \+ var\(--desktop-gap\)\)/);
 assert.match(css,/\.sb-nav:before\{content:"РАЗДЕЛЫ"/);
 assert.match(css,/@media\(min-width:1500px\)/);
 assert.match(css,/--desktop-canvas:1480px/);
});

test("desktop tables and typography are larger than compact phone presentation",()=>{
 assert.match(css,/\.sb\[data-layout="desktop"\] \.sb-asset-table-head/);
 assert.match(css,/minmax\(280px,2\.2fr\)/);
 assert.match(css,/\.sb\[data-layout="desktop"\] \.sb-asset>span b\{font-size:12px/);
 assert.match(css,/\.sb\[data-layout="desktop"\] \.sb-title h1\{font-size:34px/);
 assert.match(css,/\.sb\[data-layout="desktop"\] \.sb-balance>strong\{font-size:58px/);
});

test("desktop professional workspaces exploit wide columns",()=>{
 assert.match(proCss,/core-analytics-depth__nav\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(proCss,/v3-market-intelligence>nav\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(proCss,/v3-pro-tools__groups\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test("v45 desktop rules do not replace the phone contract",()=>{
 assert.match(css,/\.sb\[data-layout="phone"\] \.sb-asset/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.doesNotMatch(core,/window\.innerWidth\s*[<>]=?\s*1500/);
});
