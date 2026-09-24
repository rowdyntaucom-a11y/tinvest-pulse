import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const css=readFileSync(new URL("../src/styles/samuraiRealDeviceParity.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

for(const token of[
 "Samurai real-device parity","sam-trust-gate--assets","sam-trust-gate--analysis","sam-trust-gate--income",
 "margin:calc(100svh - 88px)","sam-goal-empty-path","sam-goal-chapter","sam-goal-command",
 "sam-goal-path-rail","sam-trust-depth-cue"
])assert.ok(css.includes(token),token);

assert.ok(main.includes('import"./styles/samuraiRealDeviceParity.css"'));
assert.ok(main.indexOf("samuraiRealDeviceParity.css")<main.indexOf("mobilePerformance.css"),"mobile performance remains the final stylesheet owner");

assert.match(css,/sam-trust-gate--assets>\.sam-trust-gate__route,[\s\S]*margin:calc\(100svh - 88px\)/);
assert.match(css,/v3-goal:has\(\.sam-goal-empty-path\) \.sam-goal-empty-path\{[\s\S]*display:none!important/);
assert.match(css,/v3-goal:has\(\.sam-goal-empty-path\) \.sam-goal-chapter\{[\s\S]*width:36%!important/);
assert.doesNotMatch(css,/backdrop-filter\s*:/);
assert.doesNotMatch(css,/animation\s*:/);
console.log("samurai real-device parity regression: ok");
