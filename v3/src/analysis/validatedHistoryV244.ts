import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";

/** Canonical broker dates: no invalid calendar normalization or intra-day cherry-picking. */
export const strictHistoryDate=(date:string):boolean=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const timestamp=Date.parse(date);
 return Number.isFinite(timestamp)&&new Date(timestamp).toISOString().slice(0,10)===date;
};
export const isWealthIndex=(xs:HistoryPoint[]):boolean=>xs.length>1&&xs.every(x=>x.portfolio!=null&&Number.isFinite(x.portfolio)&&x.portfolio>0)&&(xs.some(x=>x.portfolio!>=2)||(xs[0].portfolio!>=0.95&&xs[0].portfolio!<=1.05));
export type ValidatedHistory={points:HistoryPoint[];isPortfolioIndex:boolean;conflictingPortfolioDates:number;conflictingBenchmarkDates:number};
/** Portfolio duplicates disagreeing on value reject that whole date. Conflicting IMOEX rejects the quote, not the valid portfolio date. */
export function resolveValidatedHistory(history:HistoryPoint[]):ValidatedHistory{
 const dates=new Map<string,{portfolio:number;imoex:number|null;portfolioConflict:boolean;benchmarkConflict:boolean}>();
 for(const x of history){
  if(!strictHistoryDate(x.date)||typeof x.portfolio!=="number"||!Number.isFinite(x.portfolio)||x.portfolio<=0)continue;
  const benchmark=typeof x.imoex==="number"&&Number.isFinite(x.imoex)&&x.imoex>0?x.imoex:null;
  const prev=dates.get(x.date);
  if(!prev){dates.set(x.date,{portfolio:x.portfolio,imoex:benchmark,portfolioConflict:false,benchmarkConflict:false});continue}
  if(prev.portfolio!==x.portfolio)prev.portfolioConflict=true;
  if(benchmark!==null){
   if(prev.imoex!==null&&prev.imoex!==benchmark)prev.benchmarkConflict=true;
   else if(prev.imoex===null)prev.imoex=benchmark;
  }
 }
 const points:HistoryPoint[]=[...dates.entries()].filter(([,v])=>!v.portfolioConflict).sort(([a],[b])=>a.localeCompare(b)).map(([date,v])=>({date,portfolio:v.portfolio,imoex:v.benchmarkConflict?null:v.imoex,value:null,invested:null}));
 return{points,isPortfolioIndex:isWealthIndex(points),conflictingPortfolioDates:[...dates.values()].filter(v=>v.portfolioConflict).length,conflictingBenchmarkDates:[...dates.values()].filter(v=>!v.portfolioConflict&&v.benchmarkConflict).length};
}
