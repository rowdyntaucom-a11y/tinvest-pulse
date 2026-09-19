import type{PortfolioAnalytics}from"../../../v2/src/features/analytics/metrics";
import type{TailRiskResult}from"../../../v2/src/features/analytics/tailRisk";
import{V3MetricHelp}from"../help/V3MetricHelp";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{V3RiskContributionPanel}from"./V3RiskContributionPanel";

const p=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const n=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});

const lossPct=(value:number|null)=>value==null?"—":"-"+p.format(value*100)+"%";
const pct=(value:number|null)=>value==null?"—":p.format(value*100)+"%";

export function V3RiskLayer({portfolio,tail,positions,totalPortfolioValue}:{portfolio:PortfolioAnalytics;tail:TailRiskResult;positions:PositionSnapshot[];totalPortfolioValue:number}){
  const maxDd=portfolio.maxDrawdown;
  return <section className="v3-analysis-layer" aria-label="Риск портфеля">
    <div className="v3-analysis-layer-head"><div><span>Риск портфеля</span><h2>Просадка, разброс и концентрация</h2></div><b>{tail.status==="mature"?"Зрелая":tail.status==="preview"?"Preview":"Gate"}</b></div>
    <div className="v3-analysis-metric-grid">
      <article><span>Max Drawdown <V3MetricHelp topic="maxDrawdown"/></span><strong className={maxDd!=null&&maxDd>0?"is-negative":"is-neutral"}>{lossPct(maxDd)}</strong><small>TWR, не стоимость счёта</small></article>
      <article><span>Волатильность <V3MetricHelp topic="volatility"/></span><strong>{pct(portfolio.volatility)}</strong><small>годовая оценка</small></article>
      <article><span>Экв. позиций <V3MetricHelp topic="effectivePositions"/></span><strong>{portfolio.effectivePositions==null?"—":n.format(portfolio.effectivePositions)}</strong><small>1 / HHI капитала</small></article>
      <article><span>Классов активов</span><strong>{portfolio.assetClassCount||"—"}</strong><small>по подтверждённому составу</small></article>
    </div>
    <section className="v3-tail-card">
      <div className="v3-analysis-layer-head is-small"><div><span>Хвост распределения</span><h3>Исторический дневной tail risk <V3MetricHelp topic="tailRisk"/></h3></div><b>{tail.returns}/{tail.minimumReturns}</b></div>
      <div className="v3-analysis-metric-grid is-tail">
        <article><span>VaR 95%</span><strong className={tail.var95Loss!=null?"is-negative":"is-neutral"}>{lossPct(tail.var95Loss)}</strong><small>исторический порог</small></article>
        <article><span>CVaR 95%</span><strong className={tail.cvar95Loss!=null?"is-negative":"is-neutral"}>{lossPct(tail.cvar95Loss)}</strong><small>среднее худшего хвоста</small></article>
        <article><span>Худший день</span><strong className={tail.worstDay!=null&&tail.worstDay<0?"is-negative":"is-neutral"}>{tail.worstDay==null?"—":p.format(tail.worstDay*100)+"%"}</strong><small>фактический TWR день</small></article>
        <article><span>Доля минусовых дней</span><strong>{pct(tail.downsideFrequency)}</strong><small>{tail.returns} доходностей</small></article>
      </div>
      {!tail.available&&<div className={"v3-analysis-gate"+(tail.status==="invalid_history"?" is-danger":"")}>{tail.note}</div>}
      {tail.available&&<small className="v3-analysis-method-note">{tail.note} VaR/CVaR описывают прошлую выборку и не являются пределом будущего убытка.</small>}
    </section>
    <V3RiskContributionPanel positions={positions} totalPortfolioValue={totalPortfolioValue}/>
  </section>
}
