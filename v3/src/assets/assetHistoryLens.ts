import type{AssetHistoryPoint}from"../../../v2/src/lib/assetHistoryApi";import{V3_HISTORY_WINDOWS,type V3HistoryWindow}from"../history/historyLens";

const time=(value:string)=>{const n=new Date(value+"T00:00:00Z").getTime();return Number.isFinite(n)?n:null};

export function filterAssetHistoryWindow(points:AssetHistoryPoint[],window:V3HistoryWindow){
  if(window==="all"||points.length<2)return points;
  const spec=V3_HISTORY_WINDOWS.find(x=>x.id===window);
  if(!spec?.days)return points;
  const dated=points.map(point=>({point,t:time(point.date)})).filter((x):x is{point:AssetHistoryPoint;t:number}=>x.t!=null);
  if(dated.length<2)return points;
  const anchor=Math.max(...dated.map(x=>x.t)),cutoff=anchor-spec.days*86_400_000,filtered=dated.filter(x=>x.t>=cutoff).map(x=>x.point);
  return filtered.length>=2?filtered:dated.slice(-2).map(x=>x.point);
}

export function summarizeAssetHistory(points:AssetHistoryPoint[]){
  if(points.length<2)return null;
  const first=points[0].value,last=points.at(-1)!.value,values=points.map(x=>x.value);
  return{first,last,change:first!==0?(last/first-1)*100:null,min:Math.min(...values),max:Math.max(...values),points:points.length,startDate:points[0].date,endDate:points.at(-1)!.date};
}
