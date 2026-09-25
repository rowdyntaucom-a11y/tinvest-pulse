export type MarketScreenerRow={
 secid:string;
 name:string;
 lotSize:number|null;
 listingLevel:number|null;
 prevPrice:number|null;
 last:number;
 dayChangePct:number|null;
 turnoverRub:number;
 volume:number;
 trades:number;
 open:number|null;
 high:number|null;
 low:number|null;
 rangePct:number|null;
};

export type MarketScreenerPayload={
 available:boolean;
 fetchedAt:string|null;
 source:string|null;
 board:string|null;
 rows:MarketScreenerRow[];
 reason:string|null;
};

function finite(value:unknown){
 const n=Number(value);
 return Number.isFinite(n)?n:null;
}
function row(raw:any):MarketScreenerRow|null{
 const secid=String(raw?.secid??"").trim();
 const name=String(raw?.name??"").trim();
 const last=finite(raw?.last);
 if(!secid||!name||last==null||last<=0)return null;
 return{
  secid,name,
  lotSize:finite(raw?.lotSize),
  listingLevel:finite(raw?.listingLevel),
  prevPrice:finite(raw?.prevPrice),
  last,
  dayChangePct:finite(raw?.dayChangePct),
  turnoverRub:Math.max(0,finite(raw?.turnoverRub)??0),
  volume:Math.max(0,finite(raw?.volume)??0),
  trades:Math.max(0,finite(raw?.trades)??0),
  open:finite(raw?.open),
  high:finite(raw?.high),
  low:finite(raw?.low),
  rangePct:finite(raw?.rangePct),
 };
}

export async function loadMarketScreener(signal?:AbortSignal):Promise<MarketScreenerPayload>{
 try{
  const response=await fetch("/api/market-screener",{cache:"no-store",signal});
  if(!response.ok)return{available:false,fetchedAt:null,source:null,board:null,rows:[],reason:"HTTP "+response.status};
  const raw=await response.json() as any;
  const rows=(Array.isArray(raw?.rows)?raw.rows:[]).map(row).filter((x):x is MarketScreenerRow=>Boolean(x));
  return{
   available:raw?.ok===true&&rows.length>0,
   fetchedAt:typeof raw?.fetchedAt==="string"?raw.fetchedAt:null,
   source:typeof raw?.source==="string"?raw.source:null,
   board:typeof raw?.board==="string"?raw.board:null,
   rows,
   reason:raw?.ok===true&&rows.length>0?null:String(raw?.reason||"MOEX market screener is unavailable."),
  };
 }catch(error){
  if(error instanceof DOMException&&error.name==="AbortError")throw error;
  return{available:false,fetchedAt:null,source:null,board:null,rows:[],reason:"MOEX market screener is unavailable."};
 }
}
