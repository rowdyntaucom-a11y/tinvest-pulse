import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{resolveValidatedHistory}from"./validatedHistoryV244";
export type BenchmarkPeriod="1m"|"3m"|"6m"|"12m"|"all";
export const BENCHMARK_PERIODS:{value:BenchmarkPeriod;label:string}[]=[{value:"1m",label:"1 мес."},{value:"3m",label:"3 мес."},{value:"6m",label:"6 мес."},{value:"12m",label:"1 год"},{value:"all",label:"Всё"}];
type ComparisonStatus="ok"|"untrusted"|"not_index"|"no_overlap"|"stale"|"short_window";
export type BenchmarkPeriodComparison={status:ComparisonStatus;reason:string;startDate:string|null;endDate:string|null;points:number;portfolioPct:number|null;imoexPct:number|null;alphaPp:number|null;portfolioDrawdownPct:number|null;imoexDrawdownPct:number|null;portfolioCagrPct:number|null;days:number|null};
const DAY=86400000;
const millis=(date:string)=>Date.parse(date+"T00:00:00.000Z");
const windowStart=(date:string,months:number)=>{
 const dt=new Date(millis(date));const year=dt.getUTCFullYear();const target=dt.getUTCMonth()-months;const first=new Date(Date.UTC(year,target,1));const lastDay=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 const clipped=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),Math.min(dt.getUTCDate(),lastDay)));
 return clipped.toISOString().slice(0,10);
};
const drawdown=(xs:number[])=>{let peak=0;let worst=0;for(const v of xs){if(!Number.isFinite(v)||v<=0)return null;peak=Math.max(peak,v);worst=Math.min(worst,(v/peak-1)*100)}return worst};
const empty=(status:ComparisonStatus,reason:string,startDate:string|null=null,endDate:string|null=null,points=0):BenchmarkPeriodComparison=>({status,reason,startDate,endDate,points,portfolioPct:null,imoexPct:null,alphaPp:null,portfolioDrawdownPct:null,imoexDrawdownPct:null,portfolioCagrPct:null,days:null});
/**
 * Independent of deposits: works only for an established wealth-index series, not raw account value
 * or legacy decimal daily returns. Portfolio and IMOEX always use the SAME start/end timestamps.
 * A calendar period requires an observation within 7 days after its boundary.
 */
export function calculateBenchmarkPeriod(history:HistoryPoint[],trusted:boolean,period:BenchmarkPeriod):BenchmarkPeriodComparison{
 if(!trusted)return empty("untrusted","Для сравнения необходим подтверждённый источник брокерских данных.");
 const {points:valid,isPortfolioIndex}=resolveValidatedHistory(history);
 if(!isPortfolioIndex)return empty("not_index","Ряд доходности портфеля не подтверждён как индекс, очищенный от пополнений и выводов.");
 const paired=valid.filter(p=>p.portfolio!=null&&p.portfolio>0&&p.imoex!=null&&p.imoex>0&&Number.isFinite(p.portfolio)&&Number.isFinite(p.imoex));
 if(paired.length<2)return empty("no_overlap","Для сопоставления с IMOEX требуются минимум две общие подтверждённые даты.",null,paired.at(-1)?.date??null,paired.length);
 const last=paired.at(-1)!;const latest=valid.at(-1)!;
 if((millis(latest.date)-millis(last.date))/DAY>7)return empty("stale","IMOEX отстаёт от последней даты портфеля более чем на 7 дней. Нельзя показывать устаревшую доходность как текущую.",null,last.date,paired.length);
 const months=period==="1m"?1:period==="3m"?3:period==="6m"?6:period==="12m"?12:0;
 const boundary=months?windowStart(last.date,months):paired[0].date;
 const selected=paired.filter(p=>p.date>=boundary);
 const first=selected[0];
 if(!first||selected.length<2||months&&(millis(first.date)-millis(boundary))/DAY>7)return empty("short_window","Недостаточно совпадающих дат в начале выбранного периода (допуск 7 дней).",first?.date??null,last.date,selected.length);
 const days=(millis(last.date)-millis(first.date))/DAY;
 if(days<=0)return empty("short_window","Невозможно рассчитать доходность на нулевом временном интервале.",first.date,last.date,selected.length);
 const port=(last.portfolio!/first.portfolio!-1)*100,benchmark=(last.imoex!/first.imoex!-1)*100;
 const cagr=days>=365?((last.portfolio!/first.portfolio!)**(365.2425/days)-1)*100:null;
 if(![port,benchmark].every(Number.isFinite)||cagr!==null&&!Number.isFinite(cagr))return empty("short_window","В выбранном периоде расчёт приводит к некорректному числу.",first.date,last.date,selected.length);
 return{status:"ok",reason:"Расчёт по совпадающим подтверждённым датам; просадки — только по наблюдаемым точкам.",startDate:first.date,endDate:last.date,points:selected.length,portfolioPct:port,imoexPct:benchmark,alphaPp:port-benchmark,portfolioDrawdownPct:drawdown(selected.map(p=>p.portfolio!)),imoexDrawdownPct:drawdown(selected.map(p=>p.imoex!)),portfolioCagrPct:cagr,days};
}
