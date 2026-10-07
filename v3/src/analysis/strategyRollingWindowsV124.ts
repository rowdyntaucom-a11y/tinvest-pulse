import type{StrategyLabScenarioResult}from"./strategyHistoryLab";
export type RollingWindowV124={startDate:string;endDate:string;returnA:number;returnB:number;gap:number;leader:"A"|"B"|"tie"};
export type RollingComparisonV124={available:boolean;windowTradingDays:number;windows:RollingWindowV124[];aLeadShare:number|null;bLeadShare:number|null;tieShare:number|null;medianGap:number|null;bestA:RollingWindowV124|null;bestB:RollingWindowV124|null;reason:string|null};
const median=(v:number[])=>{if(!v.length)return null;const x=[...v].sort((a,b)=>a-b),m=Math.floor(x.length/2);return x.length%2?x[m]!:(x[m-1]!+x[m]!)/2};
export function buildRollingComparisonV124(a:StrategyLabScenarioResult|null,b:StrategyLabScenarioResult|null,windowTradingDays=63):RollingComparisonV124{
 const empty=(reason:string):RollingComparisonV124=>({available:false,windowTradingDays,windows:[],aLeadShare:null,bLeadShare:null,tieShare:null,medianGap:null,bestA:null,bestB:null,reason});
 if(!a?.available||!b?.available)return empty("Оба сценария должны быть доступны.");
 if(!Number.isInteger(windowTradingDays)||windowTradingDays<2)return empty("Некорректное окно.");
 const mapB=new Map(b.curve.map(x=>[x.date,x.value])),pairs=a.curve.filter(x=>mapB.has(x.date)).map(x=>({date:x.date,a:x.value,b:mapB.get(x.date)!})).filter(x=>x.a>0&&x.b>0);
 if(pairs.length<=windowTradingDays)return empty("Недостаточно общих точек для скользящего окна.");
 const windows:RollingWindowV124[]=[];for(let i=windowTradingDays;i<pairs.length;i++){const s=pairs[i-windowTradingDays]!,e=pairs[i]!,returnA=e.a/s.a-1,returnB=e.b/s.b-1,gap=returnA-returnB;windows.push({startDate:s.date,endDate:e.date,returnA,returnB,gap,leader:Math.abs(gap)<1e-10?"tie":gap>0?"A":"B"})}
 const n=windows.length,aN=windows.filter(x=>x.leader==="A").length,bN=windows.filter(x=>x.leader==="B").length,tN=n-aN-bN;
 return{available:true,windowTradingDays,windows,aLeadShare:aN/n,bLeadShare:bN/n,tieShare:tN/n,medianGap:median(windows.map(x=>x.gap)),bestA:[...windows].sort((x,y)=>y.gap-x.gap)[0]??null,bestB:[...windows].sort((x,y)=>x.gap-y.gap)[0]??null,reason:null};
}