import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const gate=readFileSync(new URL("../src/cosmos/CosmosTrustGate.tsx",import.meta.url),"utf8");
const mobile=readFileSync(new URL("../src/styles/mobilePerformance.css",import.meta.url),"utf8");

test("Cosmos fail-closed modules and instrument live inside the art scene",()=>{
 const sceneStart=gate.indexOf('<section className="cos-gate__scene">');
 const sceneEnd=gate.indexOf('</section>',sceneStart);
 const instrument=gate.indexOf('className="cos-gate__instrument"',sceneStart);
 const modules=gate.indexOf('className="cos-gate__modules"',sceneStart);
 assert.ok(sceneStart>=0);
 assert.ok(instrument>sceneStart&&instrument<sceneEnd);
 assert.ok(modules>sceneStart&&modules<sceneEnd);
});

test("final mobile Cosmos tab stage is in normal flow and fills the first viewport",()=>{
 const marker=mobile.lastIndexOf("Cosmos Tabs Art Stage v4");
 assert.ok(marker>=0);
 const css=mobile.slice(marker);
 assert.match(css,/\.cos-gate__scene\{[^]*position:relative!important/);
 assert.match(css,/height:calc\(100svh - 50px\)!important/);
 assert.match(css,/url\("\/assets\/themes\/cosmos-mixc-master\.webp"\)/);
 assert.match(css,/\.cos-gate__modules\{[^]*bottom:82px!important/);
 assert.match(css,/\.cos-gate__panel,[^]*margin:7px 10px 0!important/);
});
