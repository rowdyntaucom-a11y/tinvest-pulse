import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const gate=readFileSync(new URL("../src/cosmos/CosmosTrustGate.tsx",import.meta.url),"utf8");
const goal=readFileSync(new URL("../src/goal/V3Goal.tsx",import.meta.url),"utf8");
const mobile=readFileSync(new URL("../src/styles/mobilePerformance.css",import.meta.url),"utf8");
const cosmos=readFileSync(new URL("../src/styles/cosmosExperience.css",import.meta.url),"utf8");

test("Cosmos fail-closed tabs expose distinct functional instruments",()=>{
 assert.match(gate,/cos-gate__modules--assets/);
 assert.match(gate,/cos-module--allocation/);
 assert.match(gate,/cos-module--holdings/);
 assert.match(gate,/cos-module--concentration/);
 assert.match(gate,/cos-module--asset-intel/);
 assert.match(gate,/cos-gate__modules--analysis/);
 assert.match(gate,/cos-module--performance/);
 assert.match(gate,/cos-module--risk/);
 assert.match(gate,/cos-module--benchmark/);
 assert.match(gate,/cos-module--correlation/);
 assert.match(gate,/cos-gate__modules--income/);
 assert.match(gate,/cos-module--cashflow/);
 assert.match(gate,/cos-module--calendar/);
 assert.match(gate,/cos-module--sources/);
 assert.match(gate,/cos-module--coverage/);
 assert.doesNotMatch(gate,/x\.modules\.map/);
});

test("Cosmos goal exposes mission-control modules instead of equal cards",()=>{
 assert.match(goal,/cos-goal-mission/);
 assert.match(goal,/cos-goal-mission__vector/);
 assert.match(goal,/cos-goal-mission__target/);
 assert.match(goal,/cos-goal-mission__progress/);
 assert.match(goal,/cos-goal-mission__scenarios/);
});

test("Cosmos functional widgets keep unavailable values fail-closed",()=>{
 assert.match(gate,/<strong>—<\/strong>/);
 assert.match(gate,/Источник не подтверждён/);
 assert.doesNotMatch(gate,/\b0(?:[.,]0+)?%/);
});

test("responsive layer gives each Cosmos workspace a different instrument geometry",()=>{
 const marker=mobile.lastIndexOf("Cosmos Functional Instruments v2");
 assert.ok(marker>=0);
 const css=mobile.slice(marker);
 assert.match(css,/cos-gate__modules--assets/);
 assert.match(css,/grid-template-areas:"allocation holdings" "allocation concentration" "allocation intel"/);
 assert.match(css,/cos-gate__modules--analysis/);
 assert.match(css,/grid-template-areas:"performance risk" "benchmark correlation"/);
 assert.match(css,/cos-gate__modules--income/);
 assert.match(css,/grid-template-areas:"cashflow calendar" "sources coverage"/);
 assert.match(css,/cos-goal-mission/);
});

test("Cosmos instrument motion is shell-owned and reduced-motion safe",()=>{
 assert.match(cosmos,/Functional-instrument motion/);
 assert.match(cosmos,/cosChartTravel/);
 assert.match(cosmos,/cosRiskNeedle/);
 assert.match(cosmos,/cosCalendarBeacon/);
 assert.match(cosmos,/prefers-reduced-motion:reduce/);
});
