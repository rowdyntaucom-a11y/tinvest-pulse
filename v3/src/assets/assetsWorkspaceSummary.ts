import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

export type AssetsWorkspaceSummary={
 total:number;
 basis:number;
 pnl:number;
 pnlPct:number|null;
 positionCount:number;
 positiveCount:number;
 negativeCount:number;
 flatCount:number;
 top1:number|null;
 top3:number|null;
 effectiveCount:number|null;
 largest:PositionSnapshot|null;
 mosaic:PositionSnapshot[];
};

export function buildAssetsWorkspaceSummary(items:PositionSnapshot[]):AssetsWorkspaceSummary{
 const active=items.filter(item=>Number.isFinite(item.currentValue)&&item.currentValue>0);
 const total=active.reduce((sum,item)=>sum+item.currentValue,0);
 const basis=active.reduce((sum,item)=>sum+(Number.isFinite(item.costBasis)&&item.costBasis>0?item.costBasis:0),0);
 const pnl=active.reduce((sum,item)=>sum+(Number.isFinite(item.expectedYield)?item.expectedYield:0),0);
 const ranked=[...active].sort((a,b)=>b.currentValue-a.currentValue);
 const shares=ranked.map(item=>total>0?item.currentValue/total:0);
 const hhi=shares.reduce((sum,value)=>sum+value*value,0);
 return{
  total,basis,pnl,pnlPct:basis>0?pnl/basis*100:null,
  positionCount:active.length,
  positiveCount:active.filter(item=>item.expectedYield>0).length,
  negativeCount:active.filter(item=>item.expectedYield<0).length,
  flatCount:active.filter(item=>item.expectedYield===0).length,
  top1:shares.length?shares[0]:null,
  top3:shares.length?shares.slice(0,3).reduce((sum,value)=>sum+value,0):null,
  effectiveCount:hhi>0?1/hhi:null,
  largest:ranked[0]??null,
  mosaic:ranked.slice(0,8),
 };
}
