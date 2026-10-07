import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const ui=readFileSync(new URL("../src/operations/V3OperationsDepth.tsx",import.meta.url),"utf8");
for(const token of[
"V3OperationsDailyV186","V3OperationsTradeFlowV187","V3OperationsFeeDepthV188","V3OperationsInstrumentActivityV189",
"V3OperationsCadenceV190","V3OperationsCashBridgeV191","V3OperationsRecencyV192","V3OperationsTypeBreadthV193"
])assert.ok(ui.includes(token),token);
for(const name of["operationsDailyV186","operationsTradeFlowV187","operationsFeeDepthV188","operationsInstrumentActivityV189","operationsCadenceV190","operationsCashBridgeV191","operationsRecencyV192","operationsTypeBreadthV193"]){
 const s=readFileSync(new URL("../src/operations/"+name+".ts",import.meta.url),"utf8");
 assert.doesNotMatch(s,/Math\.random|\bbuy signal\b|\bsell signal\b|рекоменд(овать|ация)/i,name);
}
assert.match(ui,/не является дневником рыночной доходности и не заменяет TWR\/XIRR/);
console.log("operations depth v186-v193 integration tests passed");