import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
const msDay=86_400_000;const clean=(x:unknown)=>String(x??"").trim();
const day=(value:string|null|undefined)=>{const raw=String(value||"").slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return null;const ms=Date.parse(raw+"T00:00:00Z");return Number.isFinite(ms)?raw:null};
const isHigh=(e:PayoutEvent)=>String(e.status||"").toUpperCase()!=="FACT"&&String(e.confidence||"").toUpperCase()==="HIGH";
const gross=(e:PayoutEvent)=>typeof e.gross==="number"&&Number.isFinite(e.gross)?Math.max(0,e.gross):0;
export type PayoutSourceHorizonRow={position:PositionSnapshot;gross30:number;gross90:number;gross180:number;gross365:number;count:number;nextDate:string|null};
export type PayoutSourceHorizon={available:boolean;anchorDate:string|null;rows:PayoutSourceHorizonRow[];matchedGross:number;unmatchedGross:number;matchedCount:number;unmatchedCount:number};
export function buildPayoutSourceHorizon(events:PayoutEvent[],positions:PositionSnapshot[],anchorValue:string|null|undefined):PayoutSourceHorizon{
 const anchor=day(anchorValue);if(!anchor)return{available:false,anchorDate:null,rows:[],matchedGross:0,unmatchedGross:0,matchedCount:0,unmatchedCount:0};
 const anchorMs=Date.parse(anchor+"T00:00:00Z"),byFigi=new Map<string,PayoutSourceHorizonRow>();let matchedGross=0,unmatchedGross=0,matchedCount=0,unmatchedCount=0;
 for(const event of events.filter(isHigh)){
  const eventDate=day(event.date);if(!eventDate)continue;const days=Math.floor((Date.parse(eventDate+"T00:00:00Z")-anchorMs)/msDay);if(days<0||days>365)continue;
  const g=gross(event),figi=clean(event.figi),matches=figi?positions.filter(p=>clean(p.figi)===figi):[];
  if(matches.length!==1){unmatchedGross+=g;unmatchedCount++;continue}
  const position=matches[0]!,key=clean(position.figi);let row=byFigi.get(key);
  if(!row){row={position,gross30:0,gross90:0,gross180:0,gross365:0,count:0,nextDate:null};byFigi.set(key,row)}
  if(days<=30)row.gross30+=g;if(days<=90)row.gross90+=g;if(days<=180)row.gross180+=g;row.gross365+=g;row.count++;if(!row.nextDate||eventDate<row.nextDate)row.nextDate=eventDate;matchedGross+=g;matchedCount++;
 }
 return{available:true,anchorDate:anchor,rows:[...byFigi.values()].sort((a,b)=>b.gross365-a.gross365||a.position.ticker.localeCompare(b.position.ticker)),matchedGross,unmatchedGross,matchedCount,unmatchedCount};
}
