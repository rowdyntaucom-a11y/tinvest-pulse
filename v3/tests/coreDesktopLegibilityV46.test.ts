import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const proCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("desktop monitor-distance legibility has a dedicated wide breakpoint",()=>{
 assert.match(css,/@media\(min-width:1200px\)/);
 assert.match(css,/--desktop-canvas:1560px/);
 assert.match(css,/--desktop-rail:252px/);
 assert.match(css,/\.sb\[data-layout="desktop"\] \.sb-nav span\{font-size:13px/);
 assert.match(css,/\.sb\[data-layout="desktop"\] \.sb-title h1\{font-size:40px/);
 assert.match(css,/\.sb\[data-layout="desktop"\] \.sb-balance>strong\{font-size:70px/);
});

test("desktop overrides phone-era history microtype",()=>{
 assert.match(css,/\.v3-history-window button\{height:38px!important;font-size:11px!important/);
 assert.match(css,/\.v3-history-axis\{top:52px!important;font-size:10px!important/);
 assert.match(css,/\.v3-history-depth strong\{font-size:13px!important/);
 assert.match(css,/\.v3-history-legend\{font-size:10px!important/);
});

test("desktop portfolio rows are readable at normal monitor distance",()=>{
 assert.match(css,/\.sb-asset>span b\{font-size:14px/);
 assert.match(css,/\.sb-asset>span small\{font-size:11px/);
 assert.match(css,/\.sb-asset-pnl\{font-size:13px/);
 assert.match(css,/min-height:68px/);
});

test("deep workspaces receive explicit desktop typography, not only inherited scale",()=>{
 assert.match(proCss,/@media\(min-width:1200px\)/);
 assert.match(proCss,/font-size:1\.22em/);
 assert.match(proCss,/>header h2,/);
 assert.match(proCss,/font-size:24px/);
 assert.match(proCss,/core-analytics-depth__nav strong/);
 assert.match(proCss,/font-size:13px/);
 assert.match(proCss,/v3-pro-tools__groups button strong/);
});

test("very wide monitors continue to use additional canvas width",()=>{
 assert.match(css,/@media\(min-width:1600px\)/);
 assert.match(css,/--desktop-canvas:1680px/);
 assert.match(css,/--desktop-rail:270px/);
});
