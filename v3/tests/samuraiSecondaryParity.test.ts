import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const gate=readFileSync(new URL("../src/samurai/SamuraiTrustGate.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiSecondaryParity.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

for(const token of[
 'type GateKind="assets"|"analysis"|"income"',
 '"sam-trust-gate sam-trust-gate--"+kind',
 "sam-trust-depth-cue","sam-trust-gate__route","scrollIntoView"
])assert.ok(gate.includes(token),token);

assert.match(gate,/<button type="button" className="sam-trust-depth-cue"/);
assert.doesNotMatch(gate,/sam-trust-depth-cue" aria-hidden="true"/);

for(const token of[
 "Samurai secondary parity",'data-workspace="assets"','data-workspace="analysis"','data-workspace="income"',
 ".v3-page-head",".sam-trust-gate__chapter",".sam-trust-instrument",".sam-trust-depth-cue",
 ".sam-trust-gate__route","samParityDepthCue","prefers-reduced-motion"
])assert.ok(css.includes(token),token);

assert.match(css,/\.v3-page-head,[\s\S]*display:none!important/);
assert.match(css,/\.sam-trust-gate__route\{[\s\S]*margin:calc\(100svh - 92px\)/);
assert.doesNotMatch(css,/backdrop-filter\s*:/);
assert.ok(main.includes('import"./styles/samuraiSecondaryParity.css"'));
assert.ok(main.indexOf("samuraiGoalParity.css")<main.indexOf("samuraiSecondaryParity.css"));
assert.ok(main.indexOf("samuraiSecondaryParity.css")<main.indexOf("mobilePerformance.css"));
console.log("samurai secondary parity regression: ok");
