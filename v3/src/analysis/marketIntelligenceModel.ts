import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{MarketScreenerRow}from"./marketScreenerApi";

export type MarketPulse={total:number;gainers:number;losers:number;flat:number;advancersShare:number|null;turnover:number;topTurnover:MarketScreenerRow|null;largestMove:MarketScreenerRow|null;portfolioMatches:number;portfolioTickers:Set<string>};
export function buildMarketPulse(rows:MarketScreenerRow[],positions:PositionSnapshot[]):MarketPulse{
 const portfolioTickers=new Set(positions.map(p=>p.ticker.trim().toUpperCase()).filter(Boolean));
 let gainers=0,losers=0,flat=0,turnover=0,portfolioMatches=0;
 let topTurnover:MarketScreenerRow|null=null,largestMove:MarketScreenerRow|null=null;
 for(const row of rows){
  const change=row.dayChangePct;
  if(change==null||change===0)flat++;else if(change>0)gainers++;else losers++;
  turnover+=Math.max(0,row.turnoverRub||0);
  if(!topTurnover||row.turnoverRub>topTurnover.turnoverRub)topTurnover=row;
  if(change!=null&&(!largestMove||Math.abs(change)>Math.abs(largestMove.dayChangePct??0)))largestMove=row;
  if(portfolioTickers.has(row.secid.toUpperCase()))portfolioMatches++;
 }
 const directional=gainers+losers;
 return{total:rows.length,gainers,losers,flat,advancersShare:directional?gainers/directional:null,turnover,topTurnover,largestMove,portfolioMatches,portfolioTickers};
}
