import type{PortfolioSnapshot,HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{calculateRelativePerformance}from"../../../v2/src/features/analytics/relativePerformance";

export type V3HomePosition={ticker:string;name:string;weight:number;currentValue:number;expectedYield:number};
export type V3HomeBenchmark={available:boolean;portfolioReturn:number|null;benchmarkReturn:number|null;excessReturn:number|null;overlapPoints:number;periodDays:number;integrity:"OK"|"CONFLICT"};
export type V3HomeViewModel={accountName:string;value:number|null;profit:number|null;profitPct:number|null;passiveIncome:number|null;monthlyIncome:number|null;positions:number|null;cagr:number|null;xirr:number|null;updatedAt:string|null;history:HistoryPoint[];benchmark:V3HomeBenchmark;leaders:V3HomePosition[];best:V3HomePosition|null;worst:V3HomePosition|null;isTrusted:boolean};

const emptyBenchmark:V3HomeBenchmark={available:false,portfolioReturn:null,benchmarkReturn:null,excessReturn:null,overlapPoints:0,periodDays:0,integrity:"OK"};

export function buildV3HomeViewModel(snapshot:PortfolioSnapshot,isTrusted:boolean):V3HomeViewModel{
  const visible=isTrusted&&snapshot.source!=="fallback",positions=visible?[...snapshot.positionItems]:[],history=visible?snapshot.history:[];
  const leaders=[...positions].sort((a,b)=>b.currentValue-a.currentValue).slice(0,3).map(x=>({ticker:x.ticker,name:x.name,weight:x.weight,currentValue:x.currentValue,expectedYield:x.expectedYield}));
  const byResult=[...positions].sort((a,b)=>b.expectedYield-a.expectedYield),map=(x:typeof positions[number]|undefined):V3HomePosition|null=>x?({ticker:x.ticker,name:x.name,weight:x.weight,currentValue:x.currentValue,expectedYield:x.expectedYield}):null;
  const relative=visible?calculateRelativePerformance(history.map(point=>({date:point.date,portfolio:point.portfolio,imoex:point.imoex}))):null;
  const benchmark:V3HomeBenchmark=relative?{available:relative.available,portfolioReturn:relative.portfolioReturn,benchmarkReturn:relative.benchmarkReturn,excessReturn:relative.excessReturn,overlapPoints:relative.overlapPoints,periodDays:relative.periodDays,integrity:relative.integrity}:emptyBenchmark;
  return{accountName:snapshot.accountName||"Портфель",value:visible?snapshot.value:null,profit:visible?snapshot.profit:null,profitPct:visible?snapshot.profitPct:null,passiveIncome:visible?snapshot.passiveIncome:null,monthlyIncome:visible?snapshot.averageMonthlyPassiveIncome:null,positions:visible?snapshot.positions:null,cagr:visible?snapshot.cagr:null,xirr:visible?snapshot.xirr:null,updatedAt:visible?snapshot.updatedAt:null,history,benchmark,leaders,best:map(byResult[0]),worst:map(byResult.at(-1)),isTrusted:visible};
}
