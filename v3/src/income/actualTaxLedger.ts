import type{PayoutEvent,PayoutObservation}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

const n=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?Math.max(0,v):0;
const figi=(v:unknown)=>String(v??"").trim();
const month=(v:unknown)=>{const x=String(v??"").slice(0,7);return /^\d{4}-\d{2}$/.test(x)?x:null};
const rate=(tax:number,gross:number)=>gross>0?tax/gross*100:null;

export type ActualTaxMonth={key:string;gross:number;net:number;tax:number;count:number;observation:"complete"|"partial"|"unknown"};
export type ActualTaxKind={kind:"COUPON"|"DIVIDEND"|"OTHER";gross:number;net:number;tax:number;count:number;taxRate:number|null};
export type ActualTaxSource={figi:string;label:string;position:PositionSnapshot|null;gross:number;net:number;tax:number;count:number;taxRate:number|null};
export type ActualTaxLedger={
 available:boolean;gross:number;net:number;tax:number;count:number;taxRate:number|null;netRetention:number|null;reconciliationDelta:number|null;reconciliationAvailable:boolean;grossCoverage:number|null;
 taxedEvents:number;zeroTaxEvents:number;grossEvents:number;completeMonths:number;partialMonths:number;
 months:ActualTaxMonth[];kinds:ActualTaxKind[];sources:ActualTaxSource[];
};

export function buildActualTaxLedger(items:PayoutEvent[],positions:PositionSnapshot[],observation:PayoutObservation|undefined):ActualTaxLedger{
 const gross=items.reduce((s,e)=>s+n(e.gross),0),net=items.reduce((s,e)=>s+n(e.net),0),tax=items.reduce((s,e)=>s+n(e.tax),0);
 const uniquePositions=new Map<string,PositionSnapshot|null>();for(const p of positions){const id=figi(p.figi);if(!id)continue;if(uniquePositions.has(id))uniquePositions.set(id,null);else uniquePositions.set(id,p)}
 const obsComplete=new Set(observation?.available?observation.completeMonths??[]:[]),obsPartial=new Set(observation?.available?observation.partialMonths??[]:[]);
 const monthKeys=[...new Set(items.map(e=>month(e.date)).filter((x):x is string=>x!=null))].sort(),months=monthKeys.map(key=>{const rows=items.filter(e=>month(e.date)===key);return{key,gross:rows.reduce((s,e)=>s+n(e.gross),0),net:rows.reduce((s,e)=>s+n(e.net),0),tax:rows.reduce((s,e)=>s+n(e.tax),0),count:rows.length,observation:(obsComplete.has(key)?"complete":obsPartial.has(key)?"partial":"unknown") as ActualTaxMonth["observation"]}});
 const kindRows=(["COUPON","DIVIDEND","OTHER"] as const).map(kind=>{const rows=items.filter(e=>{const k=String(e.kind||"").toUpperCase();return kind==="OTHER"?k!=="COUPON"&&k!=="DIVIDEND":k===kind}),g=rows.reduce((s,e)=>s+n(e.gross),0),t=rows.reduce((s,e)=>s+n(e.tax),0);return{kind,gross:g,net:rows.reduce((s,e)=>s+n(e.net),0),tax:t,count:rows.length,taxRate:rate(t,g)}}).filter(x=>x.count>0);
 const byFigi=new Map<string,{label:string;gross:number;net:number;tax:number;count:number}>();for(const e of items){const id=figi(e.figi);if(!id)continue;const row=byFigi.get(id)??{label:e.ticker||e.name||id,gross:0,net:0,tax:0,count:0};row.gross+=n(e.gross);row.net+=n(e.net);row.tax+=n(e.tax);row.count++;byFigi.set(id,row)}
 const sources=[...byFigi.entries()].map(([id,row])=>({figi:id,label:row.label,position:uniquePositions.get(id)??null,gross:row.gross,net:row.net,tax:row.tax,count:row.count,taxRate:rate(row.tax,row.gross)})).sort((a,b)=>b.tax-a.tax||b.gross-a.gross||a.label.localeCompare(b.label));
 const taxedEvents=items.filter(e=>n(e.tax)>0).length,zeroTaxEvents=items.filter(e=>n(e.tax)===0).length,grossEvents=items.filter(e=>n(e.gross)>0).length;
 const grossCoverage=items.length?grossEvents/items.length:null,reconciliationAvailable=items.length>0&&grossEvents===items.length;
 return{available:Boolean(items.length||observation?.available),gross,net,tax,count:items.length,taxRate:rate(tax,gross),netRetention:gross>0?net/gross*100:null,reconciliationDelta:reconciliationAvailable?gross-net-tax:null,reconciliationAvailable,grossCoverage,taxedEvents,zeroTaxEvents,grossEvents,completeMonths:obsComplete.size,partialMonths:obsPartial.size,months,kinds:kindRows,sources};
}
