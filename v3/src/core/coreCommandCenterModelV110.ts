import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3IncomeModel}from"../income/V3Income";

export type CommandCenterPoint={x:number;y:number;value:number;invested:number|null;date:string};
export type CommandCenterPosition={ticker:string;name:string;value:number;weight:number;pnl:number;pnlPct:number|null;impactPct:number};
export type CommandCenterClass={key:"Акции"|"Облигации"|"Другое";value:number;share:number};
export type CommandCenterModel={
 total:number;profit:number;profitPct:number|null;positiveCapital:number;negativeCapital:number;flatCapital:number;
 positiveShare:number;negativeShare:number;flatShare:number;top3Share:number;top5Share:number;effectiveCount:number|null;
 currentDrawdown:number|null;maxDrawdown:number|null;peakValue:number|null;capitalDelta:number|null;investedDelta:number|null;
 curve:CommandCenterPoint[];positions:CommandCenterPosition[];classes:CommandCenterClass[];
 incomeTotal:number|null;incomeMonthly:number|null;incomeAnnual:number|null;incomeAnnualShare:number|null;incomeFlowMonths:number|null;
 trusted:boolean;historyReady:boolean;
};

const classOf=(row:PositionSnapshot):CommandCenterClass["key"]=>{const t=(row.instrumentType||"").toLowerCase();return t.includes("bond")?"Облигации":t.includes("share")||t.includes("stock")?"Акции":"Другое"};
const finite=(value:unknown):value is number=>typeof value==="number"&&Number.isFinite(value);

export function buildCommandCenterModelV110(positions:PositionSnapshot[],history:HistoryPoint[],income:V3IncomeModel):CommandCenterModel{
 const valid=positions.filter(row=>finite(row.currentValue)&&row.currentValue>0);
 const total=valid.reduce((sum,row)=>sum+row.currentValue,0);
 const profit=valid.reduce((sum,row)=>sum+(finite(row.expectedYield)?row.expectedYield:0),0);
 const costBasis=total-profit;
 const profitPct=costBasis>0?profit/costBasis*100:null;
 const positiveCapital=valid.filter(row=>finite(row.expectedYield)&&row.expectedYield>0).reduce((sum,row)=>sum+row.currentValue,0);
 const negativeCapital=valid.filter(row=>finite(row.expectedYield)&&row.expectedYield<0).reduce((sum,row)=>sum+row.currentValue,0);
 const flatCapital=Math.max(0,total-positiveCapital-negativeCapital);
 const rank=[...valid].sort((a,b)=>b.currentValue-a.currentValue);
 const top3Share=total?rank.slice(0,3).reduce((sum,row)=>sum+row.currentValue,0)/total*100:0;
 const top5Share=total?rank.slice(0,5).reduce((sum,row)=>sum+row.currentValue,0)/total*100:0;
 const weights=total?valid.map(row=>row.currentValue/total):[];
 const hhi=weights.reduce((sum,w)=>sum+w*w,0),effectiveCount=hhi>0?1/hhi:null;
 const classes=(['Акции','Облигации','Другое'] as const).map(key=>{const value=valid.filter(row=>classOf(row)===key).reduce((sum,row)=>sum+row.currentValue,0);return{key,value,share:total?value/total*100:0}}).filter(row=>row.value>0);
 const positionRows=rank.slice(0,8).map(row=>{const basis=row.currentValue-(finite(row.expectedYield)?row.expectedYield:0);return{ticker:row.ticker||"—",name:row.name||row.ticker||"—",value:row.currentValue,weight:total?row.currentValue/total*100:0,pnl:finite(row.expectedYield)?row.expectedYield:0,pnlPct:basis>0&&finite(row.expectedYield)?row.expectedYield/basis*100:null,impactPct:total&&finite(row.expectedYield)?row.expectedYield/total*100:0}});
 const hist=history.filter(point=>finite(point.value)&&point.value>0);
 let peak=0,maxDd=0,currentDd:number|null=null,peakValue:number|null=null;
 for(const point of hist){peak=Math.max(peak,point.value!);const dd=peak>0?(point.value!-peak)/peak*100:0;maxDd=Math.min(maxDd,dd);peakValue=Math.max(peakValue??0,point.value!)}
 if(hist.length&&peak>0)currentDd=(hist.at(-1)!.value!-peak)/peak*100;
 const values=hist.map(point=>point.value!),min=Math.min(...values,0),max=Math.max(...values,1),span=Math.max(1,max-min);
 const curve=hist.map((point,index)=>({x:hist.length<2?50:index/(hist.length-1)*100,y:94-(point.value!-min)/span*84,value:point.value!,invested:finite(point.invested)?point.invested:null,date:point.date}));
 const first=hist[0],last=hist.at(-1),capitalDelta=first&&last?last.value!-first.value!:null;
 const firstInvested=first&&finite(first.invested)?first.invested:null,lastInvested=last&&finite(last.invested)?last.invested:null,investedDelta=firstInvested!=null&&lastInvested!=null?lastInvested-firstInvested:null;
 const incomeTotal=income.trusted&&finite(income.total)?income.total:null,incomeMonthly=income.trusted&&finite(income.monthly)?income.monthly:null,incomeAnnual=income.trusted&&finite(income.annual)?income.annual:null;
 const incomeAnnualShare=incomeAnnual!=null&&total>0?incomeAnnual/total*100:null,incomeFlowMonths=incomeTotal!=null&&incomeMonthly!=null&&incomeMonthly>0?incomeTotal/incomeMonthly:null;
 return{total,profit,profitPct,positiveCapital,negativeCapital,flatCapital,positiveShare:total?positiveCapital/total*100:0,negativeShare:total?negativeCapital/total*100:0,flatShare:total?flatCapital/total*100:0,top3Share,top5Share,effectiveCount,currentDrawdown,maxDrawdown:maxDd,peakValue,capitalDelta,investedDelta,curve,positions:positionRows,classes,incomeTotal,incomeMonthly,incomeAnnual,incomeAnnualShare,incomeFlowMonths,trusted:income.trusted&&total>0,historyReady:hist.length>=2};
}
