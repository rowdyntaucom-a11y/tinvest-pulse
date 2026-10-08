import fs from"node:fs";import assert from"node:assert/strict";
const src=fs.readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
assert.match(src,/aria-haspopup="dialog"/);assert.match(src,/aria-modal="true"/);assert.match(src,/Escape/);assert.match(src,/role="tablist"/);assert.match(src,/aria-selected/);assert.match(src,/aria-live="polite"/);
console.log("analytics continuity guards ok");
