import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worlds=readFileSync(new URL("../src/styles/shellWorlds.css",import.meta.url),"utf8");
const workspace=readFileSync(new URL("../src/styles/workspaceWorldFinish.css",import.meta.url),"utf8");
const mobile=readFileSync(new URL("../src/styles/mobilePerformance.css",import.meta.url),"utf8");

assert.doesNotMatch(worlds,/Workspace material coherence v14/,"world art must not own workspace materials");
assert.match(workspace,/Workspace material coherence v14/);
for(const shell of["samurai","carbon","core","horizon","aurora","minimal"]){
  assert.match(workspace,new RegExp(`data-shell="${shell}"\\]:not\\(\\[data-workspace="home"\\]\\)`));
}
assert.ok(workspace.includes('--shell-bg:#071214;--shell-accent:#f0b06d'));
assert.ok(workspace.includes('--shell-bg:#e8f1f6;--shell-accent:#3b7fa5'));
assert.ok(workspace.includes('--shell-bg:#f3eee2;--shell-accent:#9a6a2a'));
for(const radius of["18px 8px 18px 8px","10px 22px 10px 22px","22px 12px 22px 12px","14px","20px","8px"]){
  assert.ok(workspace.includes(`--v3-deep-radius:${radius}`));
}
assert.ok(workspace.includes('--v3-deep-chrome:rgba(242,249,252,.94)'));
assert.doesNotMatch(workspace.slice(workspace.indexOf("Workspace material coherence v14")),/color-mix\(in srgb,var\(--v3-deep-card\)/);
assert.match(workspace,/\\.v3-app:not\\(\\[data-workspace="home"\\]\\) :is\\([\\s\\S]*\\.v3-analysis-layer[\\s\\S]*\\.v3-benchmark[\\s\\S]*\\.v3-class-map[\\s\\S]*\\.v3-bond-lens[\\s\\S]*\\.v3-breadth[\\s\\S]*\\.v3-market-context[\\s\\S]*\\.v3-asset-history-card/);
assert.match(workspace,/\.v3-nav button\.is-active[\s\S]*color-mix\(in srgb,var\(--v3-accent\) 10%,transparent\)/);
assert.ok(workspace.includes(".v3-goal-facts article"));
assert.ok(workspace.includes(".v3-income-ratios article"));
assert.ok(workspace.includes(".v3-holdings-search input"));
assert.ok(workspace.includes(".v3-goal-scenario-field input"));
assert.ok(workspace.includes(".v3-section-selector select option"));
assert.match(mobile,/@media\(max-width:699px\)[\s\S]*backdrop-filter:none!important[\s\S]*-webkit-backdrop-filter:none!important/);

console.log("workspace theme materials regression: ok");
