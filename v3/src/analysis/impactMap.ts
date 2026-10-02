import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

export type ImpactCell={
 key:string;ticker:string;name:string;weight:number;weightPct:number;pl:number;plPct:number|null;state:"positive"|"negative"|"flat";position:PositionSnapshot;
};
export type ImpactMap={cells:ImpactCell[];totalValue:number;totalAbsPl:number;positiveCount:number;negativeCount:number;flatCount:number};

export function buildImpactMap(positions:PositionSnapshot[]):ImpactMap{
 const rows=positions.filter(item=>Number.isFinite(item.currentValue)&&item.currentValue>0);
 const totalValue=rows.reduce((sum,item)=>sum+item.currentValue,0);
 const cells=rows.map(position=>{
  const weight=totalValue>0?position.currentValue/totalValue:0;
  const cost=position.costBasis>0?position.costBasis:null;
  const pl=Number.isFinite(position.expectedYield)?position.expectedYield:0;
  const plPct=cost&&cost>0?pl/cost*100:null;
  return{key:position.figi||position.instrumentUid||position.ticker,ticker:position.ticker,name:position.name,weight,weightPct:weight*100,pl,plPct,state:pl>0?"positive":pl<0?"negative":"flat",position}as ImpactCell;
 }).sort((a,b)=>b.weight-a.weight||Math.abs(b.pl)-Math.abs(a.pl)||a.ticker.localeCompare(b.ticker));
 return{
  cells,
  totalValue,
  totalAbsPl:cells.reduce((sum,item)=>sum+Math.abs(item.pl),0),
  positiveCount:cells.filter(item=>item.state==="positive").length,
  negativeCount:cells.filter(item=>item.state==="negative").length,
  flatCount:cells.filter(item=>item.state==="flat").length,
 };
}
