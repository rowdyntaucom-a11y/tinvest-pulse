import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const root=new URL("../src/",import.meta.url);
const read=(path:string)=>readFileSync(new URL(path,root),"utf8");
const main=read("main.tsx");
const mobile=read("styles/mobilePerformance.css");
const navigation=read("styles/navigation6.css");
const composition=read("styles/shellComposition.css");
const systems=read("styles/fullShellSystems.css");
const app=read("app/V3App.tsx");
const dnaFiles=["dna/V3DnaWorkspace.tsx","dna/V3WorldStage.tsx","dna/runtime/worldRoot.ts"];

assert.ok(main.indexOf('import"./styles/mobilePerformance.css"')>main.indexOf('import"./styles/shellComposition.css"'),"responsive/performance owner must stay last");
assert.match(mobile,/html,body,#root\{[^}]*overflow-x:hidden/);
assert.doesNotMatch(mobile,/min-width:\s*(?:3[2-9]\d|[4-9]\d\d)px/,"responsive owner must not impose a phone-width floor");
assert.match(mobile,/overflow-wrap:anywhere/);
assert.match(mobile,/padding-bottom:max\(104px,calc\(92px \+ env\(safe-area-inset-bottom\)\)\)/);

assert.match(navigation,/bottom:max\(8px,env\(safe-area-inset-bottom\)\)/);
assert.match(navigation,/height:64px!important;max-height:64px!important/);
assert.match(mobile,/\.v3-nav button[^}]*min-width:0/);
assert.match(mobile,/\.v3-controls>button[^}]*min-height:44px/);
assert.match(mobile,/\.v3-world-trigger/);
assert.match(mobile,/\.v3-section-selector select/);

const phoneBlock=mobile.slice(mobile.indexOf("@media(max-width:699px)"));
assert.match(phoneBlock,/\.v3-app:not\(\[data-workspace="dna"\]\)[^\{]*\*::before[^\{]*\*::after/);
assert.match(phoneBlock,/backdrop-filter:none!important/);
assert.match(phoneBlock,/-webkit-backdrop-filter:none!important/);
assert.doesNotMatch(phoneBlock,/animation\s*:/,"responsive corrections must not add phone animation");
assert.doesNotMatch(phoneBlock,/filter\s*:(?!none)/,"responsive corrections must not add phone filters");

for(const shell of ["samurai","carbon","core","horizon","aurora","minimal"]){
  assert.match(composition,new RegExp(`data-shell="${shell}"`),`${shell} mobile composition identity disappeared`);
  assert.match(systems,new RegExp(`data-shell="${shell}"`),`${shell} shell identity disappeared`);
}
assert.match(composition,/@media\(max-width:699px\)/);
assert.match(composition,/@media\(prefers-reduced-motion:reduce\)/);

assert.equal((app.match(/<V3DnaWorkspace/g)??[]).length,1,"a second DNA workspace owner appeared");
const dnaSources=dnaFiles.map(read).join("\n");
assert.equal((dnaSources.match(/new Application\s*\(/g)??[]).length,1,"a second Pixi Application appeared");
assert.equal((dnaSources.match(/\.ticker\.add\s*\(/g)??[]).length,1,"a second Pixi ticker callback appeared");

for(const name of readdirSync(new URL("styles/",root)).filter(name=>name.endsWith(".css"))){
  assert.doesNotMatch(read(`styles/${name}`),/transition\s*:\s*all(?:\s|;)/i,`${name} uses transition: all`);
}

console.log("responsive architecture regression: ok");
