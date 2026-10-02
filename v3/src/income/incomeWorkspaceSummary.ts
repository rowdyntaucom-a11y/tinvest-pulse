import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";

export type IncomeWorkspaceBucket={days:30|90|365;gross:number;count:number};
export type IncomeWorkspaceSummary={available:boolean;anchorDate:string;confirmedGross:number;confirmedCount:number;next:PayoutEvent|null;nextDays:number|null;buckets:IncomeWorkspaceBucket[]};

const DAY=86_400_000;
const utcDay=(value:string)=>{const date=new Date(value);if(Number.isNaN(date.getTime()))return null;return Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())};
const amount=(event:PayoutEvent)=>typeof event.gross==="number"&&Number.isFinite(event.gross)&&event.gross>0?event.gross:0;
const confirmed=(event:PayoutEvent)=>event.status!=="FACT"&&String(event.confidence||"").toUpperCase()==="HIGH";

export function buildIncomeWorkspaceSummary(events:PayoutEvent[],generatedAt?:string|null):IncomeWorkspaceSummary{
 const anchorMs=utcDay(generatedAt||"");
 if(anchorMs==null)return{available:false,anchorDate:"",confirmedGross:0,confirmedCount:0,next:null,nextDays:null,buckets:[30,90,365].map(days=>({days:days as 30|90|365,gross:0,count:0}))};
 const rows=events.map(event=>({event,dateMs:utcDay(event.date),gross:amount(event)})).filter(row=>confirmed(row.event)&&row.dateMs!=null&&row.dateMs>=anchorMs).sort((a,b)=>(a.dateMs!-b.dateMs!)||String(a.event.figi||a.event.ticker||"").localeCompare(String(b.event.figi||b.event.ticker||"")));
 const buckets=([30,90,365]as const).map(days=>{const inside=rows.filter(row=>Math.floor((row.dateMs!-anchorMs)/DAY)<=days);return{days,gross:inside.reduce((sum,row)=>sum+row.gross,0),count:inside.length}});
 const next=rows[0]??null;
 return{available:true,anchorDate:new Date(anchorMs).toISOString().slice(0,10),confirmedGross:rows.reduce((sum,row)=>sum+row.gross,0),confirmedCount:rows.length,next:next?.event??null,nextDays:next?Math.floor((next.dateMs!-anchorMs)/DAY):null,buckets};
}
