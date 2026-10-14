import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{resolveValidatedHistory}from"./validatedHistoryV244.ts";

export type MonthlyQuality="complete"|"partial"|"sparse"|"insufficient"|"no_benchmark"|"no_data";
export type MonthlyComparison={
 month:string;year:number;monthNumber:number;quality:MonthlyQuality;
 startDate:string|null;endDate:string|null;points:number;maxGapDays:number;
 portfolioPct:number|null;imoexPct:number|null;alphaPp:number|null;reason:string;
};
export type MonthlyPerformance={trusted:boolean;years:number[];months:MonthlyComparison[];reason:string|null};
const DAY=86400000;
const utc=(d:string)=>Date.parse(d+"T00:00:00.000Z");
const between=(a:string,b:string)=>(utc(b)-utc(a))/DAY;
const paired=(p:HistoryPoint)=>p.portfolio!=null&&p.portfolio>0&&Number.isFinite(p.portfolio)&&p.imoex!=null&&p.imoex>0&&Number.isFinite(p.imoex);
const labels:Record<MonthlyQuality,string>={
 complete:"Полный месяц: доступна база перед началом и заключительная цена у конца месяца",
 partial:"Неполный месяц: рассчитана доходность только за фактические даты",
 sparse:"Разреженная история: между подтверждёнными точками более 10 дней",
 insufficient:"Недостаточно наблюдений для доходности месяца",
 no_benchmark:"В этом месяце нет совместных дат портфеля и IMOEX",
 no_data:"Нет подтверждённых наблюдений за месяц"
};
const empty=(month:string,quality:MonthlyQuality,startDate:string|null=null,endDate:string|null=null,points=0,maxGapDays=0):MonthlyComparison=>({
 month,year:Number(month.slice(0,4)),monthNumber:Number(month.slice(5,7)),quality,startDate,endDate,points,maxGapDays,
 portfolioPct:null,imoexPct:null,alphaPp:null,reason:labels[quality]
});
/**
 * Calendar months are not rolling 30-day windows. Calculations use an actual last
 * synchronized trading close no older than seven calendar days before month start.
 * Without it the first in-month observation is used, and coverage is only partial.
 * Never synthesize zero-return points for holidays or missing benchmark quotations.
 */
export function calculateMonthlyPerformance(history:HistoryPoint[],trusted:boolean):MonthlyPerformance{
 if(!trusted)return{trusted:false,years:[],months:[],reason:"Брокерские данные не подтверждены."};
 const {points,isPortfolioIndex}=resolveValidatedHistory(history);
 if(!isPortfolioIndex)return{trusted:true,years:[],months:[],reason:"История не подтверждена как индекс доходности без пополнений и выводов."};
 if(!points.length)return{trusted:true,years:[],months:[],reason:"Нет подтверждённой истории портфеля."};
 const years=[...new Set(points.map(p=>Number(p.date.slice(0,4))))].sort((a,b)=>b-a);
 const quotes=points.filter(paired),byMonth=new Map<string,HistoryPoint[]>(),portfolioByMonth=new Map<string,HistoryPoint[]>();
 for(const p of points){const k=p.date.slice(0,7),group=portfolioByMonth.get(k)??[];group.push(p);portfolioByMonth.set(k,group)}
 for(const p of quotes){const k=p.date.slice(0,7);const list=byMonth.get(k)??[];list.push(p);byMonth.set(k,list)}
 const months:MonthlyComparison[]=[];
 let priorIndex=0,prior:HistoryPoint|null=null;
 // Iterate in chronological order, then reverse for the UI; cap to portfolio-observed calendar years.
 for(const year of [...years].reverse()){
  for(let m=1;m<=12;m++){
   const month=year+"-"+String(m).padStart(2,"0");
   const start=month+"-01";
   const lastOfMonth=new Date(Date.UTC(year,m,0)).toISOString().slice(0,10);
   while(priorIndex<quotes.length&&quotes[priorIndex].date<start){prior=quotes[priorIndex];priorIndex++}
   const inMonth=byMonth.get(month)??[];
   const portfolioMonth=portfolioByMonth.get(month)??[];
   if(!portfolioMonth.length){months.push(empty(month,"no_data"));continue}
   if(!inMonth.length){months.push(empty(month,"no_benchmark",portfolioMonth[0].date,portfolioMonth.at(-1)!.date));continue}
   const validPrior=prior!==null&&between(prior.date,start)<=7;
   const startPoint=validPrior?prior!:inMonth[0];
   const end=inMonth.at(-1)!;
   const observed=validPrior?[startPoint,...inMonth]:inMonth;
   let maxGapDays=0;
   for(let i=1;i<observed.length;i++)maxGapDays=Math.max(maxGapDays,between(observed[i-1].date,observed[i].date));
   if(observed.length<2||between(startPoint.date,end.date)<=0){
    months.push(empty(month,"insufficient",startPoint.date,end.date,inMonth.length,maxGapDays));continue
   }
   const port=(end.portfolio!/startPoint.portfolio!-1)*100,index=(end.imoex!/startPoint.imoex!-1)*100,alpha=port-index;
   if(![port,index,alpha].every(Number.isFinite)){
    months.push(empty(month,"insufficient",startPoint.date,end.date,inMonth.length,maxGapDays));continue
   }
   const endClose=between(end.date,lastOfMonth)<=7;
   const firstOpen=between(start,inMonth[0].date)<=7;
   const quality:MonthlyQuality=maxGapDays>10?"sparse":validPrior&&firstOpen&&endClose?"complete":"partial";
   months.push({month,year,monthNumber:m,quality,startDate:startPoint.date,endDate:end.date,points:inMonth.length,maxGapDays,portfolioPct:port,imoexPct:index,alphaPp:alpha,reason:labels[quality]});
  }
 }
 return{trusted:true,years,months:months.reverse(),reason:null};
}
export function monthlyPerformanceCsv(result:MonthlyPerformance,year?:number):string|null{
 if(!result.trusted||!result.years.length)return null;
 if(year!==undefined&&!result.years.includes(year))return null;
 const rows=result.months.filter(m=>year===undefined||m.year===year);
 const cell=(s:string)=>{const formula=/^\s*[=+@-]/.test(s)&&!/^[+-](?:\d+(?:\.\d*)?|\.\d+)$/.test(s);return '"'+(formula?"'":"")+s.replace(/"/g,'""')+'"'};
 const fixed=(n:number|null)=>n===null?"":Number.isFinite(n)?String(Number(n.toFixed(10))):"";
 const lines=[["QVANIX · помесячная доходность"],["Месяц","Статус","Начало","Конец","Совместных точек","Портфель, %","IMOEX, %","Разница, п.п.","Максимальный пробел, дней"]];
 for(const m of rows)lines.push([m.month,m.reason,m.startDate??"",m.endDate??"",String(m.points),fixed(m.portfolioPct),fixed(m.imoexPct),fixed(m.alphaPp),String(m.maxGapDays)]);
 return"\uFEFF"+lines.map(row=>row.map(cell).join(";")).join("\r\n")+"\r\n";
}
