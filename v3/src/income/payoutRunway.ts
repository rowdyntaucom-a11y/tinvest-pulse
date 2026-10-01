import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";

const monthKey=(value:string|null|undefined)=>{const raw=String(value||"").slice(0,7);return /^\d{4}-\d{2}$/.test(raw)?raw:null};
const nextMonth=(key:string)=>{const y=Number(key.slice(0,4)),m=Number(key.slice(5,7));const d=new Date(Date.UTC(y,m,1));return d.toISOString().slice(0,7)};
const isConfirmedFuture=(event:PayoutEvent)=>String(event.status||"").toUpperCase()!=="FACT"&&String(event.confidence||"").toUpperCase()==="HIGH";
const safeGross=(event:PayoutEvent)=>typeof event.gross==="number"&&Number.isFinite(event.gross)?Math.max(0,event.gross):0;

export type PayoutRunwayMonth={key:string;gross:number;count:number;couponGross:number;dividendGross:number};
export type PayoutRunway={
 available:boolean;
 months:PayoutRunwayMonth[];
 totalGross:number;
 totalCount:number;
 activeMonths:number;
 zeroMonths:number;
 peakMonth:PayoutRunwayMonth|null;
 averageActiveGross:number|null;
 longestGap:number;
 couponGross:number;
 dividendGross:number;
};

export function buildPayoutRunway(events:PayoutEvent[],periodFrom:string|null|undefined,periodTo:string|null|undefined):PayoutRunway{
 const from=monthKey(periodFrom),to=monthKey(periodTo);
 if(!from||!to||from>to)return{available:false,months:[],totalGross:0,totalCount:0,activeMonths:0,zeroMonths:0,peakMonth:null,averageActiveGross:null,longestGap:0,couponGross:0,dividendGross:0};
 const keys:string[]=[];let cursor=from;
 while(cursor<=to&&keys.length<12){keys.push(cursor);cursor=nextMonth(cursor)}
 if(keys.length===0)return{available:false,months:[],totalGross:0,totalCount:0,activeMonths:0,zeroMonths:0,peakMonth:null,averageActiveGross:null,longestGap:0,couponGross:0,dividendGross:0};
 const byKey=new Map(keys.map(key=>[key,{key,gross:0,count:0,couponGross:0,dividendGross:0} as PayoutRunwayMonth]));
 for(const event of events){
  if(!isConfirmedFuture(event))continue;
  const key=monthKey(event.date),row=key?byKey.get(key):null;if(!row)continue;
  const gross=safeGross(event);row.gross+=gross;row.count+=1;
  if(String(event.kind||"").toUpperCase()==="COUPON")row.couponGross+=gross;
  else if(String(event.kind||"").toUpperCase()==="DIVIDEND")row.dividendGross+=gross;
 }
 const months=keys.map(key=>byKey.get(key)!);
 const totalGross=months.reduce((sum,row)=>sum+row.gross,0),totalCount=months.reduce((sum,row)=>sum+row.count,0);
 const active=months.filter(row=>row.count>0),peakMonth=active.reduce<PayoutRunwayMonth|null>((best,row)=>!best||row.gross>best.gross?row:best,null);
 let longestGap=0,currentGap=0;for(const row of months){if(row.count===0){currentGap+=1;longestGap=Math.max(longestGap,currentGap)}else currentGap=0}
 const couponGross=months.reduce((sum,row)=>sum+row.couponGross,0),dividendGross=months.reduce((sum,row)=>sum+row.dividendGross,0);
 return{available:true,months,totalGross,totalCount,activeMonths:active.length,zeroMonths:months.length-active.length,peakMonth,averageActiveGross:active.length?totalGross/active.length:null,longestGap,couponGross,dividendGross};
}
