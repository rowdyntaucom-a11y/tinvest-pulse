import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const toolsCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");
const coreCss=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");

test("real-device deep workspaces keep explanatory text readable",()=>{
 assert.match(toolsCss,/v36 real-device deep workspace readability/);
 assert.match(toolsCss,/font-size:10px;line-height:1\.5/);
 assert.match(toolsCss,/v3-market-intelligence>nav button\{flex-basis:124px;min-height:52px/);
 assert.match(toolsCss,/v3-pro-tools__groups button\{min-height:60px/);
 assert.match(toolsCss,/v3-futures-scenario__fields input.*min-height:44px/);
});

test("dense professional rows use readable mobile microcopy",()=>{
 assert.match(toolsCss,/sam-rebalance__rows small/);
 assert.match(toolsCss,/sam-report-depth__row small/);
 assert.match(toolsCss,/font-size:9px;line-height:1\.4/);
 assert.match(toolsCss,/sam-rebalance__modes button.*min-height:42px/);
});

test("core navigation preserves larger touch targets and bottom reading space",()=>{
 assert.match(coreCss,/v36 real-device reading rhythm/);
 assert.match(coreCss,/\.sb main\{padding-bottom:72px\}/);
 assert.match(coreCss,/sb-workspace-tabs button\{min-height:38px/);
 assert.match(coreCss,/sb-nav button\{min-height:56px;touch-action:manipulation\}/);
});
