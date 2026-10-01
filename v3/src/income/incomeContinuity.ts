import type{PayoutEvent,PayoutObservation}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

const clean=(v:unknown)=>String(v??"").trim();
const finite=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?Math.max(0,v):0;
const futureHigh=(e:PayoutEvent)=>String(e.status||"").toUpperCase()!=="FACT"&&String(e.confidence||"").toUpperCase()==="HIGH";

export type IncomeContinuityRow={figi:string;label:string;position:PositionSnapshot|null;actualNet:number;actualCount:number;futureGross:number;futureCount:number;nextDate:string|null};
export type IncomeContinuity={
 available:boolean;actualNet:number;actualGross:number;futureGross:number;actualCount:number;futureCount:number;
 continuingSources:number;actualSources:number;futureSources:number;actualOnlySources:number;futureOnlySources:number;
 continuingActualNet:number;continuingFutureGross:number;continuingActualShare:number|null;continuingFutureShare:number|null;
 lastActualDate:string|null;nextFutureDate:string|null;bridgeDays:number|null;actualCouponShare:number|null;futureCouponShare:number|null;rows:IncomeContinuityRow[];
};

export function buildIncomeContinuity(actualItems:PayoutEvent[],futureItems:PayoutEvent[],positions:PositionSnapshot[],observation:PayoutObservation|undefined,_from:string|null|undefined,_to:string|null|undefined):IncomeContinuity{
 const actualByFigi=new Map<string,{label:string;net:number;count:number}>();let actualNet=0,actualGross=0,actualCoupon=0,actualDividend=0;
 for(const e of actualItems){const n=finite(e.net);actualNet+=n;actualGross+=finite(e.gross);const kind=String(e.kind||"").toUpperCase();if(kind==="COUPON")actualCoupon+=n;else if(kind==="DIVIDEND")actualDividend+=n;const figi=clean(e.figi);if(!figi)continue;const row=actualByFigi.get(figi)??{label:e.ticker||e.name||figi,net:0,count:0};row.net+=n;row.count++;actualByFigi.set(figi,row)}
 const uniquePositions=new Map<string,PositionSnapshot|null>();for(const p of positions){const figi=clean(p.figi);if(!figi)continue;if(uniquePositions.has(figi))uniquePositions.set(figi,null);else uniquePositions.set(figi,p)}
 const futureByFigi=new Map<string,{label:string;position:PositionSnapshot|null;gross:number;count:number;nextDate:string|null}>();let futureGross=0,futureCount=0,futureCoupon=0,futureDividend=0;
 const futureEvents=futureItems.filter(futureHigh);
 for(const e of futureEvents){const g=finite(e.gross);futureGross+=g;futureCount++;const kind=String(e.kind||"").toUpperCase();if(kind==="COUPON")futureCoupon+=g;else if(kind==="DIVIDEND")futureDividend+=g;const figi=clean(e.figi);if(!figi)continue;const position=uniquePositions.get(figi);if(!position)continue;const row=futureByFigi.get(figi)??{label:position.ticker||position.name||figi,position,gross:0,count:0,nextDate:null};row.gross+=g;row.count++;if(!row.nextDate||String(e.date)<row.nextDate)row.nextDate=String(e.date||"");futureByFigi.set(figi,row)}
 const keys=[...new Set([...actualByFigi.keys(),...futureByFigi.keys()])];
 const rows:IncomeContinuityRow[]=keys.map(figi=>{const a=actualByFigi.get(figi),f=futureByFigi.get(figi);return{figi,label:f?.label||a?.label||figi,position:f?.position??null,actualNet:a?.net??0,actualCount:a?.count??0,futureGross:f?.gross??0,futureCount:f?.count??0,nextDate:f?.nextDate??null}}).sort((a,b)=>(b.actualNet+b.futureGross)-(a.actualNet+a.futureGross)||a.label.localeCompare(b.label));
 const continuing=rows.filter(x=>x.actualCount>0&&x.futureCount>0),actualOnly=rows.filter(x=>x.actualCount>0&&x.futureCount===0),futureOnly=rows.filter(x=>x.futureCount>0&&x.actualCount===0);
 const continuingActualNet=continuing.reduce((s,x)=>s+x.actualNet,0),continuingFutureGross=continuing.reduce((s,x)=>s+x.futureGross,0);
 const actualDates=actualItems.map(e=>String(e.date||"").slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort(),futureDates=futureEvents.map(e=>String(e.date||"").slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
 const lastActualDate=actualDates.at(-1)??null,nextFutureDate=futureDates[0]??null,bridgeDays=lastActualDate&&nextFutureDate?Math.max(0,Math.floor((Date.parse(nextFutureDate+"T00:00:00Z")-Date.parse(lastActualDate+"T00:00:00Z"))/86400000)):null;
 const actualTyped=actualCoupon+actualDividend,futureTyped=futureCoupon+futureDividend;
 return{available:Boolean(actualItems.length||futureEvents.length||observation?.available),actualNet,actualGross,futureGross,actualCount:actualItems.length,futureCount,continuingSources:continuing.length,actualSources:actualByFigi.size,futureSources:futureByFigi.size,actualOnlySources:actualOnly.length,futureOnlySources:futureOnly.length,continuingActualNet,continuingFutureGross,continuingActualShare:actualNet>0?continuingActualNet/actualNet*100:null,continuingFutureShare:futureGross>0?continuingFutureGross/futureGross*100:null,lastActualDate,nextFutureDate,bridgeDays,actualCouponShare:actualTyped>0?actualCoupon/actualTyped*100:null,futureCouponShare:futureTyped>0?futureCoupon/futureTyped*100:null,rows};
}
