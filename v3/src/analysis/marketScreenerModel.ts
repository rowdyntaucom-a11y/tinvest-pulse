import type{MarketScreenerRow}from"./marketScreenerApi";

export type ScreenerMove="all"|"gainers"|"losers"|"move2"|"move5";
export type ScreenerSort="turnover"|"changeDesc"|"changeAsc"|"trades"|"range";
export type ScreenerFilters={
 query:string;
 move:ScreenerMove;
 minTurnover:number;
 listingLevel:"all"|1|2|3;
 sort:ScreenerSort;
};

function matchMove(row:MarketScreenerRow,move:ScreenerMove){
 const c=row.dayChangePct;
 if(move==="all")return true;
 if(c==null)return false;
 if(move==="gainers")return c>0;
 if(move==="losers")return c<0;
 if(move==="move2")return Math.abs(c)>=2;
 return Math.abs(c)>=5;
}

export function filterMarketScreener(rows:MarketScreenerRow[],filters:ScreenerFilters){
 const q=filters.query.trim().toLocaleLowerCase("ru");
 const filtered=rows.filter(row=>{
  if(q&&!row.secid.toLocaleLowerCase("ru").includes(q)&&!row.name.toLocaleLowerCase("ru").includes(q))return false;
  if(!matchMove(row,filters.move))return false;
  if(row.turnoverRub<filters.minTurnover)return false;
  if(filters.listingLevel!=="all"&&row.listingLevel!==filters.listingLevel)return false;
  return true;
 });
 return filtered.sort((a,b)=>{
  if(filters.sort==="changeDesc")return (b.dayChangePct??-Infinity)-(a.dayChangePct??-Infinity);
  if(filters.sort==="changeAsc")return (a.dayChangePct??Infinity)-(b.dayChangePct??Infinity);
  if(filters.sort==="trades")return b.trades-a.trades;
  if(filters.sort==="range")return (b.rangePct??-Infinity)-(a.rangePct??-Infinity);
  return b.turnoverRub-a.turnoverRub;
 });
}
