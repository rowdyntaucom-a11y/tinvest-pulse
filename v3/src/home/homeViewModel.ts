import type{PortfolioSnapshot,HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{strictHistoryDate,resolveValidatedHistory}from"../analysis/validatedHistoryV244.ts";

export type V3HomePosition={
 ticker:string;
 name:string;
 weight:number;
 currentValue:number;
 expectedYield:number;
};

export type V3HomeViewModel={
 accountName:string;
 openedDate:string|null;
 value:number|null;
 profit:number|null;
 profitPct:number|null;
 passiveIncome:number|null;
 monthlyIncome:number|null;
 positions:number|null;
 twr:number|null;
 cagr:number|null;
 xirr:number|null;
 updatedAt:string|null;
 history:HistoryPoint[];
 leaders:V3HomePosition[];
 best:V3HomePosition|null;
 worst:V3HomePosition|null;
 isTrusted:boolean;
};

/**
 * A legacy decimal TWR observation is an already-computed cumulative return.
 * A positive rebased wealth index must instead be divided by its initial level.
 * Never treat a value near 1.0 as a 100% return.
 */
export function latestVerifiedTwr(history:HistoryPoint[]):number|null{
 const observed=new Map<string,number>();
 const conflicts=new Set<string>();
 for(const item of history){
  if(!strictHistoryDate(item.date)||typeof item.portfolio!=="number"||!Number.isFinite(item.portfolio))continue;
  const existing=observed.get(item.date);
  if(existing!==undefined&&existing!==item.portfolio)conflicts.add(item.date);
  else if(existing===undefined)observed.set(item.date,item.portfolio);
 }
 const ordered=[...observed.entries()].sort(([a],[b])=>a.localeCompare(b));
 if(ordered.length===0||conflicts.has(ordered.at(-1)![0]))return null;
 const {points,isPortfolioIndex}=resolveValidatedHistory(history);
 if(isPortfolioIndex){
  if(points.length<2||points.at(-1)!.date!==ordered.at(-1)![0])return null;
  const start=points[0].portfolio!,end=points.at(-1)!.portfolio!;
  if(start<=0||end<=0)return null;
  const result=end/start-1;
  return Number.isFinite(result)&&result>-0.99&&result<=5?result:null;
 }
 // A single observation close to 1.0 is ambiguous: it could be a rebased index.
 // Decimal returns require every valid observation to fall strictly below 95% in magnitude.
 const decimals=ordered.filter(([date])=>!conflicts.has(date)).map(([,value])=>value);
 if(decimals.length===0||decimals.some(v=>Math.abs(v)>=0.95))return null;
 return decimals.at(-1)!;
}

export function buildV3HomeViewModel(snapshot:PortfolioSnapshot,isTrusted:boolean):V3HomeViewModel{
 const visible=isTrusted&&snapshot.source!=="fallback";
 const positions=visible?[...snapshot.positionItems]:[];
 const history=visible?snapshot.history:[];
 const leaders=[...positions]
  .sort((a,b)=>b.currentValue-a.currentValue)
  .slice(0,3)
  .map(x=>({ticker:x.ticker,name:x.name,weight:x.weight,currentValue:x.currentValue,expectedYield:x.expectedYield}));
 const byResult=[...positions].sort((a,b)=>b.expectedYield-a.expectedYield);
 const map=(x:typeof positions[number]|undefined):V3HomePosition|null=>x?({
  ticker:x.ticker,name:x.name,weight:x.weight,currentValue:x.currentValue,expectedYield:x.expectedYield
 }):null;
 const openedDate=visible?(snapshot.accountContext?.openedDate??snapshot.startDate):null;
 return{
  accountName:snapshot.accountName||"Портфель",
  openedDate,
  value:visible?snapshot.value:null,
  profit:visible?snapshot.profit:null,
  profitPct:visible?snapshot.profitPct:null,
  passiveIncome:visible?snapshot.passiveIncome:null,
  monthlyIncome:visible?snapshot.averageMonthlyPassiveIncome:null,
  positions:visible?snapshot.positions:null,
  twr:visible?latestVerifiedTwr(history):null,
  cagr:visible?snapshot.cagr:null,
  xirr:visible?snapshot.xirr:null,
  updatedAt:visible?snapshot.updatedAt:null,
  history,
  leaders,
  best:map(byResult[0]),
  worst:map(byResult.at(-1)),
  isTrusted:visible
 };
}
