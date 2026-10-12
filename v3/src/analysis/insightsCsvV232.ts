import type {PortfolioInsight} from "./portfolioInsightsV227";

const safeCell=(value:string)=>{const protectedValue=/^[\s]*[=+@-]/.test(value)?"'"+value:value;return '"'+protectedValue.replace(/"/g,'""')+'"'};
export function insightsToCsv(rows:PortfolioInsight[],accountName:string,asOf:string):string{
 const lines=[["QVANIX · аналитика портфеля"],["Портфель",accountName],["Дата выгрузки",asOf],[],["Раздел","Показатель","Значение","Единица"]];
 const units={rub:"₽",pct:"%",count:"шт.",number:"число"} as const;
 for(const item of rows)lines.push([item.group,item.label,item.value==null?"":String(item.value),units[item.unit]]);
 return "\uFEFF"+lines.map(row=>row.map(safeCell).join(";")).join("\r\n")+"\r\n";
}
export function exportInsightsCsv(rows:PortfolioInsight[],accountName:string):void{
 if(!rows.length)return;
 const now=new Date(),day=now.toISOString().slice(0,10);
 const blob=new Blob([insightsToCsv(rows,accountName,now.toISOString())],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 try{link.href=url;link.download="qvanix-analytics-"+day+".csv";document.body.appendChild(link);link.click()}finally{link.remove();URL.revokeObjectURL(url)}
}
