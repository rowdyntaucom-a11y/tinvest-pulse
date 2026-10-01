import type{PayoutEvent,PayoutObservation}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";import{buildActualIncomeHistory}from"./actualIncomeHistory";import{buildPayoutAttribution}from"./payoutAttribution";import{buildPayoutRunway}from"./payoutRunway";

const clean=(v:unknown)=>String(v??"").trim();
const futureHigh=(e:PayoutEvent)=>String(e.status||"").toUpperCase()!=="FACT"&&String(e.confidence||"").toUpperCase()==="HIGH";
const finite=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?Math.max(0,v):0;

export type IncomeContinuityRow={figi:string;label:string;position:PositionSnapshot|null;actualNet:number;actualCount:number;futureGross:number;futureCount:number;nextDate:string|null};
export type IncomeContinuity={
 available:boolean;
 actualNet:number;
 actualGross:number;
 futureGross:number;
 actualCount:number;
 futureCount:number;
 continuingSources:number;
 actualSources:number;
 futureSources:number;
 actualOnlySources:number;
 futureOnlySources:number;
 continuingActualNet:number;
 continuingFutureGross:number;
 continuingActualShare:number|null;
 continuingFutureShare:number|null;
 lastActualDate:string|null;
 nextFutureDate:string|null;
 bridgeDays:number|null;
 actualCouponShare:number|null;
 futureCouponShare:number|null;
 rows:IncomeContinuityRow[];
};

export function buildIncomeContinuity(actualItems:PayoutEvent[],futureItems:PayoutEvent[],positions:PositionSnapshot[],observation:PayoutObservation|undefined,from:string|null|undefined,to:string|null|undefined):IncomeContinuity{
 const actual=buildActualIncomeHistory(actualItems,observation),futureEvents=futureItems.filter(futureHigh),attribution=buildPayoutAttribution(futureEvents,positions),runway=buildPayoutRunway(futureEvents,from,to);
 const actualByFigi=new Map<string,{label:string;net:number;count:number}>();
 for(const e of actualItems){const figi=clean(e.figi);if(!figi)continue;const row=actualByFigi.get(figi)??{label:e.ticker||e.name||figi,net:0,count:0};row.net+=finite(e.net);row.count++;actualByFigi.set(figi,row)}
 const futureByFigi=new Map<string,{label:string;position:PositionSnapshot|null;gross:number;count:number;nextDate:string|null}>();
 for(const row of attribution.rows){const figi=clean(row.position.figi);if(!figi)continue;futureByFigi.set(figi,{label:row.position.ticker||row.position.name||figi,position:row.position,gross:row.gross,count:row.count,nextDate:row.nextDate})}
 const keys=[...new Set([...actualByFigi.keys(),...futureByFigi.keys()])];
 const rows:IncomeContinuityRow[]=keys.map(figi=>{const a=actualByFigi.get(figi),f=futureByFigi.get(figi);return{figi,label:f?.label||a?.label||figi,position:f?.position??null,actualNet:a?.net??0,actualCount:a?.count??0,futureGross:f?.gross??0,futureCount:f?.count??0,nextDate:f?.nextDate??null}}).sort((a,b)=>(b.actualNet+b.futureGross)-(a.actualNet+a.futureGross)||a.label.localeCompare(b.label));
 const continuing=rows.filter(r=>r.actualCount>0&&r.futureCount>0),actualOnly=rows.filter(r=>r.actualCount>0&&r.futureCount===0),futureOnly=rows.filter(r=>r.futureCount>0&&r.actualCount===0);
 const continuingActualNet=continuing.reduce((s,r)=>s+r.actualNet,0),continuingFutureGross=continuing.reduce((s,r)=>s+r.futureGross,0);
 const actualDates=actualItems.map(e=>String(e.date||"").slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort(),futureDates=futureEvents.map(e=>String(e.date||"").slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
 const lastActualDate=actualDates.at(-1)??null,nextFutureDate=futureDates[0]??null;
 const bridgeDays=lastActualDate&&nextFutureDate?Math.max(0,Math.floor((Date.parse(nextFutureDate+"T00:00:00Z")-Date.parse(lastActualDate+"T00:00:00Z"))/86400000)):null;
 return{available:Boolean(actual.available||futureEvents.length),actualNet:actual.totalNet,actualGross:actual.totalGross,futureGross:attribution.confirmedGross,actualCount:actual.count,futureCount:attribution.confirmedCount,continuingSources:continuing.length,actualSources:actualByFigi.size,futureSources:futureByFigi.size,actualOnlySources:actualOnly.length,futureOnlySources:futureOnly.length,continuingActualNet,continuingFutureGross,continuingActualShare:actual.totalNet>0?continuingActualNet/actual.totalNet*100:null,continuingFutureShare:attribution.confirmedGross>0?continuingFutureGross/attribution.confirmedGross*100:null,lastActualDate,nextFutureDate,bridgeDays,actualCouponShare:actual.couponShare,futureCouponShare:runway.totalGross>0?runway.couponGross/runway.totalGross*100:null,rows};
}
