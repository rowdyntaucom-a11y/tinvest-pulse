import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const goal=readFileSync(new URL("../src/goal/V3Goal.tsx",import.meta.url),"utf8");
const mobile=readFileSync(new URL("../src/styles/mobilePerformance.css",import.meta.url),"utf8");

test("Cosmos Goal uses a dedicated command overlay instead of generic page head/hero",()=>{
 assert.match(goal,/shell!=="carbon"&&<header className="v3-page-head"/);
 assert.match(goal,/shell==="carbon"\?<section className="cos-goal-command"/);
 assert.match(goal,/shell==="carbon"&&<section className="cos-goal-mission"/);
 assert.match(goal,/cos-goal-scene-spacer/);
});

test("Cosmos Goal command is compact and edge-aligned on phone",()=>{
 const marker=mobile.lastIndexOf("Cosmos Goal Command Overlay");
 assert.ok(marker>=0);
 const css=mobile.slice(marker);
 assert.match(css,/\.cos-goal-command\{[^]*right:10px!important[^]*width:33%!important/);
 assert.match(css,/\.cos-goal-command__value>strong\{[^]*font-size:14px!important/);
 assert.match(css,/\.cos-goal-mission__target\{[^]*display:none!important/);
 assert.match(css,/\.cos-goal-scene-spacer\{[^]*height:calc\(100svh - 50px\)!important/);
 assert.match(css,/>\.v3-page-head,[^]*>\.v3-goal-hero\{[^]*display:none!important/);
});

test("Cosmos Goal responsive patch adds no phone filters or animations",()=>{
 const marker=mobile.lastIndexOf("Cosmos Goal Command Overlay");
 const css=mobile.slice(marker);
 assert.doesNotMatch(css,/animation\s*:/);
 assert.doesNotMatch(css,/filter\s*:(?!none)/);
 assert.doesNotMatch(css,/backdrop-filter\s*:/);
});
