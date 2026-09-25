import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

export type PortfolioReportRow={
 key:string;
 label:string;
 currentValue:number;
 costBasis:number;
 pnl:number;
 share:number;
 positionCount:number;
};

export type PortfolioReportSlice={
 rows:PortfolioReportRow[];
 unclassifiedValue:number;
 unclassifiedCostBasis:number;
 unclassifiedPnl:number;
 coverageRatio:number|null;
};

export type PortfolioReportModel={
 totalValue:number;
 totalCostBasis:number;
 totalPnl:number;
 totalPositions:number;
 category:PortfolioReportSlice;
 currency:PortfolioReportSlice;
};

function finite(value:number){return Number.isFinite(value)?value:0}
function positive(value:number){const n=finite(value);return n>0?n:0}
function reportPnl(position:PositionSnapshot){return finite(position.expectedYield)}
function normalizeLabel(value:unknown){
 const text=String(value??"").trim();
 return text||null;
}
function reportAssetClass(type:unknown){
 const value=String(type??"").toLowerCase();
 if(value.includes("share")||value.includes("stock"))return{key:"shares",label:"Акции"};
 if(value.includes("bond"))return{key:"bonds",label:"Облигации"};
 if(value.includes("etf")||value.includes("fund"))return{key:"funds",label:"Фонды"};
 if(value.includes("currenc"))return{key:"currency",label:"Валюта"};
 if(value.includes("future"))return{key:"futures",label:"Фьючерсы"};
 return{key:"other",label:"Другое"};
}

type Classifier=(position:PositionSnapshot)=>{key:string;label:string}|null;

function buildSlice(positions:PositionSnapshot[],totalValue:number,classifier:Classifier):PortfolioReportSlice{
 const groups=new Map<string,{label:string;currentValue:number;costBasis:number;pnl:number;positionCount:number}>();
 let unclassifiedValue=0,unclassifiedCostBasis=0,unclassifiedPnl=0;
 for(const position of positions){
  const currentValue=positive(position.currentValue);
  const costBasis=positive(position.costBasis);
  const pnl=reportPnl(position);
  const bucket=classifier(position);
  if(!bucket){
   unclassifiedValue+=currentValue;
   unclassifiedCostBasis+=costBasis;
   unclassifiedPnl+=pnl;
   continue;
  }
  const existing=groups.get(bucket.key)??{label:bucket.label,currentValue:0,costBasis:0,pnl:0,positionCount:0};
  existing.currentValue+=currentValue;
  existing.costBasis+=costBasis;
  existing.pnl+=pnl;
  existing.positionCount+=1;
  groups.set(bucket.key,existing);
 }
 const rows=[...groups.entries()].map(([key,row])=>({
  key,
  ...row,
  share:totalValue>0?row.currentValue/totalValue:0,
 })).sort((a,b)=>b.currentValue-a.currentValue||a.label.localeCompare(b.label,"ru"));
 const classified=rows.reduce((sum,row)=>sum+row.currentValue,0);
 return{
  rows,
  unclassifiedValue,
  unclassifiedCostBasis,
  unclassifiedPnl,
  coverageRatio:totalValue>0?classified/totalValue:null,
 };
}

export function buildPortfolioReport(positions:PositionSnapshot[]):PortfolioReportModel{
 const usable=positions.filter(position=>Number.isFinite(position.currentValue)&&position.currentValue>0);
 const totalValue=usable.reduce((sum,row)=>sum+positive(row.currentValue),0);
 const totalCostBasis=usable.reduce((sum,row)=>sum+positive(row.costBasis),0);
 const totalPnl=usable.reduce((sum,row)=>sum+reportPnl(row),0);

 const category=buildSlice(usable,totalValue,position=>reportAssetClass(position.instrumentType));
 const currency=buildSlice(usable,totalValue,position=>{
  const raw=normalizeLabel(position.bond?.currency);
  if(!raw)return null;
  const key=raw.toUpperCase();
  return{key,label:key};
 });

 return{totalValue,totalCostBasis,totalPnl,totalPositions:usable.length,category,currency};
}
