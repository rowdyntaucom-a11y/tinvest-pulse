import{useMemo}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{calculateAnnualPerformance,annualPerformanceCsv,type AnnualComparison}from"../analysis/annualPerformanceV248";

const percent=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2,signDisplay:"exceptZero"});
const pct=(value:number|null)=>value===null?"—":percent.format(value)+"%";
const diff=(value:number|null)=>value===null?"—":percent.format(value)+" п.п.";
function AnnualBar({item,scale}:{item:AnnualComparison;scale:number}){
 if(item.alphaPp===null)return null;
 const width=Math.min(50,Math.abs(item.alphaPp)/scale*50);
 return <div className="qc-annual-bar" aria-hidden="true"><span className="qc-annual-zero"/><span className={"qc-annual-fill "+(item.alphaPp>=0?"is-positive":"is-negative")} style={{left:(item.alphaPp<0?50-width:50)+"%",width:width+"%"}}/></div>;
}
export function AnnualPerformanceV248({history,trusted}:{history:HistoryPoint[];trusted:boolean}){
 const result=useMemo(()=>calculateAnnualPerformance(history,trusted),[history,trusted]);
 const scale=Math.max(5,...result.rows.map(row=>Math.abs(row.alphaPp??0)));
 if(!result.trusted||!result.rows.length)return null;
 const exportCsv=()=>{
  const csv=annualPerformanceCsv(result);if(!csv)return;
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");
  try{link.href=url;link.download="qvanix-annual-imoex.csv";document.body.appendChild(link);link.click()}finally{link.remove();URL.revokeObjectURL(url)}
 };
 return <details className="qc-annual-performance">
 <summary>По календарным годам <small>{result.rows.length} периодов · портфель и IMOEX</small></summary>
 <div className="qc-annual-heading"><span>История по годам</span><button type="button" aria-label="Скачать сравнение доходности по календарным годам в CSV" onClick={exportCsv}>CSV ↓</button></div>
 <div className="qc-annual-rows">
 {result.rows.map(item=><article key={item.year} className="qc-annual-row">
 <header><strong>{item.year}</strong><small>{item.reason}</small></header>
 <div className="qc-annual-results"><span>Портфель <b>{pct(item.portfolioPct)}</b></span><span>IMOEX <b>{pct(item.imoexPct)}</b></span><span>Разница <b>{diff(item.alphaPp)}</b></span></div>
 <AnnualBar item={item} scale={scale}/>
 <small className="qc-annual-dates">Даты: {item.startDate??"—"} — {item.endDate??"—"} · {item.points} общих точек{item.maxGapDays>45?" · разрыв "+item.maxGapDays+" дн.":""}</small>
 </article>)}
 </div>
 <small className="qc-annual-explanation">Полный календарный год: подтверждённая база у начала года и цена у конца года (допуск 14 дней), без перерывов свыше 45 дней. Иначе показан фактически наблюдаемый период, а не предполагаемая годовая доходность.</small>
 </details>;
}
