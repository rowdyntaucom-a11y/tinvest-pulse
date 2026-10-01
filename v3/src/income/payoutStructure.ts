import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";import{buildPayoutAttribution}from"./payoutAttribution.ts";import{buildPayoutRunway}from"./payoutRunway.ts";import{buildPayoutLadder}from"./payoutLadder.ts";

export type PayoutStructure={
 available:boolean;
 confirmedGross:number;
 confirmedCount:number;
 linkedGross:number;
 linkedCount:number;
 linkedGrossShare:number|null;
 top1Share:number|null;
 top3Share:number|null;
 hhi:number|null;
 effectiveSources:number|null;
 activeMonths:number;
 totalMonths:number;
 longestGap:number;
 couponShare:number|null;
 dividendShare:number|null;
 first90Share:number|null;
 weightedDay:number|null;
 sourceCount:number;
};

export function buildPayoutStructure(events:PayoutEvent[],positions:PositionSnapshot[],anchor:string|null|undefined,from:string|null|undefined,to:string|null|undefined):PayoutStructure{
 const attribution=buildPayoutAttribution(events,positions),runway=buildPayoutRunway(events,from,to),ladder=buildPayoutLadder(events,anchor);
 const rows=attribution.rows,linkedGross=attribution.matchedGross,shares=linkedGross>0?rows.map(row=>row.gross/linkedGross):[];
 const top1Share=shares.length?shares[0]*100:null,top3Share=shares.length?shares.slice(0,3).reduce((sum,x)=>sum+x,0)*100:null;
 const hhi=shares.length?shares.reduce((sum,x)=>sum+x*x,0)*10000:null,effectiveSources=shares.length?1/shares.reduce((sum,x)=>sum+x*x,0):null;
 return{
  available:runway.available||ladder.available||attribution.confirmedCount>0,
  confirmedGross:attribution.confirmedGross,confirmedCount:attribution.confirmedCount,
  linkedGross,linkedCount:attribution.matchedCount,
  linkedGrossShare:attribution.confirmedGross>0?linkedGross/attribution.confirmedGross*100:null,
  top1Share,top3Share,hhi,effectiveSources,
  activeMonths:runway.activeMonths,totalMonths:runway.months.length,longestGap:runway.longestGap,
  couponShare:runway.totalGross>0?runway.couponGross/runway.totalGross*100:null,
  dividendShare:runway.totalGross>0?runway.dividendGross/runway.totalGross*100:null,
  first90Share:ladder.first90Share,weightedDay:ladder.weightedDay,sourceCount:rows.length
 };
}
