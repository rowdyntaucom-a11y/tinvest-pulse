import type{AssetHistoryPoint}from"../../../v2/src/lib/assetHistoryApi";

export type V3AssetHistoryGeometry={
  min:number;
  max:number;
  coords:Array<{x:number;y:number}>;
  line:string;
  area:string;
};

const time=(date:string)=>{const value=Date.parse(date+"T00:00:00Z");return Number.isFinite(value)?value:null};

export function buildAssetHistoryGeometry(points:AssetHistoryPoint[]):V3AssetHistoryGeometry|null{
  if(points.length<2)return null;
  const times=points.map(point=>time(point.date));
  if(times.some(value=>value==null))return null;
  const firstTime=times[0]!,lastTime=times.at(-1)!;
  if(lastTime<=firstTime)return null;
  const min=Math.min(...points.map(point=>point.value)),max=Math.max(...points.map(point=>point.value));
  if(!Number.isFinite(min)||!Number.isFinite(max)||min<=0||max<=0)return null;
  const timeSpan=lastTime-firstTime,valueSpan=Math.max(1e-9,max-min);
  const coords=points.map((point,index)=>({
    x:4+((times[index]!-firstTime)/timeSpan)*92,
    y:42-((point.value-min)/valueSpan)*34,
  }));
  const line=coords.map(point=>`${point.x},${point.y}`).join(" ");
  return{min,max,coords,line,area:`4,44 ${line} 96,44`};
}
