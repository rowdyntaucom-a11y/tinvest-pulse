import type{AssetHistorySeries}from"../../../v2/src/lib/assetHistoryApi";

export type DiscoveryWindow=3|6|12;
export type FallenAssetRow={
 key:string;
 label:string;
 instrumentId:string|null;
 observations:number;
 from:string;
 to:string;
 latest:number;
 high:number;
 low:number;
 drawdownFromHigh:number;
 reboundFromLow:number;
 windowReturn:number|null;
 maxDrawdown:number;
 sma20:number|null;
 sma50:number|null;
 sma200:number|null;
 distanceSma50:number|null;
 distanceSma200:number|null;
 bucket:"DEEP_30"|"DOWN_20"|"DOWN_10"|"NEAR_HIGH";
};
export type FallenAssetScan={
 rows:FallenAssetRow[];
 rejected:number;
 window:DiscoveryWindow;
};

function mean(values:number[],period:number){
 if(values.length<period)return null;
 const tail=values.slice(-period);
 return tail.reduce((sum,value)=>sum+value,0)/period;
}
function maxDrawdown(values:number[]){
 if(values.length<2)return 0;
 let peak=values[0],worst=0;
 for(const value of values){
  if(value>peak)peak=value;
  if(peak>0)worst=Math.min(worst,value/peak-1);
 }
 return worst;
}
function filterWindow(series:AssetHistorySeries,months:DiscoveryWindow){
 const points=series.points;
 if(points.length<2)return points;
 const end=Date.parse(points.at(-1)!.date+"T00:00:00.000Z");
 const cutoff=new Date(end);
 cutoff.setUTCMonth(cutoff.getUTCMonth()-months);
 const key=cutoff.toISOString().slice(0,10);
 const rows=points.filter(point=>point.date>=key);
 return rows.length>=2?rows:points.slice(-2);
}
function bucket(drawdown:number):FallenAssetRow["bucket"]{
 if(drawdown<=-.30)return"DEEP_30";
 if(drawdown<=-.20)return"DOWN_20";
 if(drawdown<=-.10)return"DOWN_10";
 return"NEAR_HIGH";
}

export function scanFallenAssets(series:AssetHistorySeries[],window:DiscoveryWindow):FallenAssetScan{
 const rows:FallenAssetRow[]=[];
 let rejected=0;
 for(const item of series){
  if(item.integrity!=="VALID"){rejected++;continue}
  const points=filterWindow(item,window);
  if(points.length<2){rejected++;continue}
  const values=points.map(point=>point.value).filter(value=>Number.isFinite(value)&&value>0);
  if(values.length<2){rejected++;continue}
  const latest=values.at(-1)!;
  const high=Math.max(...values),low=Math.min(...values);
  const drawdownFromHigh=latest/high-1;
  const reboundFromLow=latest/low-1;
  const first=values[0];
  const sma20=mean(values,20),sma50=mean(values,50),sma200=mean(values,200);
  rows.push({
   key:item.key,label:item.label,instrumentId:item.instrumentId,
   observations:values.length,from:points[0].date,to:points.at(-1)!.date,
   latest,high,low,drawdownFromHigh,reboundFromLow,
   windowReturn:first>0?latest/first-1:null,maxDrawdown:maxDrawdown(values),
   sma20,sma50,sma200,
   distanceSma50:sma50&&sma50>0?latest/sma50-1:null,
   distanceSma200:sma200&&sma200>0?latest/sma200-1:null,
   bucket:bucket(drawdownFromHigh),
  });
 }
 rows.sort((a,b)=>a.drawdownFromHigh-b.drawdownFromHigh||a.label.localeCompare(b.label,"ru"));
 return{rows,rejected,window};
}
