import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worlds = readFileSync(new URL("../src/styles/shellWorlds.css", import.meta.url), "utf8");

assert.match(worlds, /Workspace material coherence v14/);
for (const shell of ["samurai","carbon","core","horizon","aurora","minimal"]) {
  assert.match(worlds, new RegExp(`data-shell="${shell}"\\]:not\\(\\[data-workspace="home"\\]\\)`));
}
assert.ok(worlds.includes('--shell-bg:#071214;--shell-accent:#f0b06d'));
assert.ok(worlds.includes('--shell-bg:#e8f1f6;--shell-accent:#3b7fa5'));
assert.ok(worlds.includes('--shell-bg:#f3eee2;--shell-accent:#9a6a2a'));
assert.ok(worlds.includes('--v3-deep-radius:18px 8px 18px 8px'));
assert.ok(worlds.includes('--v3-deep-radius:10px 22px 10px 22px'));
assert.ok(worlds.includes('--v3-deep-radius:22px 12px 22px 12px'));
assert.ok(worlds.includes('--v3-deep-radius:14px'));
assert.ok(worlds.includes('--v3-deep-radius:20px'));
assert.ok(worlds.includes('--v3-deep-radius:8px'));
assert.ok(worlds.includes('--v3-deep-chrome:rgba(242,249,252,.94)'));
assert.doesNotMatch(worlds.slice(worlds.indexOf("Workspace material coherence v14")), /color-mix\(in srgb,var\(--v3-deep-card\)/);
assert.match(worlds, /\.v3-app:not\(\[data-workspace="home"\]\) :is\([\s\S]*\.v3-benchmark[\s\S]*\.v3-market-context/);
assert.match(worlds, /\.v3-nav button\.is-active[\s\S]*color-mix\(in srgb,var\(--v3-accent\) 10%,transparent\)/);
assert.match(worlds, /@media\(max-width:699px\)[\s\S]*Workspace material coherence v14|Workspace material coherence v14[\s\S]*@media\(max-width:699px\)/);
const v14 = worlds.slice(worlds.indexOf("Workspace material coherence v14"));
assert.ok(v14.includes("backdrop-filter:none!important"));
assert.ok(v14.includes("-webkit-backdrop-filter:none!important"));
assert.ok(v14.includes("Deep controls on the three bright worlds"));
assert.ok(v14.includes(".v3-goal-facts article"));
assert.ok(v14.includes(".v3-income-ratios article"));
assert.ok(v14.includes(".v3-holdings-search input"));
assert.ok(v14.includes(".v3-goal-scenario-field input"));
assert.ok(v14.includes(".v3-section-selector select option"));

console.log("workspace theme materials regression: ok");
