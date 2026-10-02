import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

export type AnalysisWorkspaceSummary={available:boolean;positionCount:number;positiveCount:number;negativeCount:number;flatCount:number;positiveWeight:number;negativeWeight:number;top3Weight:number;largest:PositionSnapshot|null;largestWeight:number|null;maxDrawdownPct:number|null;effectivePositions:number|null;historyPoints:number;historyDays:number;historyIntegrity:string};

const finite=(value:number|null|undefined)=>typeof value==="number"&&Number.isFinite(value)?value:null;

export function buildAnalysisWorkspaceSummary({positions,maxDrawdown,effectivePositions,historyPoints,historyDays,historyIntegrity}:{positions:PositionSnapshot[];maxDrawdown:number|null|undefined;effectivePositions:number|null|undefined;historyPoints:number;historyDays:number;historyIntegrity:string}):AnalysisWorkspaceSummary{
 const active=positions.filter(position=>position.currentValue>0);
 const ranked=[...active].sort((a,b)=>b.currentValue-a.currentValue);
 const positive=active.filter(position=>position.expectedYield>0),negative=active.filter(position=>position.expectedYield<0);
 const top3Weight=ranked.slice(0,3).reduce((sum,position)=>sum+(finite(position.weight)??0),0);
 const largest=ranked[0]??null;
 const maxDrawdownValue=finite(maxDrawdown);
 return{
  available:active.length>0||historyPoints>0,
  positionCount:active.length,
  positiveCount:positive.length,
  negativeCount:negative.length,
  flatCount:active.length-positive.length-negative.length,
  positiveWeight:positive.reduce((sum,position)=>sum+(finite(position.weight)??0),0),
  negativeWeight:negative.reduce((sum,position)=>sum+(finite(position.weight)??0),0),
  top3Weight,
  largest,
  largestWeight:largest?finite(largest.weight):null,
  maxDrawdownPct:maxDrawdownValue==null?null:-maxDrawdownValue*100,
  effectivePositions:finite(effectivePositions),
  historyPoints:Number.isFinite(historyPoints)?Math.max(0,historyPoints):0,
  historyDays:Number.isFinite(historyDays)?Math.max(0,historyDays):0,
  historyIntegrity:String(historyIntegrity||"UNKNOWN"),
 };
}
