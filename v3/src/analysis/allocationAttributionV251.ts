import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

export type AssetClass="government_bonds"|"corporate_bonds"|"equities"|"funds"|"futures"|"currencies"|"other";
export type AttributionPosition={id:string;ticker:string;name:string;assetClass:AssetClass;currentValue:number;costBasis:number;unrealizedPnl:number;weightPct:number|null;costReturnPct:number|null;basisDifference:number;};
export type AttributionGroup={assetClass:AssetClass;title:string;positions:number;currentValue:number;costBasis:number;unrealizedPnl:number;weightPct:number|null;costReturnPct:number|null;};
export type AllocationAttribution={trusted:boolean;count:number;total:number|null;costBasis:number|null;unrealizedPnl:number|null;unrealizedPct:number|null;hhi:number|null;top1Pct:number|null;top5Pct:number|null;unreconciledCount:number;classes:AttributionGroup[];positions:AttributionPosition[];reason:string|null};
export const ASSET_NAMES:Record<AssetClass,string>={
 government_bonds:"ОФЗ и госбумаги",corporate_bonds:"Корпоративные облигации",equities:"Акции",funds:"Фонды",futures:"Фьючерсы",currencies:"Валюты",other:"Прочие инструменты"
};
export const ASSET_ORDER:AssetClass[]=["equities","government_bonds","corporate_bonds","funds","futures","currencies","other"];
export function classifyPosition(position:Pick<PositionSnapshot,"instrumentType"|"ticker"|"name">):AssetClass{
 const kind=position.instrumentType.toLowerCase().trim();
 if(["share","stock","equity"].includes(kind))return"equities";
 if(["bond","bonds"].includes(kind)){
  const ticker=position.ticker.trim().toUpperCase();
  return /^SU\d{5,}/.test(ticker)||/(?:^|[^A-Za-zА-Яа-яЁё])ОФЗ(?:$|[^A-Za-zА-Яа-яЁё])/i.test(position.name)?"government_bonds":"corporate_bonds";
 }
 if(["etf","sp","mutualfund","fund","investment_fund","bpif"].includes(kind))return"funds";
 if(["future","futures"].includes(kind))return"futures";
 if(["currency","currencies","fx"].includes(kind))return"currencies";
 return"other";
}
const finite=(value:number)=>typeof value==="number"&&Number.isFinite(value);
const pct=(part:number,denom:number)=>denom>0?part/denom*100:null;
const totalOf=(values:number[])=>values.reduce((acc,v)=>acc+v,0);
/** This panel explains mark-to-market position PnL; it is not TWR or realized investor profit. */
export function buildAllocationAttribution(positions:PositionSnapshot[],trusted:boolean):AllocationAttribution{
 const empty:AllocationAttribution={trusted:false,count:0,total:null,costBasis:null,unrealizedPnl:null,unrealizedPct:null,hhi:null,top1Pct:null,top5Pct:null,unreconciledCount:0,classes:[],positions:[],reason:"Брокерские данные не подтверждены."};
 if(!trusted)return empty;
 const records=positions.map((position,index)=>({position,index})).filter(({position:x})=>finite(x.currentValue)&&x.currentValue>=0&&finite(x.expectedYield)&&finite(x.costBasis)&&x.costBasis>=0);
 const total=totalOf(records.map(x=>x.position.currentValue)),cost=totalOf(records.map(x=>x.position.costBasis)),unrealized=totalOf(records.map(x=>x.position.expectedYield));
 if(![total,cost,unrealized].every(finite))return{...empty,trusted:true,reason:"Агрегаты позиций выходят за пределы конечных чисел."};
 const valid=records.map(({position,index})=>{
  const difference=(position.currentValue-position.costBasis)-position.expectedYield;
  return{id:(position.instrumentUid||position.figi||position.ticker)+"-"+index,ticker:position.ticker,name:position.name,
   assetClass:classifyPosition(position),currentValue:position.currentValue,costBasis:position.costBasis,
   unrealizedPnl:position.expectedYield,weightPct:pct(position.currentValue,total),
   costReturnPct:pct(position.expectedYield,position.costBasis),basisDifference:difference};
 }).sort((a,b)=>b.currentValue-a.currentValue||a.id.localeCompare(b.id));
 const groups:AttributionGroup[]=ASSET_ORDER.map(assetClass=>{
  const rows=valid.filter(x=>x.assetClass===assetClass);
  const market=totalOf(rows.map(x=>x.currentValue)),basis=totalOf(rows.map(x=>x.costBasis)),pnl=totalOf(rows.map(x=>x.unrealizedPnl));
  return{assetClass,title:ASSET_NAMES[assetClass],positions:rows.length,currentValue:market,costBasis:basis,unrealizedPnl:pnl,weightPct:pct(market,total),costReturnPct:pct(pnl,basis)};
 }).filter(group=>group.positions>0);
 const hhi=total>0?valid.reduce((v,x)=>v+(x.currentValue/total)**2,0)*10000:null;
 return{trusted:true,count:valid.length,total,costBasis:cost,unrealizedPnl:unrealized,unrealizedPct:pct(unrealized,cost),hhi,
 top1Pct:valid[0]?pct(valid[0].currentValue,total):null,
 top5Pct:valid.length?pct(totalOf(valid.slice(0,5).map(x=>x.currentValue)),total):null,
 unreconciledCount:valid.filter(x=>Math.abs(x.basisDifference)>Math.max(1,x.costBasis*0.01)).length,
 classes:groups,positions:valid,reason:valid.length?null:"Нет пригодных для расчёта открытых позиций."};
}
const csvCell=(value:string)=>{
 const formula=/^\s*[=+@-]/.test(value)&&!/^[+-](?:\d+(?:\.\d*)?|\.\d+)$/.test(value);
 return'"'+(formula?"'":"")+value.replace(/"/g,'""')+'"';
};
export function allocationAttributionCsv(data:AllocationAttribution,assetClass:AssetClass|"all"="all"):string|null{
 if(!data.trusted||!data.positions.length||data.total===null)return null;
 const rows=data.positions.filter(position=>assetClass==="all"||position.assetClass===assetClass);
 if(!rows.length)return null;
 const lines=[["QVANIX · структура открытых позиций"],["Основа","Рыночная стоимость учтённых позиций; не доходность TWR"],["Класс",assetClass==="all"?"Все":ASSET_NAMES[assetClass]],
 ["Тикер","Название","Класс","Рыночная стоимость, ₽","Затраты, ₽","Нереализованный результат, ₽","Доля, %","Результат к затратам, %","Расхождение между стоимостью, затратами и результатом, ₽"]];
 const num=(x:number|null)=>x===null?"":finite(x)?String(Number(x.toFixed(10))):"";
 for(const p of rows)lines.push([p.ticker,p.name,ASSET_NAMES[p.assetClass],num(p.currentValue),num(p.costBasis),num(p.unrealizedPnl),num(p.weightPct),num(p.costReturnPct),num(p.basisDifference)]);
 return"\uFEFF"+lines.map(row=>row.map(csvCell).join(";")).join("\r\n")+"\r\n";
}
