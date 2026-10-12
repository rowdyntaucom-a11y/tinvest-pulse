import type{PortfolioInsight}from"./portfolioInsightsV227";
export type InsightEvidence={trusted:boolean;available:number;total:number;historyPoints:number;benchmarkPoints:number;warnings:string[]};
const valueOf=(insights:PortfolioInsight[],label:string)=>{const value=insights.find(x=>x.label===label)?.value;return typeof value==="number"&&Number.isFinite(value)?value:null};
/** Explain unavailable figures using only validated metrics, never raw or untrusted broker history. */
export function buildInsightEvidence(insights:PortfolioInsight[],trusted:boolean):InsightEvidence{
 if(!trusted)return{trusted:false,available:0,total:0,historyPoints:0,benchmarkPoints:0,warnings:["Подключённые данные брокера не подтверждены. Значения и сравнение с рынком скрыты."]};
 const available=insights.filter(x=>typeof x.value==="number"&&Number.isFinite(x.value)).length;
 const historyPoints=valueOf(insights,"Точек истории")??0;
 const benchmarkPoints=valueOf(insights,"Совместных точек")??0;
 const warnings:string[]=[];
 if(historyPoints<2)warnings.push("Для расчёта доходности и просадки портфеля требуется не менее двух проверенных исторических точек.");
 else if(valueOf(insights,"Рост индекса портфеля")===null)warnings.push("Исторический ряд не подтверждён как индекс стоимости портфеля. Доходность и просадка не рассчитываются по неподходящим данным.");
 if(benchmarkPoints<2)warnings.push("Для сравнения с IMOEX требуются не менее двух совпадающих подтверждённых дат.");
 else if(valueOf(insights,"Разница доходностей")===null)warnings.push("Общие даты IMOEX найдены, но вычислить достоверное опережение портфеля пока невозможно.");
 if(available<insights.length&&warnings.length===0)warnings.push("Для части показателей отсутствуют необходимые данные. Вместо неподтверждённых чисел показан прочерк.");
 return{trusted:true,available,total:insights.length,historyPoints,benchmarkPoints,warnings};
}
