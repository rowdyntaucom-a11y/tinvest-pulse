import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dna=readFileSync(new URL("../src/dna/V3DnaWorkspace.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/dna/dna.css",import.meta.url),"utf8");

assert.match(dna,/data-phase=\{state\.timePhase\}/);
assert.match(dna,/data-weather=\{state\.weather\}/);
assert.match(dna,/phaseStory/);
assert.match(dna,/weatherLabel/);
assert.match(dna,/weatherLabel\(state\.weather\)/);

assert.match(css,/DNA cinematic shell frame v21/);
for(const shell of["samurai","carbon","core","horizon","aurora","minimal"]) assert.match(css,new RegExp('data-shell="'+shell+'"'));
for(const phase of["dawn","day","sunset","night"]) assert.match(css,new RegExp('data-phase="'+phase+'"'));
assert.match(css,/height:calc\(100dvh - 112px\)/);
assert.match(css,/min-height:44px!important/);
const v21=css.slice(css.indexOf("DNA cinematic shell frame v21"));
assert.match(css,/Mobile DNA performance/);
assert.match(css,/backdrop-filter:none!important/);
assert.match(css,/-webkit-backdrop-filter:none!important/);
assert.ok(v21.includes("var(--dna-radius,24px)"));
assert.ok(v21.includes("var(--dna-frame)"));
assert.doesNotMatch(v21,/--dna-hud:/);
assert.doesNotMatch(v21,/filter:blur/);

console.log("v3 DNA cinematic shell frame: ok");
