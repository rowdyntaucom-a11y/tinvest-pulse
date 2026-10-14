import{useMemo,useState}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{analyzeDrawdownEpisodes,drawdownsCsv}from"../analysis/drawdownEpisodesV250";
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
export function RiskDrawdownsV250({history,trusted}:{history:HistoryPoint[];trusted:boolean}){
 const data=useMemo(()=>analyzeDrawdownEpisodes(history,trusted),[history,trusted]);
 const[showAll,setShowAll]=useState(false);
 if(!data.trusted||!data.isIndex)return null;
 const sorted=[...data.episodes].sort((a,b)=>a.depthPct-b.depthPct||a.peakDate.localeCompare(b.peakDate));
 const showing=showAll?sorted:sorted.slice(0,5);
 const exportCsv=()=>{
  const csv=drawdownsCsv(data);if(!csv)return;
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  try{a.href=url;a.download="qvanix-drawdowns-"+(data.asOfDate??"history")+".csv";document.body.appendChild(a);a.click()}finally{a.remove();URL.revokeObjectURL(url)}
 };
 return <details className="qc-drawdown-episodes">
 <summary>Просадки и восстановление <small>{data.episodes.length} эпизодов · наблюдалось до {data.asOfDate}</small></summary>
 <div className="qc-drawdown-header">
 <div><span>Максимальная просадка</span><strong>{data.worst?pct.format(data.worst.depthPct)+"%":"—"}</strong></div>
 <div><span>Текущая просадка</span><strong>{data.active?pct.format(data.active.depthPct)+"%":"Нет"}</strong></div>
 <div><span>Подтверждённых дат</span><strong>{data.points}</strong></div>
 </div>
 <div className="qc-drawdown-tools"><span>Пик → дно → восстановление. Даты только из истории индекса портфеля</span><button type="button" disabled={!data.episodes.length} onClick={exportCsv} aria-label="Скачать подтверждённые эпизоды просадки в CSV">CSV ↓</button></div>
 {showing.length?<div className="qc-drawdown-list">
 {showing.map(ep=><article key={ep.peakDate+"-"+ep.troughDate} className="qc-drawdown-event">
 <header><strong>{pct.format(ep.depthPct)}%</strong><span>{ep.status==="open"?"Не восстановлено":"Восстановлено"}{ep.sparse?" · история с пропусками":""}</span></header>
 <div><span>Пик <b>{ep.peakDate}</b></span><span>Дно <b>{ep.troughDate}</b></span><span>Восстановление <b>{ep.recoveryDate??"—"}</b></span></div>
 <small>До дна: {ep.peakToTroughDays} дн. · ниже пика: {ep.underwaterDays} дн. · наблюдений: {ep.quoteCount}{ep.sparse?" · максимальный разрыв "+ep.maxGapDays+" дн.":""}</small>
 </article>)}
 </div>:<p className="qc-drawdown-none">{data.reason}</p>}
 {sorted.length>5&&<button type="button" className="qc-drawdown-more" aria-expanded={showAll} onClick={()=>setShowAll(x=>!x)}>{showAll?"Показать 5 крупнейших ↑":"Все просадки ("+sorted.length+") ↓"}</button>}
 <small className="qc-drawdown-footnote">Глубина измерена по подтверждённым точкам индекса доходности. Внутридневные минимумы и движение между отсутствующими котировками неизвестны. Для незавершённых просадок длительность рассчитана на дату последнего наблюдения, а не на сегодня.</small>
 </details>;
}
