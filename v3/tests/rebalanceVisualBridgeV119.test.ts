import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const workspace=readFileSync(new URL("../src/analysis/V3RebalanceWorkspace.tsx",import.meta.url),"utf8");
const bridge=readFileSync(new URL("../src/analysis/V3RebalanceVisualBridgeV119.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/rebalanceVisualBridgeV119.css",import.meta.url),"utf8");

test("rebalance workspace mounts the visual bridge only for an available calculated scenario",()=>{
 assert.match(workspace,/V3RebalanceVisualBridgeV119/);
 assert.match(workspace,/scenario\?\.available/);
 assert.match(workspace,/drift=\{drift\} scenario=\{scenario\}/);
 assert.match(bridge,/if\(!drift\.available\|\|!scenario\.available/);
});

test("visual bridge reads the existing deterministic scenario instead of recalculating methodology",()=>{
 assert.match(bridge,/row\.currentValue\/scenario\.assignedValueBefore/);
 assert.match(bridge,/targetShare:row\.targetWeight/);
 assert.match(bridge,/deltaMagnitude:Math\.abs\(row\.deltaValue\)/);
 assert.match(bridge,/scenario\.minimumFlowForExactTarget/);
 assert.match(bridge,/scenario\.requestedFlow/);
 assert.match(bridge,/scenario\.unassignedWeight/);
 assert.match(bridge,/До → целевая структура/);
 assert.match(bridge,/После заданного потока/);
 assert.match(bridge,/Текущая доля и цель/);
 assert.match(bridge,/Масштаб изменений по классам/);
});

test("direction constraints stay explicit for add and withdraw scenarios",()=>{
 assert.match(bridge,/scenario\.mode==="ADD_CAPITAL"\?row\.deltaValue<0/);
 assert.match(bridge,/scenario\.mode==="WITHDRAW_CAPITAL"\?row\.deltaValue>0/);
 assert.match(bridge,/есть конфликт направления/);
 assert.match(bridge,/не превращает его в инструкцию по сделкам/);
 assert.match(bridge,/не предложение изменить портфель/);
 assert.doesNotMatch(bridge,/placeOrder|sendOrder|brokerWrite|buySignal|sellSignal|targetPrice|targetYield/);
});

test("rebalance bridge is collision-free and mobile deterministic",()=>{
 assert.doesNotMatch(bridge,/<svg|<circle/);
 assert.match(css,/grid-template-columns:1fr auto 1fr 1fr/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:430px\)/);
 assert.match(css,/content-visibility:auto/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
