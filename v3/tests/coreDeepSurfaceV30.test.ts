import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const fundamentals=readFileSync(new URL("../src/styles/equityFundamentalsDepth.css",import.meta.url),"utf8");
const bonds=readFileSync(new URL("../src/styles/bondYieldDepth.css",import.meta.url),"utf8");
const holdings=readFileSync(new URL("../src/styles/holdingsExplorer.css",import.meta.url),"utf8");
const assets=readFileSync(new URL("../src/styles/assetsDepth.css",import.meta.url),"utf8");
const core=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("legacy equity and bond depth have explicit light Core overrides",()=>{
 assert.match(fundamentals,/\/\* v30 light Core override \*\//);
 assert.match(fundamentals,/\.sb \.v3-equity-fundamentals\{[^}]*background:#fff/);
 assert.match(fundamentals,/\.sb \.v3-equity-fundamentals__summary article[^}]*background:#fafbfc/);
 assert.match(bonds,/\/\* v30 light Core override \*\//);
 assert.match(bonds,/\.sb \.v3-bond-yield-depth\{[^}]*background:#fff/);
 assert.match(bonds,/\.sb \.v3-bond-yield-summary article[^}]*background:#fafbfc/);
});

test("holdings explorer no longer falls back to dark translucent controls inside light Core",()=>{
 assert.match(holdings,/\.sb \.v3-holdings-explorer\{[^}]*background:#fff/);
 assert.match(holdings,/\.sb \.v3-holdings-search input[^}]*background:#fff/);
 assert.match(holdings,/\.sb \.v3-holdings-row[^}]*background:#fafbfc/);
});

test("deep portfolio layout has a mobile readability floor",()=>{
 assert.match(assets,/\/\* v30 light Core mobile composition \*\//);
 assert.match(assets,/@media\(max-width:520px\)/);
 assert.match(assets,/font-size:9px/);
 assert.match(fundamentals,/font-size:9px/);
 assert.match(bonds,/font-size:9px/);
 assert.match(holdings,/font-size:9px/);
});

test("all major light Core deep workspaces prevent horizontal spill",()=>{
 assert.match(core,/\/\* v30 unified light Core deep-surface contract \*\//);
 assert.match(core,/max-width:100%;min-width:0;scroll-margin-top:88px;overflow-x:clip/);
 assert.match(core,/overflow-wrap:anywhere/);
});
