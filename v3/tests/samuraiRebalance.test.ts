import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/analysis/V3RebalanceWorkspace.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiRebalance.css",import.meta.url),"utf8");

test("Samurai exposes rebalancing as a sixth analysis chapter",()=>{
 assert.match(analysis,/sam-analysis-rebalance/);
 assert.match(analysis,/Ребалансировка/);
 assert.match(atlas,/Ребалансировка/);
});

test("rebalance target is user-authored and two-class complement is explicit",()=>{
 assert.match(ui,/Введите собственную целевую долю акций/);
 assert.match(ui,/100% минус доля акций/);
 assert.match(ui,/calculateAllocationDrift/);
 assert.match(ui,/calculateRebalanceScenario/);
});

test("rebalance workflow never generates instrument orders",()=>{
 assert.match(ui,/не формирует заявки на конкретные бумаги/);
 assert.match(ui,/без списка заявок/);
 assert.doesNotMatch(ui,/ticker.*deltaValue|order|limitOrder/i);
});

test("Samurai rebalance has mobile treatment",()=>{
 assert.match(css,/sam-rebalance__modes/);
 assert.match(css,/@media\(max-width:430px\)/);
});
