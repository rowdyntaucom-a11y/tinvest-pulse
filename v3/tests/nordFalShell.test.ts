import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const css=readFileSync(new URL("../src/styles/nordVikingShell.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
const prompts=JSON.parse(readFileSync(new URL("../art/theme-prompts.json",import.meta.url),"utf8"));

assert.match(main,/mobilePerformance\.css";import"\.\/styles\/nordVikingShell\.css"/);
assert.match(css,/NORD \/ Amber Fjord — fal\.ai production candidate/);
assert.match(css,/data-shell="aurora"/);
assert.match(css,/15HWbV9uOV25-aVFgkt_p_bWYjhG0d\.webp/);
assert.match(css,/--nord-amber:#f2b36d/);
assert.match(css,/--nord-cyan:#74dbe8/);
assert.match(css,/NORD \/\/ FJORD/);
assert.match(css,/data-workspace="home"/);
assert.doesNotMatch(css,/data-shell="samurai"/);
assert.doesNotMatch(css,/data-shell="carbon"/);
assert.match(prompts.themes.nord,/Viking warrior/);
assert.match(prompts.themes.nord,/grey wolf/);
assert.match(prompts.themes.nord,/warm amber only as restrained accents/);
assert.match(prompts.themes.nord,/no smartphone, no UI, no text, no logos/);
console.log("NORD fal.ai Amber Fjord shell regression: ok");
