import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
const clean=(value:unknown)=>typeof value==="string"&&value.trim()?value.trim():null;
const confirmed=(event:PayoutEvent)=>String(event.status||"").toUpperCase()!=="FACT"&&String(event.confidence||"").toUpperCase()==="HIGH";
const exactPosition=(event:PayoutEvent,positions:PositionSnapshot[])=>{const figi=clean(event.figi);if(!figi)return null;const matches=positions.filter(position=>clean(position.figi)===figi);return matches.length===1?matches[0]:null};

export type PayoutAttributionRow={position:PositionSnapshot;gross:number;count:number;nextDate:string|null};
export type PayoutAttribution={rows:PayoutAttributionRow[];confirmedGross:number;matchedGross:number;unmatchedGross:number;confirmedCount:number;matchedCount:number;unmatchedCount:number};

export function buildPayoutAttribution(events:PayoutEvent[],positions:PositionSnapshot[]):PayoutAttribution{
 const confirmedEvents=events.filter(confirmed);
 const rowsByFigi=new Map<string,PayoutAttributionRow>();let confirmedGross=0,matchedGross=0,confirmedCount=0,matchedCount=0;
 for(const event of confirmedEvents){
  const gross=typeof event.gross==="number"&&Number.isFinite(event.gross)?Math.max(0,event.gross):0;confirmedGross+=gross;confirmedCount+=1;
  const position=exactPosition(event,positions);if(!position)continue;matchedGross+=gross;matchedCount+=1;
  const key=String(position.figi||"").trim();if(!key)continue;const current=rowsByFigi.get(key);
  if(current){current.gross+=gross;current.count+=1;if(!current.nextDate||event.date<current.nextDate)current.nextDate=event.date}
  else rowsByFigi.set(key,{position,gross,count:1,nextDate:event.date||null});
 }
 return{rows:[...rowsByFigi.values()].sort((a,b)=>b.gross-a.gross||a.position.ticker.localeCompare(b.position.ticker)),confirmedGross,matchedGross,unmatchedGross:Math.max(0,confirmedGross-matchedGross),confirmedCount,matchedCount,unmatchedCount:Math.max(0,confirmedCount-matchedCount)}
}
