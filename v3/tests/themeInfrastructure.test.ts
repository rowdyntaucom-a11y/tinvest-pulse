import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const stylesUrl=new URL("../src/styles/",import.meta.url);
const read=(name:string)=>readFileSync(new URL(name,stylesUrl),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
const shellWorlds=read("shellWorlds.css");
const workspace=read("workspaceWorldFinish.css");
const systems=read("fullShellSystems.css");
const mobile=read("mobilePerformance.css");
const cssFiles=readdirSync(stylesUrl).filter(name=>name.endsWith(".css"));
const allCss=cssFiles.map(name=>({name,source:read(name)}));

const finalOrder=["workspaceWorldFinish.css","fullShellSystems.css","mobilePerformance.css"];
let cursor=-1;
for(const file of finalOrder){
  const token=`import"./styles/${file}";`;
  assert.equal(main.split(token).length-1,1,`${file} must have exactly one owner/import`);
  const next=main.indexOf(token);
  assert.ok(next>cursor,`${file} is out of final cascade order`);
  cursor=next;
}
assert.equal(main.slice(cursor).match(/import"\.\/styles\//g)?.length??0,1,"mobile performance must be the final stylesheet");

for(const shell of["samurai","carbon","core","horizon","aurora","minimal"]){
  assert.match(systems,new RegExp(`data-shell="${shell}"`),`${shell} has no shell identity`);
  assert.match(workspace,new RegExp(`data-shell="${shell}"\\]:not\\(\\[data-workspace="home"\\]\\)`),`${shell} has no workspace tokens`);
}

assert.doesNotMatch(shellWorlds,/Workspace material coherence v14/,"legacy workspace override generation returned to shellWorlds");
assert.equal(allCss.filter(({source})=>source.includes("--shell-font:")).map(({name})=>name).join(),"fullShellSystems.css","typography tokens need one shell owner");
assert.equal(allCss.filter(({source})=>source.includes("--v3-deep-card:")).map(({name})=>name).join(),"workspaceWorldFinish.css","workspace material tokens need one owner");

assert.match(mobile,/Responsive\/performance ownership boundary/);
assert.match(mobile,/@media\(max-width:699px\)/);
assert.match(mobile,/backdrop-filter:none!important/);
assert.match(mobile,/-webkit-backdrop-filter:none!important/);
assert.match(mobile,/overflow-x:hidden/);
assert.match(mobile,/touch-action:manipulation/);
assert.doesNotMatch(mobile,/data-workspace="dna"\]\s+:is/,"mobile boundary must not take ownership of DNA internals");

for(const {name,source} of allCss){
  assert.doesNotMatch(source,/transition\s*:\s*all(?:\s|;)/i,`${name} introduced transition: all`);
}
assert.doesNotMatch(systems,/animation\s*:/,"shell identity must remain animation-free");

const app=readFileSync(new URL("../src/app/V3App.tsx",import.meta.url),"utf8");
assert.equal((app.match(/<V3DnaWorkspace/g)??[]).length,1,"DNA must retain one React workspace owner");

console.log("theme infrastructure regression: ok");
