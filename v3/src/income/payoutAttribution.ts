import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";import{findPayoutEventPosition,payoutEventIsConfirmed}from"../../../v2/src/features/income/incomeCalendarEventView";

export type PayoutAttributionRow={position:PositionSnapshot;gross:number;count:number;nextDate:string|null};
export type PayoutAttribution={rows:PayoutAttributionRow[];confirmedGross:number;matchedGross:number;unmatchedGross:number;confirmedCount:number;matchedCount:number;unmatchedCount:number};

export function buildPayoutAttribution(events:PayoutEvent[],positions:PositionSnapshot[]):PayoutAttribution{
 const confirmed=events.filter(event=>payoutEventIsConfirmed(event)&&String(event.status||"").toUpperCase()!=="FACT");
 const rowsByFigi=new Map<string,PayoutAttributionRow>();let confirmedGross=0,matchedGross=0,confirmedCount=0,matchedCount=0;
 for(const event of confirmed){
  const gross=typeof event.gross==="number"&&Number.isFinite(event.gross)?Math.max(0,event.gross):0;confirmedGross+=gross;confirmedCount+=1;
  const position=findPayoutEventPosition(event,positions);if(!position)continue;matchedGross+=gross;matchedCount+=1;
  const key=String(position.figi||"").trim();if(!key)continue;const current=rowsByFigi.get(key);
  if(current){current.gross+=gross;current.count+=1;if(!current.nextDate||event.date<current.nextDate)current.nextDate=event.date}
  else rowsByFigi.set(key,{position,gross,count:1,nextDate:event.date||null});
 }
 return{rows:[...rowsByFigi.values()].sort((a,b)=>b.gross-a.gross||a.position.ticker.localeCompare(b.position.ticker)),confirmedGross,matchedGross,unmatchedGross:Math.max(0,confirmedGross-matchedGross),confirmedCount,matchedCount,unmatchedCount:Math.max(0,confirmedCount-matchedCount)}
}
