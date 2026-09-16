import assert from "node:assert/strict";
import { resolveWorkspaceGate } from "../src/features/navigation/workspaceGate.ts";

for (const status of ["LOADING", "FALLBACK", "ERROR", "LIVE"] as const) {
  assert.equal(resolveWorkspaceGate("dna", status), "WORKSPACE", `DNA must remain reachable while portfolio status is ${status}`);
}

assert.equal(resolveWorkspaceGate("board", "LOADING"), "LOADING");
assert.equal(resolveWorkspaceGate("portfolio", "FALLBACK"), "UNAVAILABLE");
assert.equal(resolveWorkspaceGate("analytics", "ERROR"), "UNAVAILABLE");
assert.equal(resolveWorkspaceGate("income", "LIVE"), "WORKSPACE");

console.log("workspace gate regression passed");
