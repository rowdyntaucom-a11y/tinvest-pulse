import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
export type HistoryCoverageV203={available:boolean;rows:number;portfolioPoints:number;benchmarkPoints:number;overlapPoints:number;valuePoints:number;investedPoints:number;from:string|null;to:string|null;spanDays:number;medianGapDays:number|null;maxGapDays:number|null;reason:string|null};
const finite=(x:number|null)=>typeof x==="number"&&Number.isFinite(x);
const median=(x:number[])=>{if(!x.length)return null;const a=[...x].sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
export function buildHistoryCoverageV203(history:HistoryPoint[]):HistoryCoverageV203{
 const rows=[...history].filter(x=>Number.isFinite(Date.parse(x.date+"T00:00:00Z"))).sort((a,b)=>a.date.localeCompare(b.date));
 if(rows.length<2)return{available:false,rows:rows.length,portfolioPoints:0,benchmarkPoints:0,overlapPoints:0,valuePoints:0,investedPoints:0,from:rows[0]?.date??null,to:rows.at(-1)?.date??null,spanDays:0,medianGapDays:null,maxGapDays:null,reason:"Недостаточно дат истории."};
 const gaps=rows.slice(1).map((x,i)=>(Date.parse(x.date+"T00:00:00Z")-Date.parse(rows[i].date+"T00:00:00Z"))/86400000).filter(x=>Number.isFinite(x)&&x>=0);
 const portfolioPoints=rows.filter(x=>finite(x.portfolio)&&x.portfolio!>0).length,benchmarkPoints=rows.filter(x=>finite(x.imoex)&&x.imoex!>0).length;
 return{available:true,rows:rows.length,portfolioPoints,benchmarkPoints,overlapPoints:rows.filter(x=>finite(x.portfolio)&&x.portfolio!>0&&finite(x.imoex)&&x.imoex!>0).length,valuePoints:rows.filter(x=>finite(x.value)).length,investedPoints:rows.filter(x=>finite(x.invested)).length,from:rows[0].date,to:rows.at(-1)!.date,spanDays:gaps.reduce((a,b)=>a+b,0),medianGapDays:median(gaps),maxGapDays:gaps.length?Math.max(...gaps):null,reason:null}
}