import type{V3OperationRow}from"./operationsLedger";
export type OperationsDailyRowV186={date:string;count:number;buyCount:number;sellCount:number;buyRub:number;sellRub:number;incomeRub:number;feesRub:number;externalNet:number;otherCount:number};
export type OperationsDailyV186={available:boolean;days:OperationsDailyRowV186[];reason:string|null};
const BUY=new Set(["OPERATION_TYPE_BUY","OPERATION_TYPE_DELIVERY_BUY","OPERATION_TYPE_PRIMARY_ORDER"]);
const SELL=new Set(["OPERATION_TYPE_SELL","OPERATION_TYPE_DELIVERY_SELL"]);
export function buildOperationsDailyV186(rows:V3OperationRow[]):OperationsDailyV186{
 if(!rows.length)return{available:false,days:[],reason:"Нет подтверждённых операций для дневного среза."};
 const map=new Map<string,OperationsDailyRowV186>();
 for(const row of rows){const date=row.date.slice(0,10);let d=map.get(date);if(!d){d={date,count:0,buyCount:0,sellCount:0,buyRub:0,sellRub:0,incomeRub:0,feesRub:0,externalNet:0,otherCount:0};map.set(date,d)}d.count++;
  if(row.kind==="TRADE"){if(BUY.has(row.type)){d.buyCount++;d.buyRub+=Math.abs(row.payment)}else if(SELL.has(row.type)){d.sellCount++;d.sellRub+=Math.abs(row.payment)}else d.otherCount++}
  else if(row.kind==="INCOME")d.incomeRub+=Math.abs(row.payment);
  else if(row.kind==="FEE")d.feesRub+=Math.abs(row.payment);
  else if(row.kind==="EXTERNAL_CASH")d.externalNet+=row.payment;
  else d.otherCount++;
 }
 return{available:true,days:[...map.values()].sort((a,b)=>b.date.localeCompare(a.date)),reason:null};
}