import type{BenchmarkChart,ChartPoint}from"./benchmarkChartV246.ts";

export type ChartInspection={
 index:number;date:string;portfolioLevel:number;imoexLevel:number;
 portfolioReturnPct:number;imoexReturnPct:number;alphaPp:number;
 previousDate:string|null;intervalDays:number|null;
 intervalPortfolioPct:number|null;intervalImoexPct:number|null;
 gapWarning:boolean;
};
const DAY_MS=86400000;
const utcDate=(date:string)=>Date.parse(date+"T00:00:00.000Z");
/** Inspected points are always actual synchronized market observations, never interpolations. */
export function inspectBenchmarkDate(chart:BenchmarkChart|null,requestedDate:string|null):ChartInspection|null{
 if(!chart||chart.points.length<2)return null;
 const index=requestedDate===null?-1:chart.points.findIndex(point=>point.date===requestedDate);
 const actual=index>=0?index:chart.points.length-1;
 const point=chart.points[actual],prior=actual>0?chart.points[actual-1]:null;
 const days=prior?(utcDate(point.date)-utcDate(prior.date))/DAY_MS:null;
 return{
  index:actual,date:point.date,portfolioLevel:point.portfolio,imoexLevel:point.imoex,
  portfolioReturnPct:point.portfolio-100,imoexReturnPct:point.imoex-100,
  alphaPp:point.portfolio-point.imoex,
  previousDate:prior?.date??null,intervalDays:days,
  intervalPortfolioPct:prior?(point.portfolio/prior.portfolio-1)*100:null,
  intervalImoexPct:prior?(point.imoex/prior.imoex-1)*100:null,
  gapWarning:days!==null&&days>45
 };
}
/** Binary-search nearest verified observation. Sorted x values come from strict chronological dates. */
export function nearestBenchmarkPointIndex(points:ChartPoint[],x:number):number{
 if(!points.length)return -1;
 if(!Number.isFinite(x))return points.length-1;
 if(x<=points[0].x)return 0;
 if(x>=points.at(-1)!.x)return points.length-1;
 let low=0,high=points.length-1;
 while(low<high){const mid=Math.floor((low+high)/2);if(points[mid].x<x)low=mid+1;else high=mid}
 const previous=low-1;
 return x-points[previous].x<=points[low].x-x?previous:low;
}
/** Bound chart dot DOM even when a portfolio contains many years of daily prices. */
export function sampleBenchmarkMarkers(points:ChartPoint[],limit=96):ChartPoint[]{
 if(!points.length||!Number.isFinite(limit)||limit<=0)return[];
 const count=Math.max(2,Math.floor(limit));
 if(points.length<=count)return points;
 const chosen:ChartPoint[]=[];
 for(let i=0;i<count;i++)chosen.push(points[Math.round(i*(points.length-1)/(count-1))]);
 return chosen;
}
/** Formula-safe, UTF-8 spreadsheet export containing only validated synchronized observations. */
export function benchmarkChartToCsv(chart:BenchmarkChart|null):string|null{
 if(!chart||chart.points.length<2)return null;
 if(chart.points[0].date!==chart.startDate||chart.points.at(-1)!.date!==chart.endDate)return null;
 const lines=[
  ["QVANIX · сравнение с IMOEX"],
  ["Период",chart.startDate+" — "+chart.endDate],
  ["База","100 = начало общего периода"],
  [],
  ["Дата","Портфель, индекс","IMOEX, индекс","Доходность портфеля, %","Доходность IMOEX, %","Опережение, п.п."]
 ];
 for(const point of chart.points){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(point.date)||![point.portfolio,point.imoex].every(Number.isFinite))return null;
  lines.push([point.date,String(point.portfolio),String(point.imoex),String(point.portfolio-100),String(point.imoex-100),String(point.portfolio-point.imoex)]);
 }
 const cell=(s:string)=>'"'+s.replace(/"/g,'""')+'"';
 return"\uFEFF"+lines.map(row=>row.map(cell).join(";")).join("\r\n")+"\r\n";
}
