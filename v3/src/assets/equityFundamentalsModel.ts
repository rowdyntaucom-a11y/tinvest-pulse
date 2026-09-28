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

export type EquityPortfolioDiagnostics={
 equityCapital:number;companies:number;top1CapitalShare:number|null;top3CapitalShare:number|null;
 profitableCapitalShare:number|null;profitableCoverageShare:number|null;
 positiveFcfCapitalShare:number|null;positiveFcfCoverageShare:number|null;
 dividendCapitalShare:number|null;dividendCoverageShare:number|null;
 leverageCapitalShare:number|null;leverageCoverageShare:number|null;
};

function capital(row:EquityFundamentalRow){return Math.max(0,Number(row.position.currentValue)||0)}
function metricValue(row:EquityFundamentalRow,key:AssetFundamentalMetricKey){return fundamentalMetric(row.snapshot,key)?.value??null}
function diagnostic(rows:EquityFundamentalRow[],key:AssetFundamentalMetricKey,predicate:(value:number)=>boolean,total:number){
 let covered=0,matching=0;
 for(const row of rows){const value=metricValue(row,key),valueCapital=capital(row);if(value==null)continue;covered+=valueCapital;if(predicate(value))matching+=valueCapital}
 return{portfolio:total>0?matching/total:null,coverage:total>0?covered/total:null};
}
export function buildEquityPortfolioDiagnostics(rows:EquityFundamentalRow[]):EquityPortfolioDiagnostics{
 const equityCapital=rows.reduce((sum,row)=>sum+capital(row),0);
 const weights=rows.map(capital).sort((a,b)=>b-a);
 const profitable=diagnostic(rows,"netIncomeTtm",value=>value>0,equityCapital);
 const fcf=diagnostic(rows,"freeCashFlowTtm",value=>value>0,equityCapital);
 const dividend=diagnostic(rows,"dividendYield",value=>value>0,equityCapital);
 const leverage=diagnostic(rows,"netDebtToEbitda",()=>true,equityCapital);
 return{
  equityCapital,companies:rows.length,
  top1CapitalShare:equityCapital>0?(weights[0]??0)/equityCapital:null,
  top3CapitalShare:equityCapital>0?weights.slice(0,3).reduce((sum,value)=>sum+value,0)/equityCapital:null,
  profitableCapitalShare:profitable.portfolio,profitableCoverageShare:profitable.coverage,
  positiveFcfCapitalShare:fcf.portfolio,positiveFcfCoverageShare:fcf.coverage,
  dividendCapitalShare:dividend.portfolio,dividendCoverageShare:dividend.coverage,
  leverageCapitalShare:leverage.portfolio,leverageCoverageShare:leverage.coverage,
 };
}
