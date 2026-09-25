import{useEffect,useMemo,useState}from"react";
import{loadBondYieldDepth,type BondYieldPayload}from"./bondYieldApi";
import"../styles/bondYieldDepth.css";

const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const num=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});

function p(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?pct.format(value)+"%":"—"}
function money(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?rub.format(value)+" ₽":"—"}
function n(value:number|null|undefined,suffix=""){return typeof value==="number"&&Number.isFinite(value)?num.format(value)+suffix:"—"}
function sourceLabel(value:string|null){return value==="T_BANK_MARKET_VALUE"?"T-Bank market yield":value==="CASHFLOW_FALLBACK"?"денежный поток":"—"}

export function V3BondYieldDepth(){
 const[data,setData]=useState<BondYieldPayload|null>(null);
 const[loading,setLoading]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);
  void loadBondYieldDepth(controller.signal).then(setData).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[]);
 const summary=data?.summary??null;
 const items=useMemo(()=>[...(data?.items??[])].sort((a,b)=>(b.currentValue??0)-(a.currentValue??0)),[data]);
 const maxBucket=Math.max(1,...(data?.maturityBuckets??[]).map(row=>row.value));

 if(loading)return <section className="v3-bond-yield-depth"><div className="v3-bond-yield-gate">Получаем подтверждённую доходность и купонные потоки T-Bank…</div></section>;
 if(!data?.available||!summary)return <section className="v3-bond-yield-depth"><div className="v3-bond-yield-gate is-warning"><strong>Расширенная облигационная аналитика недоступна</strong><small>{data?.reason??"Источник не подтвердил значения."}</small></div></section>;

 return <section className="v3-bond-yield-depth" aria-label="Доходность и процентный риск облигаций">
  <header><div><span>BOND INTELLIGENCE // V1</span><h4>Доходность и процентный риск</h4></div><strong className={data.stale?"is-stale":""}>{data.stale?"STALE":"T-BANK"}</strong></header>

  <div className="v3-bond-yield-summary">
   <article><span>YTM · взвешенная</span><strong>{p(summary.weightedYtmPct)}</strong><small>покрытие {p(summary.yieldCoveragePct)}</small></article>
   <article><span>Modified duration</span><strong>{n(summary.weightedModifiedDuration," г.")}</strong><small>покрытие {p(summary.durationCoveragePct)}</small></article>
   <article><span>Срок до погашения</span><strong>{n(summary.weightedMaturityYears," г.")}</strong><small>покрытие {p(summary.maturityCoveragePct)}</small></article>
   <article><span>Облигационный капитал</span><strong>{money(summary.bondCapital)}</strong><small>{summary.issues} выпусков</small></article>
  </div>

  {!!data.rateScenarios.length&&<section className="v3-bond-rate-scenarios">
   <div className="v3-bond-yield-title"><div><span>СТАВКА</span><h5>Чувствительность по duration</h5></div><small>линейная оценка</small></div>
   <div>{data.rateScenarios.map(row=><article key={row.deltaPp}><span>{row.deltaPp>0?"+":""}{row.deltaPp} п.п.</span><strong className={row.pricePct!=null&&row.pricePct<0?"is-negative":row.pricePct!=null&&row.pricePct>0?"is-positive":""}>{row.pricePct==null?"—":(row.pricePct>0?"+":"")+pct.format(row.pricePct)+"%"}</strong><small>{row.rub==null?"—":(row.rub>0?"+":"")+rub.format(row.rub)+" ₽"}</small></article>)}</div>
  </section>}

  {!!data.maturityBuckets.length&&<section className="v3-bond-maturity-bars">
   <div className="v3-bond-yield-title"><div><span>ПОГАШЕНИЯ</span><h5>Лестница капитала</h5></div><small>dirty value</small></div>
   <div>{data.maturityBuckets.map(row=><article key={row.key}><div><strong>{row.label}</strong><span>{money(row.value)}</span></div><i><b style={{width:Math.min(100,row.value/maxBucket*100)+"%"}}/></i></article>)}</div>
  </section>}

  <section className="v3-bond-yield-issues">
   <div className="v3-bond-yield-title"><div><span>ВЫПУСКИ</span><h5>Проверенный слой</h5></div><small>{data.coverage?data.coverage.resolved+"/"+data.coverage.requested:""}</small></div>
   <div>{items.map(item=><article key={item.ticker}>
    <header><div><strong>{item.ticker}</strong><small>{item.name}</small></div><em>{item.modelConfidence}</em></header>
    <div className="v3-bond-yield-issue-grid">
     <div><span>YTM</span><b>{p(item.ytmPct)}</b><small>{sourceLabel(item.ytmSource)}</small></div>
     <div><span>Duration</span><b>{n(item.modifiedDuration," г.")}</b><small>{item.floating?"флоатер":item.amortizing?"амортизация":item.perpetual?"бессрочная":"фиксированный поток"}</small></div>
     <div><span>Погашение</span><b>{item.maturityDate?dateFmt.format(new Date(item.maturityDate)):"—"}</b><small>{n(item.yearsToMaturity," г.")}</small></div>
     <div><span>НКД / бумагу</span><b>{money(item.aciPerBondRub)}</b><small>{item.dirtyPriceRub==null?"dirty —":"dirty "+money(item.dirtyPriceRub)}</small></div>
    </div>
   </article>)}</div>
  </section>

  {data.warning&&<p className="v3-bond-yield-warning">{data.warning}</p>}
  <footer>YTM сначала берётся напрямую из T-Bank market value. Modified duration рассчитывается только для фиксированных, неамортизируемых и не бессрочных выпусков по подтверждённому будущему купонному потоку. Для флоатеров и сложных денежных потоков duration остаётся «—», а не оценивается приближённо.</footer>
 </section>;
}
