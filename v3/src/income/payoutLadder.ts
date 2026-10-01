import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";

const msDay=86_400_000;
const day=(value:string|null|undefined)=>{const raw=String(value||"").slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return null;const ms=Date.parse(raw+"T00:00:00Z");return Number.isFinite(ms)?raw:null};
const gross=(event:PayoutEvent)=>typeof event.gross==="number"&&Number.isFinite(event.gross)?Math.max(0,event.gross):0;
const confirmed=(event:PayoutEvent)=>String(event.status||"").toUpperCase()!=="FACT"&&String(event.confidence||"").toUpperCase()==="HIGH";

export type PayoutLadderBand={fromDay:number;toDay:number;label:string;gross:number;count:number;shareGross:number};
export type PayoutLadder={
 available:boolean;
 anchorDate:string|null;
 totalGross:number;
 totalCount:number;
 first90Gross:number;
 first90Share:number|null;
 weightedDay:number|null;
 medianDay:number|null;
 bands:PayoutLadderBand[];
};

export function buildPayoutLadder(events:PayoutEvent[],anchorValue:string|null|undefined):PayoutLadder{
 const anchor=day(anchorValue);
 const empty:PayoutLadder={available:false,anchorDate:anchor,totalGross:0,totalCount:0,first90Gross:0,first90Share:null,weightedDay:null,medianDay:null,bands:[]};
 if(!anchor)return empty;
 const anchorMs=Date.parse(anchor+"T00:00:00Z");
 const rows=events.filter(confirmed).map(event=>{const date=day(event.date);if(!date)return null;const days=Math.floor((Date.parse(date+"T00:00:00Z")-anchorMs)/msDay);if(days<0||days>365)return null;return{days,gross:gross(event)}}).filter((row):row is NonNullable<typeof row>=>row!=null).sort((a,b)=>a.days-b.days);
 const defs=[{fromDay:0,toDay:30,label:"0–30"},{fromDay:31,toDay:90,label:"31–90"},{fromDay:91,toDay:180,label:"91–180"},{fromDay:181,toDay:365,label:"181–365"}];
 const totalGross=rows.reduce((sum,row)=>sum+row.gross,0),totalCount=rows.length;
 const bands=defs.map(def=>{const part=rows.filter(row=>row.days>=def.fromDay&&row.days<=def.toDay),bandGross=part.reduce((sum,row)=>sum+row.gross,0);return{...def,gross:bandGross,count:part.length,shareGross:totalGross>0?bandGross/totalGross*100:0}});
 const first90Gross=bands.slice(0,2).reduce((sum,row)=>sum+row.gross,0);
 const weightedDay=totalGross>0?rows.reduce((sum,row)=>sum+row.days*row.gross,0)/totalGross:null;
 const medianDay=totalCount?rows[Math.floor((totalCount-1)/2)]!.days:null;
 return{available:true,anchorDate:anchor,totalGross,totalCount,first90Gross,first90Share:totalGross>0?first90Gross/totalGross*100:null,weightedDay,medianDay,bands};
}
