export type BondYieldItem={
 ticker:string;
 name:string;
 quantity:number|null;
 currentValue:number|null;
 cleanPricePct:number|null;
 dirtyPriceRub:number|null;
 nominalRub:number|null;
 aciPerBondRub:number|null;
 maturityDate:string|null;
 yearsToMaturity:number|null;
 ytmPct:number|null;
 ytmSource:"T_BANK_MARKET_VALUE"|"CASHFLOW_FALLBACK"|null;
 modifiedDuration:number|null;
 couponCount:number;
 floating:boolean;
 amortizing:boolean;
 perpetual:boolean;
 modelConfidence:"HIGH"|"MEDIUM"|"LOW";
 weightPct:number|null;
};

export type BondYieldPayload={
 available:boolean;
 version:string|null;
 source:string|null;
 generatedAt:string|null;
 stale?:boolean;
 warning?:string|null;
 summary:{
  bondCapital:number|null;
  issues:number;
  largestTicker:string|null;
  largestWeightPct:number|null;
  weightedYtmPct:number|null;
  weightedModifiedDuration:number|null;
  weightedMaturityYears:number|null;
  yieldCoveragePct:number|null;
  durationCoveragePct:number|null;
  maturityCoveragePct:number|null;
 }|null;
 maturityBuckets:Array<{key:string;label:string;value:number}>;
 rateScenarios:Array<{deltaPp:number;pricePct:number|null;rub:number|null}>;
 items:BondYieldItem[];
 coverage:{
  requested:number;
  resolved:number;
  yieldModeled:number;
  durationModeled:number;
  errors:Array<{ticker:string;error:string}>;
 }|null;
 note:string|null;
 reason:string|null;
};

function finite(value:unknown){
 const n=Number(value);
 return Number.isFinite(n)?n:null;
}
function text(value:unknown){
 const s=String(value??"").trim();
 return s||null;
}
function normalizeItem(raw:any):BondYieldItem|null{
 const ticker=text(raw?.ticker),name=text(raw?.name);
 if(!ticker||!name)return null;
 const source=text(raw?.ytmSource);
 return{
  ticker,name,
  quantity:finite(raw?.quantity),
  currentValue:finite(raw?.currentValue),
  cleanPricePct:finite(raw?.cleanPricePct),
  dirtyPriceRub:finite(raw?.dirtyPriceRub),
  nominalRub:finite(raw?.nominalRub),
  aciPerBondRub:finite(raw?.aciPerBondRub),
  maturityDate:text(raw?.maturityDate),
  yearsToMaturity:finite(raw?.yearsToMaturity),
  ytmPct:finite(raw?.ytmPct),
  ytmSource:source==="T_BANK_MARKET_VALUE"||source==="CASHFLOW_FALLBACK"?source:null,
  modifiedDuration:finite(raw?.modifiedDuration),
  couponCount:Math.max(0,Math.trunc(finite(raw?.couponCount)??0)),
  floating:Boolean(raw?.floating),
  amortizing:Boolean(raw?.amortizing),
  perpetual:Boolean(raw?.perpetual),
  modelConfidence:raw?.modelConfidence==="HIGH"||raw?.modelConfidence==="MEDIUM"?"HIGH"===raw.modelConfidence?"HIGH":"MEDIUM":"LOW",
  weightPct:finite(raw?.weightPct),
 };
}

export async function loadBondYieldDepth(signal?:AbortSignal):Promise<BondYieldPayload>{
 try{
  const response=await fetch("/api/shield/bonds",{cache:"no-store",signal});
  const raw=await response.json().catch(()=>null) as any;
  if(!response.ok||!raw||typeof raw!=="object")return{
   available:false,version:null,source:null,generatedAt:null,summary:null,maturityBuckets:[],rateScenarios:[],items:[],coverage:null,note:null,
   reason:text(raw?.error)||"Bond analytics source is unavailable.",
  };
  const items=(Array.isArray(raw.items)?raw.items:[]).map(normalizeItem).filter((x:BondYieldItem|null):x is BondYieldItem=>Boolean(x));
  const summaryRaw=raw.summary&&typeof raw.summary==="object"?raw.summary:null;
  const summary=summaryRaw?{
   bondCapital:finite(summaryRaw.bondCapital),
   issues:Math.max(0,Math.trunc(finite(summaryRaw.issues)??0)),
   largestTicker:text(summaryRaw.largestTicker),
   largestWeightPct:finite(summaryRaw.largestWeightPct),
   weightedYtmPct:finite(summaryRaw.weightedYtmPct),
   weightedModifiedDuration:finite(summaryRaw.weightedModifiedDuration),
   weightedMaturityYears:finite(summaryRaw.weightedMaturityYears),
   yieldCoveragePct:finite(summaryRaw.yieldCoveragePct),
   durationCoveragePct:finite(summaryRaw.durationCoveragePct),
   maturityCoveragePct:finite(summaryRaw.maturityCoveragePct),
  }:null;
  return{
   available:raw.available===true&&items.length>0,
   version:text(raw.version),
   source:text(raw.source),
   generatedAt:text(raw.generatedAt),
   stale:Boolean(raw.stale),
   warning:text(raw.warning),
   summary,
   maturityBuckets:(Array.isArray(raw.maturityBuckets)?raw.maturityBuckets:[]).flatMap((row:any)=>{
    const key=text(row?.key),label=text(row?.label),value=finite(row?.value);
    return key&&label&&value!=null?[{key,label,value}]:[];
   }),
   rateScenarios:(Array.isArray(raw.rateScenarios)?raw.rateScenarios:[]).flatMap((row:any)=>{
    const deltaPp=finite(row?.deltaPp);
    return deltaPp==null?[]:[{deltaPp,pricePct:finite(row?.pricePct),rub:finite(row?.rub)}];
   }),
   items,
   coverage:raw.coverage&&typeof raw.coverage==="object"?{
    requested:Math.max(0,Math.trunc(finite(raw.coverage.requested)??0)),
    resolved:Math.max(0,Math.trunc(finite(raw.coverage.resolved)??0)),
    yieldModeled:Math.max(0,Math.trunc(finite(raw.coverage.yieldModeled)??0)),
    durationModeled:Math.max(0,Math.trunc(finite(raw.coverage.durationModeled)??0)),
    errors:Array.isArray(raw.coverage.errors)?raw.coverage.errors.map((e:any)=>({ticker:text(e?.ticker)||"—",error:text(e?.error)||"error"})):[],
   }:null,
   note:text(raw.note),
   reason:null,
  };
 }catch(error){
  if(error instanceof DOMException&&error.name==="AbortError")throw error;
  return{available:false,version:null,source:null,generatedAt:null,summary:null,maturityBuckets:[],rateScenarios:[],items:[],coverage:null,note:null,reason:"Bond analytics source is unavailable."};
 }
}
