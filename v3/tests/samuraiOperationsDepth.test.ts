import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const assets=readFileSync(new URL("../src/assets/V3Assets.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/operations/V3OperationsDepth.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiOperationsDepth.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");

test("Samurai adds operations and integrity as real vertical chapters",()=>{
 assert.match(assets,/sam-assets-operations/);
 assert.match(assets,/sam-assets-integrity/);
 assert.match(assets,/V3OperationsDepth/);
 assert.match(ui,/06 · ОПЕРАЦИИ/);
 assert.match(ui,/07 · ЦЕЛОСТНОСТЬ СОБЫТИЙ/);
 assert.match(css,/sam-ops-depth__rows/);
});

test("demo never opens the live operations endpoint",()=>{
 assert.match(assets,/shell==="samurai"&&allowAssetWorkspace&&<V3OperationsDepth/);
});

test("fail-closed atlas advertises the workflow without fake operation values",()=>{
 assert.match(atlas,/Операции/);
 assert.match(atlas,/Целостность/);
 assert.doesNotMatch(atlas,/\d+[\s\u00A0]*₽/);
});

test("corporate-action completeness remains explicitly unverified",()=>{
 assert.match(ui,/Отдельный реестр корпоративных действий пока не подключён/);
 assert.match(ui,/полнота не утверждается по одному журналу операций/);
 assert.ok(main.includes('import"./styles/samuraiOperationsDepth.css"'));
});
