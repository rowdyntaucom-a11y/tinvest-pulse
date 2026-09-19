import type{AssetHistoryPoint}from"../../../v2/src/lib/assetHistoryApi";

export type V3AssetRiskSummary={
  points:number;
  sampleFrom:string;
  sampleTo:string;
  spanDays:number|null;
  minValue:number;
  maxValue:number;
  rangePct:number|null;
  maxDrawdownPct:number|null;
  maxDrawdownPeakDate:string|null;
  maxDrawdownTroughDate:string|null;
  currentDrawdownPct:number|null;
};

const dayMs=86_400_000;
const time=(date:string)=>{const t=Date.parse(date+"T00:00:00Z");return Number.isFinite(t)?t:null};

export function summarizeAssetRisk(points:AssetHistoryPoint[]):V3AssetRiskSummary|null{
  const rows=points.filter(point=>Number.isFinite(point.value)&&point.value>0&&time(point.date)!=null).slice().sort((a,b)=>a.date.localeCompare(b.date));
  if(rows.length<2)return null;
  let peak=rows[0].value,peakDate=rows[0].date,maxDrawdownPct=0,maxDrawdownPeakDate:string|null=null,maxDrawdownTroughDate:string|null=null;
  for(const row of rows){
    if(row.value>peak){peak=row.value;peakDate=row.date}
    const drawdown=row.value/peak-1;
    if(drawdown<maxDrawdownPct){maxDrawdownPct=drawdown;maxDrawdownPeakDate=peakDate;maxDrawdownTroughDate=row.date}
  }
  const minValue=Math.min(...rows.map(x=>x.value)),maxValue=Math.max(...rows.map(x=>x.value)),last=rows.at(-1)!,latestPeak=Math.max(...rows.map(x=>x.value));
  const start=time(rows[0].date),end=time(last.date);
  return{
    points:rows.length,
    sampleFrom:rows[0].date,
    sampleTo:last.date,
    spanDays:start!=null&&end!=null?Math.round((end-start)/dayMs):null,
    minValue,
    maxValue,
    rangePct:minValue>0?maxValue/minValue-1:null,
    maxDrawdownPct:maxDrawdownPct<0?maxDrawdownPct:null,
    maxDrawdownPeakDate,
    maxDrawdownTroughDate,
    currentDrawdownPct:latestPeak>0?last.value/latestPeak-1:null,
  };
}
