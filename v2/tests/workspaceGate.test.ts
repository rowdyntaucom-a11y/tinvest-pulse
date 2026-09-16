import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveWorkspaceGate } from "../src/features/navigation/workspaceGate.ts";

for (const status of ["LOADING", "FALLBACK", "ERROR", "LIVE"] as const) {
  assert.equal(resolveWorkspaceGate("dna", status), "WORKSPACE", `DNA must remain reachable while portfolio status is ${status}`);
}

assert.equal(resolveWorkspaceGate("board", "LOADING"), "LOADING");
assert.equal(resolveWorkspaceGate("portfolio", "FALLBACK"), "UNAVAILABLE");
assert.equal(resolveWorkspaceGate("analytics", "ERROR"), "UNAVAILABLE");
assert.equal(resolveWorkspaceGate("income", "LIVE"), "WORKSPACE");

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
assert.match(appSource, /resolveWorkspaceGate\(tab, portfolioStatus\)/, "App must consume the reviewed workspace gate policy");
assert.match(appSource, /<DnaWorkspace state=\{dnaWorldState\}\s*\/>/, "App must render the extracted single-owner DNA workspace");
const dnaGateIndex = appSource.indexOf('workspaceGate === "WORKSPACE" && tab === "dna"');
const brokerLoadingIndex = appSource.indexOf('workspaceGate === "LOADING"');
assert.ok(dnaGateIndex >= 0 && brokerLoadingIndex >= 0 && dnaGateIndex < brokerLoadingIndex, "DNA workspace routing must be evaluated before broker loading/fallback presentation");

console.log("workspace gate regression passed");
