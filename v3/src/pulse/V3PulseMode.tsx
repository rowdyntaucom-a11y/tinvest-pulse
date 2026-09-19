import{useEffect,useMemo}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3Shell}from"../app/model";
import type{V3HomeViewModel}from"../home/homeViewModel";
import{buildPulseHistoryGeometry,buildV3PulseSnapshot}from"./pulseSnapshot";
import"../styles/pulseMode.css";

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const plainPct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const stamp=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});

function m(value:number|null){return value==null?"—":money.format(value)+" ₽"}
function p(value:number|null){return value==null?"—":pct.format(value)+"%"}
function updated(value:string|null){if(!value)return"время не указано";const date=new Date(value);return Number.isNaN(date.getTime())?"время не указано":stamp.format(date)}
function cls(value:number|null){return value==null?"is-neutral":value>0?"is-positive":value<0?"is-negative":"is-neutral"}

export function V3PulseMode({home,positions,shell,onClose}:{home:V3HomeViewModel;positions:PositionSnapshot[];shell:V3Shell;onClose:()=>void}){
  const snapshot=useMemo(()=>buildV3PulseSnapshot(home,positions),[home,positions]);
  const geometry=useMemo(()=>buildPulseHistoryGeometry(snapshot.history),[snapshot.history]);

  useEffect(()=>{
    const previous=document.body.style.overflow;
    const priorFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    document.body.style.overflow="hidden";
    const close=document.querySelector<HTMLButtonElement>(".v3-pulse-close");
    close?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==="Escape")onClose();
      if(event.key==="Tab"&&close){event.preventDefault();close.focus()}
    };
    window.addEventListener("keydown",key);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",key);priorFocus?.focus()};
  },[onClose]);

  const resultClass=cls(snapshot.profit);
  const historyClass=geometry.start!=null&&geometry.end!=null?cls(geometry.end-geometry.start):"is-neutral";

  return <div className="v3-pulse-mode" data-shell={shell} role="dialog" aria-modal="true" aria-label="Пульс — режим снимка портфеля">
    <button className="v3-pulse-close" type="button" onClick={onClose} aria-label="Закрыть режим Пульс">×</button>
    <header className="v3-pulse-brand">
      <div><b>Q</b><span>QVANIX</span></div>
      <strong>{snapshot.accountName}</strong>
      <small>{snapshot.available?"ПОДТВЕРЖДЁННЫЙ СНИМОК":"ДАННЫЕ НЕ ПОДТВЕРЖДЕНЫ"}</small>
    </header>

    {snapshot.available?<>
      <section className="v3-pulse-capital">
        <span>КАПИТАЛ</span>
        <strong>{m(snapshot.value)}</strong>
        <small>Обновлено · {updated(snapshot.updatedAt)}</small>
      </section>

      <section className="v3-pulse-metrics">
        <article><span>РЕЗУЛЬТАТ</span><strong className={resultClass}>{snapshot.profit!=null&&snapshot.profit>0?"+":""}{m(snapshot.profit)}</strong><small className={resultClass}>{snapshot.profitPct==null?"—":p(snapshot.profitPct)}</small></article>
        <article><span>ПАССИВНЫЙ ДОХОД</span><strong>{m(snapshot.passiveIncome)}</strong><small>{snapshot.monthlyIncome==null?"—":m(snapshot.monthlyIncome)+" / мес."}</small></article>
        <article><span>XIRR</span><strong>{snapshot.xirr==null?"—":p(snapshot.xirr*100)}</strong><small>с учётом денежных потоков</small></article>
        <article><span>ПОЗИЦИЙ</span><strong>{snapshot.positions??"—"}</strong><small>{snapshot.allocation.length?plainPct.format(snapshot.allocationCoverage*100)+"% показано в структуре":"структура недоступна"}</small></article>
      </section>

      <section className="v3-pulse-visual">
        <div className="v3-pulse-visual-head"><span>{geometry.available?"СТОИМОСТЬ ПОРТФЕЛЯ":"СТРУКТУРА ПОРТФЕЛЯ"}</span><small>{geometry.available?"не доходность":"по текущим весам"}</small></div>
        {geometry.available?<svg viewBox="0 0 100 46" preserveAspectRatio="none" role="img" aria-label="История стоимости портфеля без интерполяции пропусков">
          <line x1="0" y1="23" x2="100" y2="23"/>
          {geometry.segments.map((points,index)=><polyline key={index} points={points}/>)}
        </svg>:<div className="v3-pulse-no-history">Подтверждённой истории недостаточно для линии стоимости.</div>}
        {geometry.available&&<div className="v3-pulse-history-caption"><span>{m(geometry.start)}</span><strong className={historyClass}>{geometry.start!=null&&geometry.end!=null?(geometry.end>=geometry.start?"+":"")+money.format(geometry.end-geometry.start)+" ₽":"—"}</strong><span>{m(geometry.end)}</span></div>}
      </section>

      <section className="v3-pulse-allocation" aria-label="Крупнейшие текущие позиции">
        <div className="v3-pulse-allocation-bar">{snapshot.allocation.map((row,index)=><i key={row.key} className={"s"+index} style={{width:row.weight*100+"%"}} title={row.ticker+" "+plainPct.format(row.weight*100)+"%"}/>)}</div>
        <div className="v3-pulse-allocation-labels">{snapshot.allocation.slice(0,4).map((row,index)=><span key={row.key}><i className={"s"+index}/><b>{row.ticker}</b><em>{plainPct.format(row.weight*100)}%</em></span>)}</div>
      </section>

      <footer className="v3-pulse-footer"><span>QVANIX · verified portfolio snapshot</span><small>Результат — накопленный контекст портфеля. Линия показывает стоимость и может включать внешние денежные потоки.</small></footer>
    </>:<section className="v3-pulse-unavailable"><strong>Снимок не создан</strong><p>Пульс открывается только на подтверждённых данных. QVANIX не подставляет последние, нулевые или предполагаемые значения вместо актуального портфеля.</p></section>}
  </div>;
}
