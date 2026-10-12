import type {PortfolioInsight} from "./portfolioInsightsV227";

const safeCell=(value:string)=>{const protectedValue=/^[\s]*[=+@-]/.test(value)?"'"+value:value;return '"'+protectedValue.replace(/"/g,'""')+'"'};
export function insightsToCsv(rows:PortfolioInsight[],accountName:string,asOf:string):string{
 const lines=[["QVANIX · аналитика портфеля"],["Портфель",accountName],["Дата выгрузки",asOf],[],["Раздел","Показатель","Значение","Единица"]];
 const units={rub:"₽",pct:"%",count:"шт.",number:"число"} as const;
 for(const item of rows)lines.push([item.group,item.label,item.value==null?"":String(item.value),units[item.unit]]);
 return "\uFEFF"+lines.map(row=>row.map(safeCell).join(";")).join("\r\n")+"\r\n";
}
export function insightsComparisonToCsv(rows:PortfolioInsight[],accountName:string,baseline:{date:string;metrics:Record<string,number>},asOf:string):string{const lines=[["QVANIX · сравнение аналитики"],["Портфель",accountName],["Дата фиксации",baseline.date],["Дата сравнения",asOf],[],["Раздел","Показатель","Было","Сейчас","Изменение","Единица"]];const units={rub:"₽",pct:"п.п.",count:"шт.",number:"число"} as const;for(const item of rows){const previous=baseline.metrics[item.label],current=item.value;const valid=Number.isFinite(previous)&&current!=null&&Number.isFinite(current);lines.push([item.group,item.label,Number.isFinite(previous)?String(previous):"",current==null?"":String(current),valid?String(current-previous):"",units[item.unit]])}return "\\uFEFF".replace("\\uFEFF","\uFEFF")+lines.map(row=>row.map(safeCell).join(";")).join("\r\n")+"\r\n"}
export function exportInsightsCsv(rows:PortfolioInsight[],accountName:string,baseline?:{date:string;metrics:Record<string,number>}):void{
 if(!rows.length)return;
 const now=new Date(),day=now.toISOString().slice(0,10);
 const blob=new Blob([baseline?insightsComparisonToCsv(rows,accountName,baseline,now.toISOString()):insightsToCsv(rows,accountName,now.toISOString())],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 try{link.href=url;link.download="qvanix-analytics-"+(baseline?"compare-":"")+day+".csv";document.body.appendChild(link);link.click()}finally{link.remove();URL.revokeObjectURL(url)}
}
