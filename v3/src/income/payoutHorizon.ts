import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";

const day=(value:string|null|undefined)=>{const raw=String(value||"").slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return null;const ms=Date.parse(raw+"T00:00:00Z");return Number.isFinite(ms)?raw:null};
const msDay=86_400_000;
const isConfirmedFuture=(event:PayoutEvent)=>String(event.status||"").toUpperCase()!=="FACT"&&String(event.confidence||"").toUpperCase()==="HIGH";
const gross=(event:PayoutEvent)=>typeof event.gross==="number"&&Number.isFinite(event.gross)?Math.max(0,event.gross):0;

export type PayoutHorizonBucket={days:number;gross:number;count:number};
export type PayoutHorizon={
 available:boolean;
 anchorDate:string|null;
 nextDate:string|null;
 nextDays:number|null;
 nextGross:number|null;
 buckets:PayoutHorizonBucket[];
 confirmedGross:number;
 confirmedCount:number;
};

export function buildPayoutHorizon(events:PayoutEvent[],anchorValue:string|null|undefined):PayoutHorizon{
 const anchor=day(anchorValue);
 if(!anchor)return{available:false,anchorDate:null,nextDate:null,nextDays:null,nextGross:null,buckets:[],confirmedGross:0,confirmedCount:0};
 const anchorMs=Date.parse(anchor+"T00:00:00Z");
 const confirmed=events.filter(isConfirmedFuture).map(event=>{const date=day(event.date);if(!date)return null;const eventMs=Date.parse(date+"T00:00:00Z"),delta=Math.floor((eventMs-anchorMs)/msDay);return delta<0?null:{event,date,days:delta,gross:gross(event)}}).filter((row):row is NonNullable<typeof row>=>row!=null).sort((a,b)=>a.days-b.days||a.date.localeCompare(b.date));
 const windows=[30,90,180,365];
 const buckets=windows.map(days=>({days,gross:confirmed.filter(row=>row.days<=days).reduce((sum,row)=>sum+row.gross,0),count:confirmed.filter(row=>row.days<=days).length}));
 const next=confirmed[0]??null;
 return{available:true,anchorDate:anchor,nextDate:next?.date??null,nextDays:next?.days??null,nextGross:next?.gross??null,buckets,confirmedGross:confirmed.reduce((sum,row)=>sum+row.gross,0),confirmedCount:confirmed.length};
}
