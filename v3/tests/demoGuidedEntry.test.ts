import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const guide=readFileSync(new URL("../src/demo/V3DemoGuide.tsx",import.meta.url),"utf8"),main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8"),css=readFileSync(new URL("../src/styles/demoGuide.css",import.meta.url),"utf8");
assert.match(main,/V3DemoGuide/);assert.match(main,/styles\/demoGuide\.css/);const demoBody=main.slice(main.indexOf("function DemoRoot"),main.indexOf("function LiveRoot"));assert.match(demoBody,/<V3DemoGuide\/>/);assert.doesNotMatch(demoBody,/loadV3Portfolio|onRefresh|setInterval/);
assert.match(guide,/Сначала — Пульт/);assert.match(guide,/Потом — глубина/);assert.match(guide,/Когда будете готовы/);assert.match(guide,/href="\/v3\/"/);assert.match(guide,/синтетические данные не смешиваются/);assert.doesNotMatch(guide,/fetch\(|loadV3Portfolio|localStorage/);
assert.match(css,/bottom:calc\(76px \+ env\(safe-area-inset-bottom\)\)/);assert.match(css,/@media\(min-width:700px\)/);assert.match(css,/@media\(max-width:359px\)/);assert.doesNotMatch(css,/font-size:[789](?:\.\d+)?px/);
console.log("v3 guided demo entry contracts: ok");
