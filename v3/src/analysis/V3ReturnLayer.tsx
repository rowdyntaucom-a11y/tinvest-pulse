import type{PortfolioAnalytics}from"../../../v2/src/features/analytics/metrics";
import type{RollingRiskResult}from"../../../v2/src/features/analytics/rollingRisk";
import{V3MetricHelp}from"../help/V3MetricHelp";

const p=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const r=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2,signDisplay:"exceptZero"});\nconst plain=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});

const pct=(value:number|null)=>value==null?"—":p.format(value*100)+"%";
const ratio=(value:number|null)=>value==null?"—":r.format(value);
const signedClass=(value:number|null)=>value==null?"is-neutral":value>0?"is-positive":value<0?"is-negative":"is-neutral";

export function V3ReturnLayer({portfolio,rolling,riskFreeRate,riskFreeRateDate}:{portfolio:PortfolioAnalytics;rolling:RollingRiskResult;riskFreeRate:number|null;riskFreeRateDate:string|null}){
  const active=rolling.activeWindow;
  return <section className="v3-analysis-layer" aria-label="Доходность и rolling-метрики">
    <div className="v3-analysis-layer-head"><div><span>Доходность стратегии</span><h2>TWR и риск-скорректированные метрики</h2></div><b>{portfolio.calcVersion}</b></div>
    {portfolio.historyIntegrity!=="OK"?<div className="v3-analysis-gate is-danger">История TWR содержит конфликтующие значения на одинаковые даты. Доходностные метрики скрыты до устранения конфликта.</div>:<>
      <div className="v3-analysis-metric-grid">
        <article><span>TWR <V3MetricHelp topic="twr"/></span><strong className={signedClass(portfolio.twr)}>{pct(portfolio.twr)}</strong><small>{portfolio.historyPoints} точек · {portfolio.historyDays} дн.</small></article>
        <article><span>Волатильность <V3MetricHelp topic="volatility"/></span><strong>{pct(portfolio.volatility)}</strong><small>годовая по дневным TWR</small></article>
        <article><span>Sharpe <V3MetricHelp topic="sharpe"/></span><strong className={signedClass(portfolio.sharpe)}>{ratio(portfolio.sharpe)}</strong><small>{riskFreeRate==null?"нужна безрисковая ставка":plain.format(riskFreeRate)+"% ставка"}</small></article>
        <article><span>Sortino <V3MetricHelp topic="sortino"/></span><strong className={signedClass(portfolio.sortino)}>{ratio(portfolio.sortino)}</strong><small>штрафует только downside</small></article>
      </div>
      <div className="v3-analysis-sample"><span>Выборка</span><strong>{portfolio.sampleFrom&&portfolio.sampleTo?dateFmt.format(new Date(portfolio.sampleFrom+"T00:00:00Z"))+" → "+dateFmt.format(new Date(portfolio.sampleTo+"T00:00:00Z")):"Недостаточно истории"}</strong><small>{riskFreeRateDate?"Ставка на "+riskFreeRateDate:"Дата безрисковой ставки недоступна"} · дубликатов схлопнуто {portfolio.duplicateRowsCollapsed}</small></div>
    </>}
    <section className="v3-rolling-card">
      <div className="v3-analysis-layer-head is-small"><div><span>Rolling</span><h3>Последнее полное стандартное окно <V3MetricHelp topic="rollingRisk"/></h3></div><b>{active?active.tradingDays+"D":"—"}</b></div>
      {active?<><div className="v3-analysis-metric-grid is-rolling">
        <article><span>Доходность</span><strong className={signedClass(active.portfolioReturn)}>{pct(active.portfolioReturn)}</strong></article>
        <article><span>Волатильность</span><strong>{pct(active.volatility)}</strong></article>
        <article><span>MaxDD</span><strong className={active.maxDrawdown!=null&&active.maxDrawdown>0?"is-negative":"is-neutral"}>{active.maxDrawdown==null?"—":"-"+p.format(active.maxDrawdown*100)+"%"}</strong></article>
        <article><span>Худший день</span><strong className={signedClass(active.worstDay)}>{pct(active.worstDay)}</strong></article>
      </div><div className="v3-rolling-windows" aria-label="Доступные rolling окна">{rolling.windows.map(window=><span key={window.tradingDays} className={window.available?"is-ready":""}>{window.tradingDays}D {window.available?"✓":"·"}</span>)}</div></>:<div className="v3-analysis-gate">{rolling.note}</div>}
      <small className="v3-analysis-method-note">{rolling.note} Rolling не растягивает короткую историю до года.</small>
    </section>
  </section>
}
