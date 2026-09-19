import{useEffect,useMemo,useState}from"react";
import{loadAssetHistory,type AssetHistoryPayload}from"../../../v2/src/lib/assetHistoryApi";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{calculateCurrentRiskContribution}from"../../../v2/src/features/analytics/currentRiskContribution";
import{calculateCorrelationMatrix}from"../../../v2/src/features/analytics/riskMatrix";
import{ratioToPercent,clampPercent}from"../data/units";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{buildV3RiskHistoryMatch,summarizeCorrelationPairs}from"./riskHistoryAdapter";

const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const signedPct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const ratio=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});
const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});

const p=(value:number|null)=>value==null?"—":pct.format(value*100)+"%";
const sp=(value:number|null)=>value==null?"—":signedPct.format(value*100)+"%";
const d=(value:string|null)=>value?dateFmt.format(new Date(value+"T00:00:00Z")):"—";

export function V3RiskContributionPanel({positions,totalPortfolioValue}:{positions:PositionSnapshot[];totalPortfolioValue:number}){
  const[payload,setPayload]=useState<AssetHistoryPayload|null>(null),[state,setState]=useState<"loading"|"live"|"unavailable">("loading");

  useEffect(()=>{
    const controller=new AbortController();
    setState("loading");
    setPayload(null);
    void loadAssetHistory(controller.signal).then(next=>{
      if(controller.signal.aborted)return;
      setPayload(next);
      setState(next.available?"live":"unavailable");
    }).catch(()=>{
      if(!controller.signal.aborted)setState("unavailable");
    });
    return()=>controller.abort();
  },[positions.map(position=>position.instrumentUid||position.figi||position.ticker).join("|")]);

  const match=useMemo(()=>buildV3RiskHistoryMatch(payload,positions),[payload,positions]);
  const total=totalPortfolioValue>0?totalPortfolioValue:positions.reduce((sum,position)=>sum+(position.currentValue>0?position.currentValue:0),0);
  const risk=useMemo(()=>calculateCurrentRiskContribution(match.inputs,total),[match.inputs,total]);
  const matrix=useMemo(()=>calculateCorrelationMatrix(match.series),[match.series]);
  const corr=useMemo(()=>summarizeCorrelationPairs(match.series,matrix.cells),[match.series,matrix.cells]);
  const pairTotal=Math.max(0,match.series.length*(match.series.length-1)/2);
  const rows=useMemo(()=>[...risk.rows].sort((a,b)=>Math.abs(b.riskContributionShare??0)-Math.abs(a.riskContributionShare??0)),[risk.rows]);
  const completeCoverage=risk.coverageRatio!=null&&risk.coverageRatio>=.999;
  const coverageLabel=risk.coverageRatio==null?"—":p(risk.coverageRatio);
  const source=payload?.source?.trim()||"asset-history";
  const ambiguous=match.ambiguousTickers.length?match.ambiguousTickers.join(", "):null;
  const unmatched=match.unmatchedTickers.length?match.unmatchedTickers.join(", "):null;

  if(state==="loading")return <section className="v3-risk-contribution"><div className="v3-analysis-gate">Загружаем подтверждённую историю активов и выравниваем одинаковые интервалы наблюдения…</div></section>;
  if(state==="unavailable")return <section className="v3-risk-contribution"><div className="v3-analysis-gate">История отдельных активов недоступна. Вклад в риск и корреляции не рассчитываются без проверенных ценовых рядов.</div></section>;

  return <section className="v3-risk-contribution" aria-label="Вклад активов в риск и корреляции">
    <div className="v3-analysis-layer-head"><div><span>Риск по активам</span><h3>Вклад в риск и диверсификация <V3MetricHelp topic="riskContribution"/></h3></div><b>{risk.status==="MATURE"?"Зрелая":risk.status==="PREVIEW"?"Preview":"Gate"}</b></div>

    <div className="v3-analysis-metric-grid is-risk-contribution">
      <article><span>Покрытие капитала</span><strong>{coverageLabel}</strong><small>{match.matchedTickers.length}/{positions.length} позиций с точной историей</small></article>
      <article><span>Общих доходностей</span><strong>{risk.commonReturns}</strong><small>gate {risk.minimumReturns} · mature {risk.matureReturns}</small></article>
      <article><span>{completeCoverage?"Волатильность портфеля":"Волатильность покрытия"}</span><strong>{p(risk.annualizedVolatility)}</strong><small>covariance · √252</small></article>
      <article><span>Diversification Ratio <V3MetricHelp topic="diversificationRatio"/></span><strong>{risk.diversificationRatio==null?"—":ratio.format(risk.diversificationRatio)}</strong><small>standalone σ / portfolio σ</small></article>
      <article><span>Risk Nₑ</span><strong>{risk.effectiveRiskContributorCount==null?"—":ratio.format(risk.effectiveRiskContributorCount)}</strong><small>эффективных вкладчиков риска</small></article>
      <article><span>Capital Nₑ</span><strong>{risk.effectiveCapitalCount==null?"—":ratio.format(risk.effectiveCapitalCount)}</strong><small>эффективных весов капитала</small></article>
    </div>

    {!risk.available?<div className={"v3-analysis-gate"+(risk.integrity==="CONFLICT"?" is-danger":"")}>{risk.integrity==="CONFLICT"?"История содержит конфликтующие цены на одинаковые даты. ":""}{risk.reason??risk.note}</div>:<>
      {!completeCoverage&&<div className="v3-analysis-gate">Риск рассчитан только для покрытой market-history части портфеля ({coverageLabel}). Непокрытые позиции не считаются нулевым риском.</div>}
      <div className="v3-risk-contributors">
        <div className="v3-risk-contributors-head"><span>Актив</span><span>Капитал</span><span>Standalone σ</span><span>Вклад</span></div>
        {rows.map(row=>{
          const share=row.riskContributionShare;
          const offsetting=share!=null&&share<0;
          return <article key={row.key}>
            <div><strong>{row.label}</strong><small>{money.format(row.currentValue)} ₽</small></div>
            <span>{p(row.weight)}</span>
            <span>{p(row.annualizedVolatility)}</span>
            <div className={offsetting?"is-offsetting":""}><strong>{sp(share)}</strong><i aria-hidden="true"><b style={{width:clampPercent(Math.abs(ratioToPercent(share)??0))+"%"}}/></i><small>{offsetting?"снижает общую дисперсию":"signed contribution"}</small></div>
          </article>;
        })}
      </div>
      <small className="v3-analysis-method-note">Signed risk contribution может быть отрицательным из-за диверсификации. Это не прибыль/убыток и не оценка качества актива. Веса — текущая рыночная стоимость только внутри покрытой выборки.</small>
    </>}

    <section className="v3-correlation-depth">
      <div className="v3-analysis-layer-head is-small"><div><span>Связь активов</span><h3>Парные корреляции <V3MetricHelp topic="correlation"/></h3></div><b>{corr.readyPairs}/{pairTotal}</b></div>
      {corr.readyPairs>0?<><div className="v3-correlation-summary">
        <article><span>Макс. ρ</span><strong>{corr.highest?ratio.format(corr.highest.correlation):"—"}</strong><small>{corr.highest?corr.highest.a+" ↔ "+corr.highest.b:"—"}</small></article>
        <article><span>Мин. ρ</span><strong>{corr.lowest?ratio.format(corr.lowest.correlation):"—"}</strong><small>{corr.lowest?corr.lowest.a+" ↔ "+corr.lowest.b:"—"}</small></article>
      </div>
      <div className="v3-correlation-pairs">{corr.strongestAbsolute.map(pair=><article key={pair.a+"|"+pair.b}><span>{pair.a} ↔ {pair.b}</span><strong>{ratio.format(pair.correlation)}</strong><small>{pair.pairedReturns} общих интервалов · {pair.mature?"зрелая":"preview"}</small></article>)}</div></>:<div className="v3-analysis-gate">Для парных корреляций нужно минимум {matrix.minimumPairedReturns} доходностей на одинаковых интервалах наблюдения. Искусственные коэффициенты не подставляются.</div>}
      <small className="v3-analysis-method-note">Pearson ρ считается по доходностям с одинаковыми границами интервала, не по уровням цен. Корреляция описывает прошлую совместную динамику и не является прогнозом.</small>
    </section>

    <div className="v3-risk-provenance">
      <span>Источник</span><strong>{source}</strong><small>{d(payload?.from??null)} → {d(payload?.to??null)} · доступно серий {payload?.availableSeries??match.series.length}/{payload?.requested??match.series.length}</small>
      {(unmatched||ambiguous)&&<small>{unmatched?"Без точного ряда: "+unmatched+". ":""}{ambiguous?"Неоднозначная идентичность: "+ambiguous+".":""}</small>}
    </div>
  </section>;
}
