import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const app=readFileSync(new URL("../src/app/V3App.tsx",import.meta.url),"utf8");
const pulse=readFileSync(new URL("../src/pulse/V3PulseMode.tsx",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
assert.match(app,/loadV3PulseMode=\(\)=>import\("\.\.\/pulse\/V3PulseMode"\)/);assert.match(app,/V3PulseMode=lazy\(loadV3PulseMode\)/);
assert.match(app,/label="Пульс"/);assert.match(app,/V3WorkspaceLoading/);
assert.match(pulse,/import"\.\.\/styles\/pulseMode\.css"/);
assert.doesNotMatch(main,/pulseMode\.css/);
console.log("v3 Pulse lazy JS/CSS boundary: ok");
