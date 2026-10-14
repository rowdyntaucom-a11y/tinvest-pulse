import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{resolveValidatedHistory}from"./validatedHistoryV244.ts";
export type AnnualCoverage="full"|"partial"|"sparse"|"insufficient"|"no_benchmark";
export type AnnualComparison={
 year:number;status:AnnualCoverage;startDate:string|null;endDate:string|null;points:number;
 portfolioPct:number|null;imoexPct:number|null;alphaPp:number|null;
 maxGapDays:number;reason:string;
};
export type AnnualPerformance={trusted:boolean;rows:AnnualComparison[];reason:string|null};
const DAY_MS=86400000;
const utc=(date:string)=>Date.parse(date+"T00:00:00.000Z");
const days=(a:string,b:string)=>(utc(b)-utc(a))/DAY_MS;
const valid=(x:HistoryPoint)=>x.portfolio!=null&&Number.isFinite(x.portfolio)&&x.portfolio>0&&x.imoex!=null&&Number.isFinite(x.imoex)&&x.imoex>0;
const names:Record<AnnualCoverage,string>={
 full:"Полный календарный год",
 partial:"Неполный год — результат только за указанные даты",
 sparse:"Разреженная история — есть пробелы более 45 дней",
 insufficient:"Недостаточно разных дат для расчёта",
 no_benchmark:"Нет подтверждённых общих точек IMOEX"
};
/**
 * Calendar-year performance uses the last synchronized close before Jan 1 when it is
 * no older than 14 calendar days; otherwise it starts at the first validated close
 * within that year and explicitly marks a partial year. Never invent Jan 1 quotes.
 */
export function calculateAnnualPerformance(history:HistoryPoint[],trusted:boolean):AnnualPerformance{
 if(!trusted)return{trusted:false,rows:[],reason:"Нет подтверждённых данных брокера."};
 const resolved=resolveValidatedHistory(history);
 if(!resolved.isPortfolioIndex)return{trusted:true,rows:[],reason:"История не подтверждена как индекс стоимости портфеля без влияния внешних потоков."};
 const portfolio=resolved.points;
 const paired=portfolio.filter(valid);
 const years=[...new Set(portfolio.map(point=>Number(point.date.slice(0,4))))].sort((a,b)=>b-a);
 const rows:AnnualComparison[]=[];
 for(const year of years){
  const current=paired.filter(point=>Number(point.date.slice(0,4))===year);
  const portfolioYear=portfolio.filter(point=>Number(point.date.slice(0,4))===year);
  if(!current.length){
   rows.push({year,status:"no_benchmark",startDate:portfolioYear[0]?.date??null,endDate:portfolioYear.at(-1)?.date??null,points:0,portfolioPct:null,imoexPct:null,alphaPp:null,maxGapDays:0,reason:names.no_benchmark});continue;
  }
  const jan1=year+"-01-01",dec31=year+"-12-31";
  const prior=paired.filter(point=>point.date<jan1).at(-1)??null;
  const validPrior=prior!==null&&days(prior.date,jan1)<=14;
  const baseline=validPrior?prior!:current[0];
  const end=current.at(-1)!;
  const observations=validPrior?[baseline,...current]:current;
  const gaps=observations.slice(1).map((point,index)=>days(observations[index].date,point.date));
  const maxGapDays=gaps.reduce((worst,gap)=>Math.max(worst,gap),0);
  const spanDays=days(baseline.date,end.date);
  const from=baseline.date,to=end.date;
  if(spanDays<=0||observations.length<2){
   rows.push({year,status:"insufficient",startDate:from,endDate:to,points:current.length,portfolioPct:null,imoexPct:null,alphaPp:null,maxGapDays,reason:names.insufficient});continue;
  }
  const portfolioPct=(end.portfolio!/baseline.portfolio!-1)*100;
  const imoexPct=(end.imoex!/baseline.imoex!-1)*100;
  const alphaPp=portfolioPct-imoexPct;
  if(![portfolioPct,imoexPct,alphaPp].every(Number.isFinite)){
   rows.push({year,status:"insufficient",startDate:from,endDate:to,points:current.length,portfolioPct:null,imoexPct:null,alphaPp:null,maxGapDays,reason:names.insufficient});continue;
  }
  const startNear=days(jan1,current[0].date)<=14;
  const endNear=days(end.date,dec31)<=14;
  const status:AnnualCoverage=maxGapDays>45?"sparse":validPrior&&startNear&&endNear?"full":"partial";
  rows.push({year,status,startDate:from,endDate:to,points:current.length,portfolioPct,imoexPct,alphaPp,maxGapDays,reason:names[status]});
 }
 return{trusted:true,rows,reason:rows.length?null:"Нет подтверждённых исторических точек для сравнения с IMOEX."};
}
export function annualPerformanceCsv(result:AnnualPerformance):string|null{
 if(!result.trusted||!result.rows.length)return null;
 const lines=[["QVANIX · календарные результаты"],["Год","Статус","Начало периода","Конец периода","Общих точек","Портфель, %","IMOEX, %","Разница, п.п.","Максимальный перерыв, дней"]];
 const formatValue=(n:number|null)=>n===null?"":String(Number(n.toFixed(10)));
 for(const row of result.rows){
  if(!Number.isInteger(row.year)||row.year<1900||row.year>9999)return null;
  lines.push([String(row.year),row.reason,row.startDate??"",row.endDate??"",String(row.points),formatValue(row.portfolioPct),formatValue(row.imoexPct),formatValue(row.alphaPp),String(row.maxGapDays)]);
 }
 const safeCell=(cell:string)=>{const formula=/^[\s]*[=+@-]/.test(cell)&&!/^[+-](?:\d+(?:\.\d*)?|\.\d+)$/.test(cell);return '"' +(formula?"'":"")+cell.replace(/"/g,'""')+'"'};
 return"\uFEFF"+lines.map(row=>row.map(safeCell).join(";")).join("\r\n")+"\r\n";
}
