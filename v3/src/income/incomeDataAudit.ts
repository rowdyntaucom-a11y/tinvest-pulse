import type{PayoutCalendar,PayoutEvent}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

const finite=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:0;
const clean=(v:unknown)=>String(v??"").trim();
const high=(e:PayoutEvent)=>String(e.status||"").toUpperCase()!=="FACT"&&String(e.confidence||"").toUpperCase()==="HIGH";
export type IncomeDataAudit={
 available:boolean;stale:boolean;integrityComplete:boolean;minimumCoverage:number;scheduleCoverage:number;eligibleAssets:number;resolvedAssets:number;coverageErrors:number;
 couponIdentityCoverage:number|null;couponScheduleEvents:number;couponScheduleIdentified:number;
 actualCount:number;actualObservedNet:number;actualDeclaredNet:number;actualNetDelta:number;actualFigiCount:number;actualFigiEventShare:number|null;actualFigiNet:number;actualFigiNetShare:number|null;
 observationAvailable:boolean;observationCompleteMonths:number;observationPartialMonths:number;observationTotalMonths:number;observationCompleteShare:number|null;
 highCount:number;highGross:number;highFigiCount:number;highFigiEventShare:number|null;highExactPositionCount:number;highExactPositionShare:number|null;highExactPositionGross:number;highExactPositionGrossShare:number|null;
 forecastDeclaredGross:number;forecastVsHighGrossDelta:number;generatedAt:string|null;warning:string|null;note:string|null;
};
export function buildIncomeDataAudit(calendar:PayoutCalendar,positions:PositionSnapshot[]):IncomeDataAudit{
 const actual=calendar.actual.items??[],future=(calendar.events??[]).filter(high);
 const actualObservedNet=actual.reduce((s,e)=>s+finite(e.net),0),actualFigi=actual.filter(e=>clean(e.figi)),actualFigiNet=actualFigi.reduce((s,e)=>s+finite(e.net),0);
 const unique=new Map<string,PositionSnapshot|null>();for(const p of positions){const f=clean(p.figi);if(!f)continue;if(unique.has(f))unique.set(f,null);else unique.set(f,p)}
 const highGross=future.reduce((s,e)=>s+Math.max(0,finite(e.gross)),0),highFigi=future.filter(e=>clean(e.figi)),exact=future.filter(e=>{const f=clean(e.figi);return f&&unique.get(f)!=null}),exactGross=exact.reduce((s,e)=>s+Math.max(0,finite(e.gross)),0);
 const obs=calendar.actual.observation,complete=obs?.available?obs.completeMonths.length:0,partial=obs?.available?obs.partialMonths.length:0,total=complete+partial;
 const couponEvents=calendar.identity?.couponScheduleEvents??0,couponIdentified=calendar.identity?.couponScheduleIdentified??0,couponCoverage=calendar.identity?.couponScheduleCoverage;
 return{available:calendar.available,stale:calendar.stale,integrityComplete:calendar.integrity.complete,minimumCoverage:calendar.integrity.minimumCoverage,scheduleCoverage:calendar.coverage.coverageRatio,eligibleAssets:calendar.coverage.eligibleAssets,resolvedAssets:calendar.coverage.resolvedAssets,coverageErrors:calendar.coverage.errors.length,
 couponIdentityCoverage:typeof couponCoverage==="number"?couponCoverage:null,couponScheduleEvents:couponEvents,couponScheduleIdentified:couponIdentified,
 actualCount:actual.length,actualObservedNet,actualDeclaredNet:calendar.actual.totalNet,actualNetDelta:calendar.actual.totalNet-actualObservedNet,actualFigiCount:actualFigi.length,actualFigiEventShare:actual.length?actualFigi.length/actual.length*100:null,actualFigiNet,actualFigiNetShare:actualObservedNet?actualFigiNet/actualObservedNet*100:null,
 observationAvailable:obs?.available===true,observationCompleteMonths:complete,observationPartialMonths:partial,observationTotalMonths:total,observationCompleteShare:total?complete/total*100:null,
 highCount:future.length,highGross,highFigiCount:highFigi.length,highFigiEventShare:future.length?highFigi.length/future.length*100:null,highExactPositionCount:exact.length,highExactPositionShare:future.length?exact.length/future.length*100:null,highExactPositionGross:exactGross,highExactPositionGrossShare:highGross?exactGross/highGross*100:null,
 forecastDeclaredGross:calendar.forecast.gross,forecastVsHighGrossDelta:calendar.forecast.gross-highGross,generatedAt:calendar.generatedAt,warning:calendar.warning,note:calendar.note};
}
