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
 const series=history.map(x=>x.portfolio).filter((x):x is number=>typeof x==="number"&&Number.isFinite(x));
 if(!series.length)return null;
 const latest=series[series.length-1];
 // Two historical contracts exist: legacy decimal TWR and the current rebased wealth index.
 // Decimal history is already a return. Index history is normalized to its first valid level.
 if(Math.abs(latest)<2&&series.every(x=>Math.abs(x)<2))return latest;
 if(series.length<2)return null;
 const base=series[0];
 if(base<=0||latest<=0)return null;
 const value=latest/base-1;
 // Historical reconstruction with missing prices must fail closed rather than publish an extreme result.
 return Number.isFinite(value)&&value>-0.99&&value<=5?value:null;
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
