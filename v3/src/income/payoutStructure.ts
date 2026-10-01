import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

const clean=(x:unknown)=>String(x??"").trim(),msDay=86_400_000;
const day=(value:string|null|undefined)=>{const raw=String(value||"").slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return null;const ms=Date.parse(raw+"T00:00:00Z");return Number.isFinite(ms)?raw:null};
const high=(e:PayoutEvent)=>String(e.status||"").toUpperCase()!=="FACT"&&String(e.confidence||"").toUpperCase()==="HIGH";
const gross=(e:PayoutEvent)=>typeof e.gross==="number"&&Number.isFinite(e.gross)?Math.max(0,e.gross):0;
const monthKey=(date:string)=>date.slice(0,7);
const addMonth=(key:string,delta:number)=>{const [y,m]=key.split("-").map(Number),d=new Date(Date.UTC(y!,m!-1+delta,1));return d.toISOString().slice(0,7)};

export type PayoutStructure={
 available:boolean;confirmedGross:number;confirmedCount:number;linkedGross:number;linkedCount:number;linkedGrossShare:number|null;
 top1Share:number|null;top3Share:number|null;hhi:number|null;effectiveSources:number|null;activeMonths:number;totalMonths:number;longestGap:number;
 couponShare:number|null;dividendShare:number|null;first90Share:number|null;weightedDay:number|null;sourceCount:number;
};

export function buildPayoutStructure(events:PayoutEvent[],positions:PositionSnapshot[],anchorValue:string|null|undefined,fromValue:string|null|undefined,toValue:string|null|undefined):PayoutStructure{
 const anchor=day(anchorValue),from=day(fromValue),to=day(toValue),confirmed=events.filter(high);
 let confirmedGross=0,linkedGross=0,linkedCount=0,couponGross=0,dividendGross=0,first90Gross=0,weightedNumerator=0;
 const byFigi=new Map<string,number>(),activeKeys=new Set<string>();
 for(const event of confirmed){
  const g=gross(event);confirmedGross+=g;const kind=String(event.kind||"").toUpperCase();if(kind==="COUPON")couponGross+=g;else if(kind==="DIVIDEND")dividendGross+=g;
  const d=day(event.date);if(d)activeKeys.add(monthKey(d));
  if(anchor&&d){const days=Math.floor((Date.parse(d+"T00:00:00Z")-Date.parse(anchor+"T00:00:00Z"))/msDay);if(days>=0&&days<=365){weightedNumerator+=days*g;if(days<=90)first90Gross+=g}}
  const figi=clean(event.figi),matches=figi?positions.filter(p=>clean(p.figi)===figi):[];if(matches.length!==1)continue;linkedGross+=g;linkedCount++;byFigi.set(figi,(byFigi.get(figi)??0)+g);
 }
 const shares=linkedGross>0?[...byFigi.values()].sort((a,b)=>b-a).map(v=>v/linkedGross):[],sumSq=shares.reduce((s,x)=>s+x*x,0);
 let totalMonths=0,longestGap=0;
 if(from&&to){const start=monthKey(from),end=monthKey(to);let key=start,gap=0,guard=0;while(key<=end&&guard<36){totalMonths++;if(activeKeys.has(key)){gap=0}else{gap++;longestGap=Math.max(longestGap,gap)}key=addMonth(start,totalMonths);guard++}}
 const activeMonths=from&&to?[...activeKeys].filter(k=>k>=monthKey(from)&&k<=monthKey(to)).length:activeKeys.size,totalTypeGross=couponGross+dividendGross;
 return{
  available:Boolean(anchor||from||to||confirmed.length),confirmedGross,confirmedCount:confirmed.length,linkedGross,linkedCount,
  linkedGrossShare:confirmedGross>0?linkedGross/confirmedGross*100:null,top1Share:shares.length?shares[0]!*100:null,top3Share:shares.length?shares.slice(0,3).reduce((s,x)=>s+x,0)*100:null,
  hhi:shares.length?sumSq*10000:null,effectiveSources:shares.length&&sumSq>0?1/sumSq:null,activeMonths,totalMonths,longestGap,
  couponShare:totalTypeGross>0?couponGross/totalTypeGross*100:null,dividendShare:totalTypeGross>0?dividendGross/totalTypeGross*100:null,
  first90Share:confirmedGross>0?first90Gross/confirmedGross*100:null,weightedDay:confirmedGross>0?weightedNumerator/confirmedGross:null,sourceCount:byFigi.size
 };
}
