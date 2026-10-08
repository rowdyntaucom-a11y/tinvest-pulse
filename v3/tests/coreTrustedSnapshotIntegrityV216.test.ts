import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseTrustedSnapshotCache} from "../src/data/trustedSnapshotCache.ts";
test("untrusted browser cache is rejected",()=>{
 assert.equal(parseTrustedSnapshotCache(null,100,50),null);
 assert.equal(parseTrustedSnapshotCache("{}",100,50),null);
 assert.equal(parseTrustedSnapshotCache(JSON.stringify({savedAt:120,snapshot:{}}),100,50),null);
});
test("verified refresh does not await optional history",()=>{
 const root=readFileSync(new URL("../src/core/CoreRoot.tsx",import.meta.url),"utf8");
 assert.match(root,/void loadPortfolioHistory/);
 assert.match(root,/published.current!==nextSnapshot/);
 assert.doesNotMatch(root,/await loadPortfolioHistory/);
});
