import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import type{BenchmarkPeriodComparison}from"./benchmarkPeriodsV244.ts";
import{resolveValidatedHistory}from"./validatedHistoryV244.ts";
export type ChartPoint={date:string;portfolio:number;imoex:number;x:number;yPortfolio:number;yImoex:number};
export type BenchmarkChart={points:ChartPoint[];portfolioSegments:string[];imoexSegments:string[];referenceY:number;min:number;max:number;startDate:string;endDate:string;gapCount:number};
const WIDTH=620,HEIGHT=210,LEFT=48,RIGHT=16,TOP=15,BOTTOM=31,DAY=86400000;
const millis=(date:string)=>Date.parse(date+"T00:00:00.000Z");
const fixed=(n:number)=>n.toFixed(2);
/** A graph is permitted only for the exact period validated by the financial engine. */
export function buildBenchmarkChart(history:HistoryPoint[],comparison:BenchmarkPeriodComparison):BenchmarkChart|null{
 if(comparison.status!=="ok"||!comparison.startDate||!comparison.endDate||comparison.points<2)return null;
 const valid=resolveValidatedHistory(history);
 if(!valid.isPortfolioIndex)return null;
 const paired=valid.points.filter(p=>p.date>=comparison.startDate!&&p.date<=comparison.endDate!&&p.portfolio!=null&&p.portfolio>0&&p.imoex!=null&&p.imoex>0&&Number.isFinite(p.portfolio)&&Number.isFinite(p.imoex));
 if(paired.length!==comparison.points||paired.length<2||paired[0].date!==comparison.startDate||paired.at(-1)!.date!==comparison.endDate)return null;
 const baseP=paired[0].portfolio!,baseI=paired[0].imoex!;
 const values=paired.map(p=>({date:p.date,portfolio:p.portfolio!/baseP*100,imoex:p.imoex!/baseI*100}));
 if(values.some(v=>!Number.isFinite(v.portfolio)||!Number.isFinite(v.imoex)||v.portfolio<=0||v.imoex<=0))return null;
 const rawMin=Math.min(100,...values.map(v=>Math.min(v.portfolio,v.imoex))),rawMax=Math.max(100,...values.map(v=>Math.max(v.portfolio,v.imoex)));
 const padding=Math.max((rawMax-rawMin)*0.1,1);const min=Math.max(0,rawMin-padding),max=rawMax+padding;
 const start=millis(comparison.startDate),end=millis(comparison.endDate);if(end<=start||max<=min)return null;
 const y=(value:number)=>TOP+(max-value)/(max-min)*(HEIGHT-TOP-BOTTOM);
 const points=values.map(v=>({date:v.date,portfolio:v.portfolio,imoex:v.imoex,x:LEFT+(millis(v.date)-start)/(end-start)*(WIDTH-LEFT-RIGHT),yPortfolio:y(v.portfolio),yImoex:y(v.imoex)}));
 // Break the line at substantial calendar gaps: no invented continuous performance across missing months.
 const paths=(key:"yPortfolio"|"yImoex")=>{const segments:string[]=[];let segment="";for(let i=0;i<points.length;i++){const current=points[i],gap=i>0&&(millis(current.date)-millis(points[i-1].date))/DAY>45;if(i===0||gap){if(segment)segments.push(segment);segment="M"+fixed(current.x)+" "+fixed(current[key])}else segment+=" L"+fixed(current.x)+" "+fixed(current[key])}if(segment)segments.push(segment);return segments};
 return{points,portfolioSegments:paths("yPortfolio"),imoexSegments:paths("yImoex"),referenceY:y(100),min,max,startDate:comparison.startDate,endDate:comparison.endDate,gapCount:points.slice(1).filter((pt,i)=>(millis(pt.date)-millis(points[i].date))/DAY>45).length};
}
