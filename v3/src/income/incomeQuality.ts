import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";
import type{IncomeHistoryMonth}from"../../../v2/src/features/income/incomeHistory";

export const INCOME_QUALITY_VERSION="1.0" as const;

export type IncomeQuality={
 version:typeof INCOME_QUALITY_VERSION;
 available:boolean;
 status:"insufficient"|"preview"|"mature";
 observedMonths:number;
 payoutMonths:number;
 regularityRatio:number|null;
 totalNet:number;
 couponsNet:number;
 dividendsNet:number;
 otherNet:number;
 couponShare:number|null;
 dividendShare:number|null;
 otherShare:number|null;
 note:string;
};

function positive(value:unknown){
 const parsed=Number(value);
 return Number.isFinite(parsed)&&parsed>0?parsed:0;
}
function kind(event:PayoutEvent){
 const value=String(event.kind||"").trim().toUpperCase();
 return value==="COUPON"?"COUPON":value==="DIVIDEND"?"DIVIDEND":"OTHER";
}

export function calculateIncomeQuality(events:PayoutEvent[],months:IncomeHistoryMonth[]):IncomeQuality{
 const complete=(Array.isArray(months)?months:[]).filter(month=>month.complete);
 const observedMonths=complete.length;
 const payoutMonths=complete.filter(month=>month.totalNet>0).length;
 let couponsNet=0,dividendsNet=0,otherNet=0;
 for(const event of Array.isArray(events)?events:[]){
  if(String(event.status||"").trim().toUpperCase()!=="FACT")continue;
  const net=positive(event.net);
  if(!(net>0))continue;
  const type=kind(event);
  if(type==="COUPON")couponsNet+=net;
  else if(type==="DIVIDEND")dividendsNet+=net;
  else otherNet+=net;
 }
 const totalNet=couponsNet+dividendsNet+otherNet;
 const available=observedMonths>=3&&totalNet>0;
 const status=observedMonths>=12?"mature":observedMonths>=3?"preview":"insufficient";
 return{
  version:INCOME_QUALITY_VERSION,available,status,observedMonths,payoutMonths,
  regularityRatio:observedMonths>0?payoutMonths/observedMonths:null,
  totalNet,couponsNet,dividendsNet,otherNet,
  couponShare:totalNet>0?couponsNet/totalNet:null,
  dividendShare:totalNet>0?dividendsNet/totalNet:null,
  otherShare:totalNet>0?otherNet/totalNet:null,
  note:available
   ?(status==="mature"?"Quality uses realized net payouts and 12+ complete observed calendar months.":"Preview quality uses realized net payouts and complete observed months only; it is not annualized.")
   :"Quality is withheld until at least 3 complete observed months and positive realized net income are available.",
 };
}
