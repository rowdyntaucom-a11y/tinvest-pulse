import type{PortfolioSnapshot,HistoryPoint}from"../../../v2/src/lib/portfolioApi";

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

function latestVerifiedTwr(history:HistoryPoint[]){
 for(let i=history.length-1;i>=0;i--){
  const value=history[i]?.portfolio;
  if(typeof value==="number"&&Number.isFinite(value))return value;
 }
 return null;
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
