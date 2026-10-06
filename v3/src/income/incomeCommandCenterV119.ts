import type{PayoutCalendar,PayoutEvent}from"../../../v2/src/lib/payoutsApi";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

export type IncomeCommandSource={key:string;label:string;actualNet:number;futureGross:number;actualShare:number;futureShare:number;state:"both"|"actual-only"|"future-only"};
export type IncomeCommandMonth={key:string;actualNet:number;futureGross:number};
export type IncomeCommandCenterModel={available:boolean;safeFuture:boolean;actualNet:number;actualCount:number;futureGross:number;futureCount:number;coverage:number;next:PayoutEvent|null;nextDays:number|null;months:IncomeCommandMonth[];sources:IncomeCommandSource[];top1FutureShare:number|null;top3FutureShare:number|null;linkedFutureShare:number|null};

const finite=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:0;
const clean=(v:unknown)=>String(v??"").trim();
const month=(v:string)=>/^\d{4}-\d{2}/.test(v)?v.slice(0,7):"";
const utcDay=(v:string)=>{const d=new Date(v);return Number.isNaN(d.getTime())?null:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};
const high=(e:PayoutEvent)=>e.status!=="FACT"&&String(e.confidence||"").toUpperCase()==="HIGH";

export function buildIncomeCommandCenter(calendar:PayoutCalendar,positions:PositionSnapshot[]):IncomeCommandCenterModel{
 const safeFuture=calendar.available&&calendar.integrity.complete&&!calendar.stale;
 const actual=calendar.actual.items??[],future=safeFuture?calendar.events.filter(high):[];
 const actualNet=actual.reduce((s,e)=>s+Math.max(0,finite(e.net)),0),futureGross=future.reduce((s,e)=>s+Math.max(0,finite(e.gross)),0);
 const anchor=utcDay(calendar.generatedAt||calendar.period.from||""),next=[...future].filter(e=>{const d=utcDay(e.date);return d!=null&&(anchor==null||d>=anchor)}).sort((a,b)=>a.date.localeCompare(b.date))[0]??null,nextMs=next?utcDay(next.date):null;
 const monthsMap=new Map<string,{actualNet:number;futureGross:number}>();
 for(const e of actual){const k=month(e.date);if(!k)continue;const r=monthsMap.get(k)??{actualNet:0,futureGross:0};r.actualNet+=Math.max(0,finite(e.net));monthsMap.set(k,r)}
 for(const e of future){const k=month(e.date);if(!k)continue;const r=monthsMap.get(k)??{actualNet:0,futureGross:0};r.futureGross+=Math.max(0,finite(e.gross));monthsMap.set(k,r)}
 const months=[...monthsMap.entries()].sort(([a],[b])=>a.localeCompare(b)).slice(-18).map(([key,row])=>({key,...row}));
 const labels=new Map(positions.map(p=>[clean(p.figi),p.ticker||p.name||clean(p.figi)])),sourceMap=new Map<string,{label:string;actualNet:number;futureGross:number}>();
 const add=(e:PayoutEvent,field:"actualNet"|"futureGross",value:number)=>{const key=clean(e.figi)||clean(e.ticker)||clean(e.name)||"unknown",label=labels.get(clean(e.figi))||clean(e.ticker)||clean(e.name)||"Без идентификатора",r=sourceMap.get(key)??{label,actualNet:0,futureGross:0};r[field]+=Math.max(0,value);sourceMap.set(key,r)};
 for(const e of actual)add(e,"actualNet",finite(e.net));for(const e of future)add(e,"futureGross",finite(e.gross));
 const sources=[...sourceMap.entries()].map(([key,r])=>({key,...r,actualShare:actualNet>0?r.actualNet/actualNet*100:0,futureShare:futureGross>0?r.futureGross/futureGross*100:0,state:(r.actualNet>0&&r.futureGross>0?"both":r.actualNet>0?"actual-only":"future-only") as IncomeCommandSource["state"]})).sort((a,b)=>Math.max(b.actualShare,b.futureShare)-Math.max(a.actualShare,a.futureShare)||a.label.localeCompare(b.label));
 const futureSorted=[...sources].sort((a,b)=>b.futureGross-a.futureGross),linkedFuture=future.filter(e=>labels.has(clean(e.figi))).reduce((s,e)=>s+Math.max(0,finite(e.gross)),0);
 return{available:calendar.available,safeFuture,actualNet,actualCount:actual.length,futureGross,futureCount:future.length,coverage:Math.max(0,Math.min(100,finite(calendar.coverage.coverageRatio)*100)),next,nextDays:anchor!=null&&nextMs!=null?Math.max(0,Math.floor((nextMs-anchor)/86_400_000)):null,months,sources,top1FutureShare:futureGross>0?(futureSorted[0]?.futureGross??0)/futureGross*100:null,top3FutureShare:futureGross>0?futureSorted.slice(0,3).reduce((s,r)=>s+r.futureGross,0)/futureGross*100:null,linkedFutureShare:futureGross>0?linkedFuture/futureGross*100:null};
}
