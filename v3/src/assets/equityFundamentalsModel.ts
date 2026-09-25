import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{AssetFundamentalMetricKey,AssetFundamentalsSnapshot}from"../../../v2/src/features/portfolio/assetFundamentals";

export type EquityFundamentalRow={position:PositionSnapshot;snapshot:AssetFundamentalsSnapshot};

export type EquityFundamentalCoverage={
 equityCapital:number;
 verifiedCapital:number;
 companies:number;
 verifiedCompanies:number;
 capitalCoveragePct:number|null;
};

export function isEquityPosition(position:PositionSnapshot){
 const type=String(position.instrumentType||"").toLowerCase();
 return type.includes("share")||type.includes("stock")||type.includes("equity");
}

export function fundamentalMetric(snapshot:AssetFundamentalsSnapshot,key:AssetFundamentalMetricKey){
 return snapshot.metrics.find(metric=>metric.key===key)??null;
}

export function buildEquityFundamentalCoverage(rows:EquityFundamentalRow[]):EquityFundamentalCoverage{
 const equityCapital=rows.reduce((sum,row)=>sum+Math.max(0,row.position.currentValue),0);
 const verified=rows.filter(row=>row.snapshot.available&&row.snapshot.source==="T_INVEST");
 const verifiedCapital=verified.reduce((sum,row)=>sum+Math.max(0,row.position.currentValue),0);
 return{
  equityCapital,
  verifiedCapital,
  companies:rows.length,
  verifiedCompanies:verified.length,
  capitalCoveragePct:equityCapital>0?verifiedCapital/equityCapital*100:null,
 };
}

export function metricCapitalCoveragePct(rows:EquityFundamentalRow[],key:AssetFundamentalMetricKey){
 const total=rows.reduce((sum,row)=>sum+Math.max(0,row.position.currentValue),0);
 if(!(total>0))return null;
 const covered=rows.reduce((sum,row)=>{
  const metric=fundamentalMetric(row.snapshot,key);
  return metric?.value==null?sum:sum+Math.max(0,row.position.currentValue);
 },0);
 return covered/total*100;
}
