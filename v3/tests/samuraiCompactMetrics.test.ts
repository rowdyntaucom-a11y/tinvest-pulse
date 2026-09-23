import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const ui=readFileSync(new URL("../src/samurai/SamuraiPrototype.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiCompactMetrics.css",import.meta.url),"utf8");
const repair=readFileSync(new URL("../src/styles/samuraiHomeTelemetryRepair.css",import.meta.url),"utf8");
const dock=readFileSync(new URL("../src/styles/samuraiFormationDock.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
for(const x of["sam-world__pulse","sam-world__twr","sam-world__pulsemarks","sam-world__pulse-line"])assert.match(ui,new RegExp(x));
for(const x of["ЛИЧНАЯ","ВЫПЛАТЫ","В ПОРТФЕЛЕ"])assert.match(ui,new RegExp(x));
assert.doesNotMatch(ui,/sam-katana/);
assert.doesNotMatch(ui,/КЛИНОК СТРАТЕГИИ/);
assert.doesNotMatch(ui,/<b>74<\/b>/);
assert.match(css,/min-height:94px/);
assert.match(css,/font-size:9px/);
assert.match(dock,/sam-world__formation button:before/);
assert.match(dock,/data-shell="samurai"/);
assert.match(dock,/font-size:10px/);

assert.match(repair,/grid-template-columns:minmax\(0,.9fr\) minmax\(0,1.1fr\)!important/);
assert.match(repair,/position:relative!important;\s*right:auto!important;top:auto!important;width:auto!important;min-width:0!important/);
assert.match(repair,/grid-template-columns:minmax\(0,1fr\) auto!important/);
assert.match(repair,/sam-world__pulsemarks em\{\s*display:none!important/);
assert.match(repair,/overflow:hidden!important/);
assert.match(repair,/justify-self:end!important/);
assert.match(repair,/white-space:nowrap!important/);

assert.ok(main.indexOf("samuraiCompactMetrics.css")<main.indexOf("samuraiFormationDock.css"));
assert.ok(main.indexOf("samuraiChapterReforge.css")<main.indexOf("samuraiHomeTelemetryRepair.css"));
assert.ok(main.indexOf("samuraiHomeTelemetryRepair.css")<main.indexOf("mobilePerformance.css"));
console.log("samurai compact metrics regression: ok");