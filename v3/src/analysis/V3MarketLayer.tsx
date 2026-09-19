import type{RelativePerformance}from"../../../v2/src/features/analytics/relativePerformance";
import{V3HistoryWindowControl}from"../history/V3HistoryWindowControl";
import type{V3HistoryWindow}from"../history/historyLens";
import{V3MetricHelp}from"../help/V3MetricHelp";

const p=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const r=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2,signDisplay:"exceptZero"});\nconst plain=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});
const pct=(value:number|null)=>value==null?"—":p.format(value*100)+"%";
const ratio=(value:number|null)=>value==null?"—":r.format(value);
const cls=(value:number|null)=>value==null?"is-neutral":value>0?"is-positive":value<0?"is-negative":"is-neutral";

export function V3MarketLayer({relative,window,onWindowChange,market}:{relative:RelativePerformance;window:V3HistoryWindow;onWindowChange:(value:V3HistoryWindow)=>void;market:{riskFreeRate:number|null;riskFreeRateDate:string|null;nextRateMeeting:string|null}}){
  const advanced=relative.status==="preview"||relative.status==="mature";
  return <section className="v3-analysis-layer" aria-label="Сравнение с рынком">
    <V3HistoryWindowControl value={window} onChange={onWindowChange} label="Период сравнения с IMOEX"/>
    <div className="v3-analysis-layer-head"><div><span>Относительный результат</span><h2>Портфель против IMOEX <V3MetricHelp topic="imoex"/></h2></div><b>{relative.status==="mature"?"Зрелая":relative.status==="preview"?"Preview":relative.status==="invalid_history"?"Conflict":"Gate"}</b></div>
    {relative.available?<><div className="v3-analysis-metric-grid">
      <article><span>Портфель</span><strong className={cls(relative.portfolioReturn)}>{pct(relative.portfolioReturn)}</strong><small>TWR на общем периоде</small></article>
      <article><span>IMOEX</span><strong className={cls(relative.benchmarkReturn)}>{pct(relative.benchmarkReturn)}</strong><small>тот же диапазон</small></article>
      <article><span>Excess</span><strong className={cls(relative.excessReturn)}>{pct(relative.excessReturn)}</strong><small>портфель − IMOEX</small></article>
      <article><span>Парных доходностей</span><strong>{relative.pairedReturns}</strong><small>gate {relative.minimumReturns} · mature {relative.matureReturns}</small></article>
    </div>
    {advanced?<div className="v3-relative-advanced">
      <article><span>Tracking Error <V3MetricHelp topic="trackingError"/></span><strong>{pct(relative.trackingError)}</strong></article>
      <article><span>Information Ratio</span><strong className={cls(relative.informationRatio)}>{ratio(relative.informationRatio)}</strong></article>
      <article><span>Beta <V3MetricHelp topic="beta"/></span><strong>{ratio(relative.beta)}</strong></article>
      <article><span>Корреляция</span><strong>{ratio(relative.correlation)}</strong></article>
    </div>:<div className="v3-analysis-gate">{relative.note}</div>}
    <div className="v3-analysis-sample"><span>Общая выборка</span><strong>{relative.sampleFrom&&relative.sampleTo?dateFmt.format(new Date(relative.sampleFrom+"T00:00:00Z"))+" → "+dateFmt.format(new Date(relative.sampleTo+"T00:00:00Z")):"—"}</strong><small>{relative.overlapPoints} общих точек · дубликатов схлопнуто {relative.duplicateRowsCollapsed}</small></div></>:<div className={"v3-analysis-gate"+(relative.status==="invalid_history"?" is-danger":"")}>{relative.note}</div>}
    {(market.riskFreeRate!=null||market.nextRateMeeting)&&<section className="v3-market-context is-depth"><h3>Рыночный контекст</h3><div><span>Безрисковая ставка <V3MetricHelp topic="riskFreeRate"/></span><strong>{market.riskFreeRate==null?"—":plain.format(market.riskFreeRate)+"%"}</strong><small>{market.riskFreeRateDate??"дата недоступна"}</small></div><div><span>Следующее решение</span><strong>{market.nextRateMeeting??"—"}</strong><small>контекст, не сигнал</small></div></section>}
    <small className="v3-analysis-method-note">{relative.note} Относительные коэффициенты не показываются до минимальной общей выборки.</small>
  </section>
}
