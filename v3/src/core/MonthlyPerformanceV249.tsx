import{useMemo,useState}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{calculateMonthlyPerformance,monthlyPerformanceCsv,type MonthlyComparison}from"../analysis/monthlyPerformanceV249";

const monthNames=["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
const format=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2,signDisplay:"exceptZero"});
const pct=(value:number|null)=>value===null?"—":format.format(value)+"%";
const pp=(value:number|null)=>value===null?"—":format.format(value)+" п.п.";
const short=(row:MonthlyComparison)=>row.alphaPp===null?"—":format.format(row.alphaPp);
export function MonthlyPerformanceV249({history,trusted}:{history:HistoryPoint[];trusted:boolean}){
 const result=useMemo(()=>calculateMonthlyPerformance(history,trusted),[history,trusted]);
 const[yearChoice,setYearChoice]=useState<number|null>(null);
 const[monthChoice,setMonthChoice]=useState<string|null>(null);
 if(!result.trusted||!result.years.length)return null;
 const year=yearChoice!==null&&result.years.includes(yearChoice)?yearChoice:result.years[0];
 const months=result.months.filter(item=>item.year===year).sort((a,b)=>a.monthNumber-b.monthNumber);
 const defaultMonth=[...months].reverse().find(item=>item.quality!=="no_data"&&item.quality!=="no_benchmark")?.month??[...months].reverse().find(item=>item.quality!=="no_data")?.month??months.at(-1)?.month;
 const selected=months.find(item=>item.month===monthChoice)??months.find(item=>item.month===defaultMonth)??months.at(-1)!;
 const reliable=months.filter(item=>item.quality==="complete");
 const available=months.filter(item=>item.alphaPp!==null).length;
 const save=()=>{
  const csv=monthlyPerformanceCsv(result,year);if(!csv)return;
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
  try{link.href=url;link.download="qvanix-monthly-imoex-"+year+".csv";document.body.appendChild(link);link.click()}finally{link.remove();URL.revokeObjectURL(url)}
 };
 return <details className="qc-monthly-performance">
 <summary>Доходность по месяцам <small>{result.years.length} лет · портфель и IMOEX</small></summary>
 <div className="qc-monthly-toolbar">
 <label>Год <select value={year} onChange={e=>{setYearChoice(Number(e.currentTarget.value));setMonthChoice(null)}} aria-label="Год помесячной доходности">{result.years.map(y=><option value={y} key={y}>{y}</option>)}</select></label>
 <span>Рассчитано: {available}/12 · полных: {reliable.length}</span>
 <button type="button" onClick={save} aria-label={"Скачать помесячное сравнение "+year+" года в CSV"}>CSV ↓</button>
 </div>
 <div className="qc-monthly-grid" role="group" aria-label={"Доходность по месяцам "+year+" года"}>
 {months.map(item=><button type="button" key={item.month}
 className={"qc-monthly-cell qc-monthly-"+item.quality+" "+(item.alphaPp===null?"is-missing":item.alphaPp>=0?"is-beating":"is-lagging")}
 aria-pressed={selected.month===item.month}
 aria-label={monthNames[item.monthNumber-1]+": "+item.reason+"; опережение "+pp(item.alphaPp)}
 onClick={()=>setMonthChoice(item.month)}>
 <span>{monthNames[item.monthNumber-1]}</span><strong>{short(item)}</strong><small>{item.quality==="complete"?"Полный":item.quality==="sparse"?"Пробелы":item.quality==="partial"?"Часть":item.quality==="insufficient"?"Мало точек":item.quality==="no_benchmark"?"Без IMOEX":"Нет данных"}</small>
 </button>)}
 </div>
 <div className="qc-monthly-detail" role="status" aria-live="polite" aria-atomic="true">
 <strong>{monthNames[selected.monthNumber-1]} {year} · {selected.reason}</strong>
 <div><span>Портфель <b>{pct(selected.portfolioPct)}</b></span><span>IMOEX <b>{pct(selected.imoexPct)}</b></span><span>Разница <b>{pp(selected.alphaPp)}</b></span></div>
 <small>{selected.startDate??"—"} — {selected.endDate??"—"} · {selected.points} общих дат{selected.maxGapDays>10?" · максимальный пробел "+selected.maxGapDays+" дн.":""}</small>
 </div>
 <small className="qc-monthly-note">Показаны только реальные совпадающие даты. Полный месяц требует проверенную базу перед началом, наблюдения около границ месяца (допуск 7 дней) и отсутствие пропусков свыше 10 дней. Частичные и разреженные периоды не следует сравнивать с полными.</small>
 </details>;
}
