import type{DriftResult}from"../../../v2/src/features/analytics/drift";
import type{RebalanceScenarioResult}from"../../../v2/src/features/analytics/rebalanceScenarios";

export type RebalanceVisualBridgeRowV119=RebalanceScenarioResult["rows"][number]&{
 currentShare:number;
 targetShare:number;
 deltaMagnitude:number;
};

export type RebalanceVisualBridgeModelV119={
 rows:RebalanceVisualBridgeRowV119[];
 absoluteDelta:number;
 displayedMovement:number;
 displayedMovementLabel:"внутренний перенос"|"Σ |дельт|";
 maxDelta:number;
 minimum:number|null;
 thresholdMax:number;
 thresholdGap:number|null;
 directionConflict:RebalanceVisualBridgeRowV119[];
 coverage:number;
};

export function buildRebalanceVisualBridgeModelV119(drift:DriftResult,scenario:RebalanceScenarioResult):RebalanceVisualBridgeModelV119|null{
 if(!drift.available||!scenario.available||scenario.assignedValueBefore<=0||scenario.assignedValueAfter==null||scenario.rows.length!==drift.rows.length)return null;
 const rows=scenario.rows.map(row=>({
  ...row,
  currentShare:row.currentValue/scenario.assignedValueBefore,
  targetShare:row.targetWeight,
  deltaMagnitude:Math.abs(row.deltaValue),
 }));
 const absoluteDelta=rows.reduce((sum,row)=>sum+row.deltaMagnitude,0);
 const displayedMovement=scenario.mode==="REBALANCE_EXISTING"?absoluteDelta/2:absoluteDelta;
 const displayedMovementLabel=scenario.mode==="REBALANCE_EXISTING"?"внутренний перенос":"Σ |дельт|";
 const maxDelta=Math.max(1,...rows.map(row=>row.deltaMagnitude));
 const minimum=scenario.minimumFlowForExactTarget;
 const thresholdMax=scenario.mode==="REBALANCE_EXISTING"?1:Math.max(1,scenario.requestedFlow,minimum??0);
 const thresholdGap=scenario.mode==="REBALANCE_EXISTING"||minimum==null?null:scenario.requestedFlow-minimum;
 const directionConflict=rows.filter(row=>scenario.mode==="ADD_CAPITAL"?row.direction==="DECREASE":scenario.mode==="WITHDRAW_CAPITAL"?row.direction==="INCREASE":false);
 const coverage=Math.max(0,Math.min(1,1-scenario.unassignedWeight));
 return{rows,absoluteDelta,displayedMovement,displayedMovementLabel,maxDelta,minimum,thresholdMax,thresholdGap,directionConflict,coverage};
}
