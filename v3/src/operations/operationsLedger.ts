export const V3_OPERATIONS_LEDGER_VERSION="1.0" as const;

export type V3OperationKind="TRADE"|"INCOME"|"EXTERNAL_CASH"|"FEE"|"OTHER";
export type V3IntegrityLevel="OK"|"PARTIAL"|"UNAVAILABLE";

export type V3OperationRow={
 id:string|null;
 key:string;
 date:string;
 type:string;
 name:string|null;
 ticker:string|null;
 figi:string|null;
 instrumentUid:string|null;
 payment:number;
 quantity:number|null;
 kind:V3OperationKind;
};

export type V3OperationsLedger={
 version:typeof V3_OPERATIONS_LEDGER_VERSION;
 available:boolean;
 accountName:string|null;
 fetchedAt:string|null;
 coverageFrom:string|null;
 coverageTo:string|null;
 possiblyTruncated:boolean;
 rows:V3OperationRow[];
 rejected:number;
 duplicates:number;
 traceableRatio:number|null;
 instrumentIdentityRatio:number|null;
 passiveIncomeTotal:number|null;
 externalCashTotal:number|null;
 aggregatesMatch:boolean|null;
 integrityLevel:V3IntegrityLevel;
 reason:string|null;
};

const TRADE_TYPES=new Set([
 "OPERATION_TYPE_BUY",
 "OPERATION_TYPE_SELL",
 "OPERATION_TYPE_DELIVERY_BUY",
 "OPERATION_TYPE_DELIVERY_SELL",
 "OPERATION_TYPE_PRIMARY_ORDER"
]);

const FEE_TYPES=new Set([
 "OPERATION_TYPE_BROKER_FEE",
 "OPERATION_TYPE_SERVICE_FEE",
 "OPERATION_TYPE_MARGIN_FEE",
 "OPERATION_TYPE_SUCCESS_FEE",
 "OPERATION_TYPE_TRACK_MFEE",
 "OPERATION_TYPE_TRACK_PFEE"
]);

function text(value:unknown){
 if(typeof value!=="string")return null;
 const clean=value.trim();
 return clean||null;
}

function finiteNumber(value:unknown):number|null{
 if(typeof value==="number")return Number.isFinite(value)?value:null;
 if(typeof value==="string"){
  const clean=value.replace(/\s/g,"").replace(",",".");
  if(!clean)return null;
  const parsed=Number(clean);
  return Number.isFinite(parsed)?parsed:null;
 }
 if(value&&typeof value==="object"){
  const row=value as Record<string,unknown>;
  if("units" in row){
   const units=finiteNumber(row.units),nano=row.nano==null?0:finiteNumber(row.nano);
   if(units==null||nano==null)return null;
   const parsed=units+nano/1e9;
   return Number.isFinite(parsed)?parsed:null;
  }
  if("value" in row)return finiteNumber(row.value);
 }
 return null;
}

function positiveQuantity(value:unknown){
 const parsed=finiteNumber(value);
 return parsed!=null&&parsed>0?parsed:null;
}

function normalizedDate(value:unknown){
 const raw=text(value);
 if(!raw)return null;
 const timestamp=Date.parse(raw);
 return Number.isFinite(timestamp)?new Date(timestamp).toISOString():null;
}

function bool(value:unknown){return value===true}

function classify(type:string,isIncome:boolean,isExternalCash:boolean):V3OperationKind{
 if(isIncome)return"INCOME";
 if(isExternalCash)return"EXTERNAL_CASH";
 if(TRADE_TYPES.has(type))return"TRADE";
 if(FEE_TYPES.has(type))return"FEE";
 return"OTHER";
}

function closeEnough(a:number,b:number){
 return Math.abs(a-b)<=Math.max(.01,Math.max(Math.abs(a),Math.abs(b))*1e-8);
}

function empty(reason:string):V3OperationsLedger{
 return{
  version:V3_OPERATIONS_LEDGER_VERSION,
  available:false,
  accountName:null,
  fetchedAt:null,
  coverageFrom:null,
  coverageTo:null,
  possiblyTruncated:false,
  rows:[],
  rejected:0,
  duplicates:0,
  traceableRatio:null,
  instrumentIdentityRatio:null,
  passiveIncomeTotal:null,
  externalCashTotal:null,
  aggregatesMatch:null,
  integrityLevel:"UNAVAILABLE",
  reason
 };
}

