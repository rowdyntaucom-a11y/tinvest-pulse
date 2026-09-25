import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";

export type IncomeForwardMonths=3|6|12;
export type IncomeForwardWindow={
 months:IncomeForwardMonths;
 from:string;
 to:string;
 events:PayoutEvent[];
 nearest:PayoutEvent[];
 gross:number;
 monthlyAverageGross:number|null;
 count:number;
 coupons:number;
 dividends:number;
 amountCoverageRatio:number|null;
};

function dateOnly(value:unknown){
 if(typeof value!=="string")return null;
 const day=value.trim().slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return null;
 const ms=Date.parse(day+"T00:00:00.000Z");
 return Number.isFinite(ms)?day:null;
}
function addMonths(day:string,months:number){
 const d=new Date(day+"T00:00:00.000Z");
 d.setUTCMonth(d.getUTCMonth()+months);
 return d.toISOString().slice(0,10);
}
function finitePositive(value:unknown){
 return typeof value==="number"&&Number.isFinite(value)&&value>0?value:null;
}
function isFact(event:PayoutEvent){return String(event.status||"").toUpperCase()==="FACT"}

export function buildIncomeForwardWindow(events:PayoutEvent[],nowMs:number,months:IncomeForwardMonths):IncomeForwardWindow{
 const now=new Date(nowMs);
 const from=now.toISOString().slice(0,10);
 const to=addMonths(from,months);
 const rows=events.filter(event=>{
  if(isFact(event))return false;
  const day=dateOnly(event.date);
  return Boolean(day&&day>=from&&day<to);
 }).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 let gross=0,amountRows=0,coupons=0,dividends=0;
 for(const event of rows){
  const amount=finitePositive(event.gross);
  if(amount!=null){gross+=amount;amountRows++}
  const kind=String(event.kind||"").toUpperCase();
  if(kind==="COUPON")coupons++;
  if(kind==="DIVIDEND")dividends++;
 }
 return{
  months,from,to,events:rows,nearest:rows.slice(0,8),gross,
  monthlyAverageGross:rows.length?gross/months:null,
  count:rows.length,coupons,dividends,
  amountCoverageRatio:rows.length?amountRows/rows.length:null,
 };
}

export function daysUntilPayout(date:string,nowMs:number){
 const day=dateOnly(date);
 if(!day)return null;
 const target=Date.parse(day+"T00:00:00.000Z");
 const nowDay=Date.parse(new Date(nowMs).toISOString().slice(0,10)+"T00:00:00.000Z");
 if(!Number.isFinite(target)||!Number.isFinite(nowDay))return null;
 return Math.max(0,Math.ceil((target-nowDay)/86400000));
}
