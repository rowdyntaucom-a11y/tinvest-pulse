import type{PortfolioSnapshot}from"../../../v2/src/lib/portfolioApi";

const record=(value:unknown):value is Record<string,unknown>=>value!==null&&typeof value==="object"&&!Array.isArray(value);
const finite=(value:unknown):value is number=>typeof value==="number"&&Number.isFinite(value);
const nullableFinite=(value:unknown)=>value===null||finite(value);
const numericFields=["value","profit","profitPct","passiveIncome","averageMonthlyPassiveIncome","averageAnnualPassiveIncome","positions"] as const;
const positionFields=["quantity","averagePrice","costBasis","currentPrice","currentValue","expectedYield","weight"] as const;
const historyFields=["portfolio","imoex","value","invested"] as const;

/** Browser cache is an untrusted transport and cannot establish a live broker read. */
export function parseTrustedSnapshotCache(raw:string|null,nowMs:number,maxAgeMs:number):PortfolioSnapshot|null{
 if(!raw||!finite(nowMs)||!finite(maxAgeMs)||maxAgeMs<0)return null;
 try{
  const envelope:unknown=JSON.parse(raw);
  if(!record(envelope)||!finite(envelope.savedAt)||envelope.savedAt<=0||envelope.savedAt>nowMs||nowMs-envelope.savedAt>maxAgeMs)return null;
  const snapshot=envelope.snapshot;
  if(!record(snapshot)||(snapshot.source!=="dashboard"&&snapshot.source!=="portfolio")||typeof snapshot.accountName!=="string")return null;
  if(!numericFields.every(field=>finite(snapshot[field])))return null;
  if((snapshot.value as number)<0||(snapshot.positions as number)<0||!Number.isInteger(snapshot.positions))return null;
  if(!["xirr","cagr","riskFreeRate"].every(field=>nullableFinite(snapshot[field])))return null;
  if(!Array.isArray(snapshot.positionItems)||!snapshot.positionItems.every(item=>record(item)&&typeof item.ticker==="string"&&typeof item.name==="string"&&positionFields.every(field=>finite(item[field]))))return null;
  if(!Array.isArray(snapshot.history)||!snapshot.history.every(row=>record(row)&&typeof row.date==="string"&&historyFields.every(field=>nullableFinite(row[field]))))return null;
  return snapshot as unknown as PortfolioSnapshot;
 }catch{return null}
}