export function normalizeOperationsSummary(raw:unknown):V3OperationsLedger{
 if(!raw||typeof raw!=="object")return empty("Operations source returned no object payload.");
 const root=raw as Record<string,unknown>;
 if(root.ok!==true||!Array.isArray(root.operations))return empty("Operations source is not confirmed.");
 const account=root.account&&typeof root.account==="object"?root.account as Record<string,unknown>:{};
 const coverage=root.coverage&&typeof root.coverage==="object"?root.coverage as Record<string,unknown>:{};
 const seen=new Set<string>();
 const rows:V3OperationRow[]=[];
 let rejected=0,duplicates=0;

 root.operations.forEach((item,index)=>{
  if(!item||typeof item!=="object"){rejected++;return}
  const row=item as Record<string,unknown>;
  const date=normalizedDate(row.date),type=text(row.type)?.toUpperCase()??null,payment=finiteNumber(row.payment);
  if(!date||!type||payment==null){rejected++;return}
  const id=text(row.id);
  if(id&&seen.has(id)){duplicates++;return}
  if(id)seen.add(id);
  const isIncome=bool(row.isIncome),isExternalCash=bool(row.isExternalCash);
  rows.push({
   id,
   key:id??`untraceable:${date}:${type}:${index}`,
   date,
   type,
   name:text(row.name),
   ticker:text(row.ticker)?.toUpperCase()??null,
   figi:text(row.figi),
   instrumentUid:text(row.instrumentUid),
   payment,
   quantity:positiveQuantity(row.quantity),
   kind:classify(type,isIncome,isExternalCash)
  });
 });

 rows.sort((a,b)=>b.date.localeCompare(a.date)||a.key.localeCompare(b.key));

 const fromPayload=normalizedDate(coverage.observedFrom??coverage.from);
 const toPayload=normalizedDate(coverage.observedTo??coverage.to);
 const ascending=[...rows].sort((a,b)=>a.date.localeCompare(b.date));
 const coverageFrom=fromPayload??ascending[0]?.date??null;
 const coverageTo=toPayload??ascending.at(-1)?.date??null;
 const possiblyTruncated=coverage.possiblyTruncated===true||rows.length>=10_000;
 const traceableRatio=rows.length?rows.filter(row=>row.id!=null).length/rows.length:null;
 const instrumentRows=rows.filter(row=>row.kind==="TRADE"||row.kind==="INCOME");
 const instrumentIdentityRatio=instrumentRows.length
  ?instrumentRows.filter(row=>Boolean(row.instrumentUid||row.figi||row.ticker)).length/instrumentRows.length
  :null;

 const serverPassive=finiteNumber(root.passiveIncomeTotal);
 const serverExternal=finiteNumber(root.externalCashTotal);
 const localPassive=rows.filter(row=>row.kind==="INCOME").reduce((sum,row)=>sum+Math.abs(row.payment),0);
 const localExternal=rows.filter(row=>row.kind==="EXTERNAL_CASH").reduce((sum,row)=>sum+row.payment,0);
 const passiveMatch=serverPassive==null?null:closeEnough(serverPassive,localPassive);
 const externalMatch=serverExternal==null?null:closeEnough(serverExternal,localExternal);
 const aggregatesMatch=passiveMatch==null&&externalMatch==null?null:(passiveMatch!==false&&externalMatch!==false);

 const integrityLevel:V3IntegrityLevel=
  possiblyTruncated||rejected>0||duplicates>0||aggregatesMatch===false||(traceableRatio!=null&&traceableRatio<1)
   ?"PARTIAL":"OK";

 return{
  version:V3_OPERATIONS_LEDGER_VERSION,
  available:true,
  accountName:text(account.name),
  fetchedAt:normalizedDate(root.fetchedAt),
  coverageFrom,
  coverageTo,
  possiblyTruncated,
  rows,
  rejected,
  duplicates,
  traceableRatio,
  instrumentIdentityRatio,
  passiveIncomeTotal:serverPassive,
  externalCashTotal:serverExternal,
  aggregatesMatch,
  integrityLevel,
  reason:null
 };
}

export async function loadV3OperationsLedger(signal?:AbortSignal):Promise<V3OperationsLedger>{
 try{
  const response=await fetch("/api/operations-summary",{cache:"no-store",signal});
  if(!response.ok)return empty(`Operations source returned HTTP ${response.status}.`);
  return normalizeOperationsSummary(await response.json() as unknown);
 }catch(error){
  if(error instanceof DOMException&&error.name==="AbortError")throw error;
  return empty("Operations source is unavailable.");
 }
}
