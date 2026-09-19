import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";

export type V3HistoryWindow="90d"|"180d"|"365d"|"all";

export const V3_HISTORY_WINDOWS=[
  {id:"90d",label:"3М",days:90},
  {id:"180d",label:"6М",days:180},
  {id:"365d",label:"1Г",days:365},
  {id:"all",label:"Всё",days:null},
]as const satisfies readonly{id:V3HistoryWindow;label:string;days:number|null}[];

const time=(value:string)=>{const n=new Date(value).getTime();return Number.isFinite(n)?n:null};

export function filterHistoryWindow(points:HistoryPoint[],window:V3HistoryWindow){
  if(window==="all"||points.length<2)return points;
  const spec=V3_HISTORY_WINDOWS.find(x=>x.id===window);
  if(!spec?.days)return points;
  const dated=points.map(point=>({point,t:time(point.date)})).filter((x):x is{point:HistoryPoint;t:number}=>x.t!=null);
  if(dated.length<2)return points;
  const anchor=Math.max(...dated.map(x=>x.t)),cutoff=anchor-spec.days*86_400_000,filtered=dated.filter(x=>x.t>=cutoff).map(x=>x.point);
  return filtered.length>=2?filtered:dated.slice(-2).map(x=>x.point);
}

export type V3HistoryValueSummary={
  points:number;
  startValue:number;
  endValue:number;
  deltaValue:number;
  deltaPct:number|null;
  minValue:number;
  maxValue:number;
  investedStart:number|null;
  investedEnd:number|null;
  investedDelta:number|null;
};

export function summarizeHistoryValue(points:HistoryPoint[]):V3HistoryValueSummary|null{
  const values=points.filter(x=>x.value!=null);
  if(values.length<2)return null;
  const startValue=values[0].value!,endValue=values.at(-1)!.value!,invested=points.filter(x=>x.invested!=null);
  const investedStart=invested[0]?.invested??null,investedEnd=invested.at(-1)?.invested??null;
  return{
    points:values.length,
    startValue,
    endValue,
    deltaValue:endValue-startValue,
    deltaPct:startValue!==0?(endValue/startValue-1)*100:null,
    minValue:Math.min(...values.map(x=>x.value!)),
    maxValue:Math.max(...values.map(x=>x.value!)),
    investedStart,
    investedEnd,
    investedDelta:investedStart!=null&&investedEnd!=null?investedEnd-investedStart:null,
  };
}
