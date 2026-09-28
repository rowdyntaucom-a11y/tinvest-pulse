import type{BondIncomeLinkage}from"../../../v2/src/features/income/bondIncomeLinkage";
import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";

export const BOND_CASHFLOW_PROFILE_VERSION="1.0" as const;
export type BondCashflowMonth={key:string;gross:number;events:number;issues:number};
export type BondCashflowProfile={
 version:typeof BOND_CASHFLOW_PROFILE_VERSION;available:boolean;
 scheduledGross:number;couponEvents:number;activeMonths:number;coveredMonths:number;
 largestMonthGross:number|null;largestMonthShare:number|null;
 topIssueGross:number|null;topIssueShare:number|null;
 linkedBondCount:number;eligibleBondCount:number;valueCoverage:number;
 months:BondCashflowMonth[];note:string;
};
const positive=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:0};
const figi=(v:unknown)=>String(v??"").trim().toUpperCase();
const monthKey=(v:unknown)=>{const s=String(v??"").slice(0,7);return /^\d{4}-\d{2}$/.test(s)?s:null};

export function buildBondCashflowProfile(linkage:BondIncomeLinkage,events:PayoutEvent[]):BondCashflowProfile{
 const linked=new Set(linkage.rows.map(row=>figi(row.figi)).filter(Boolean));
 const map=new Map<string,{gross:number;events:number;issues:Set<string>}>();
 for(const event of Array.isArray(events)?events:[]){
  if(String(event.kind||"").toUpperCase()!=="COUPON"||String(event.status||"").toUpperCase()==="FACT")continue;
  const id=figi(event.figi),key=monthKey(event.date),gross=positive(event.gross);
  if(!id||!linked.has(id)||!key||!(gross>0))continue;
  const row=map.get(key)??{gross:0,events:0,issues:new Set<string>()};
  row.gross+=gross;row.events+=1;row.issues.add(id);map.set(key,row);
 }
 const months=[...map.entries()].map(([key,row])=>({key,gross:row.gross,events:row.events,issues:row.issues.size})).sort((a,b)=>a.key.localeCompare(b.key));
 const scheduledGross=months.reduce((s,m)=>s+m.gross,0),couponEvents=months.reduce((s,m)=>s+m.events,0);
 const largestMonthGross=months.length?Math.max(...months.map(m=>m.gross)):null;
 const topIssueGross=linkage.rows.length?Math.max(...linkage.rows.map(row=>positive(row.scheduledGross))):null;
 return{
  version:BOND_CASHFLOW_PROFILE_VERSION,
  available:linkage.eligibleBondCount>0&&linkage.linkedBondCount>0&&scheduledGross>0,
  scheduledGross,couponEvents,activeMonths:months.length,coveredMonths:12,
  largestMonthGross,largestMonthShare:largestMonthGross!=null&&scheduledGross>0?largestMonthGross/scheduledGross:null,
  topIssueGross,topIssueShare:topIssueGross!=null&&scheduledGross>0?topIssueGross/scheduledGross:null,
  linkedBondCount:linkage.linkedBondCount,eligibleBondCount:linkage.eligibleBondCount,valueCoverage:linkage.valueCoverage,
  months,
  note:"Forward coupon profile reuses only trusted scheduled coupon events already linked to current bonds by exact FIGI. Amounts are gross schedule values, not realized income; FACT events are excluded.",
 };
}
