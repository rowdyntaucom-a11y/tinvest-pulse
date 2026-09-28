import{useEffect,useMemo,useState}from"react";
import{loadDividendDiscovery,type DividendDiscoveryPayload}from"./dividendDiscoveryApi";
import"../styles/dividendDiscovery.css";

const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const compact=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});

export function V3DividendDiscovery(){
 const[data,setData]=useState<DividendDiscoveryPayload|null>(null),[failed,setFailed]=useState(false),[query,setQuery]=useState("");
 useEffect(()=>{const controller=new AbortController();setFailed(false);void loadDividendDiscovery(controller.signal).then(setData).catch(error=>{if((error as Error).name!=="AbortError")setFailed(true)});return()=>controller.abort()},[]);
 const rows=useMemo(()=>{const needle=query.trim().toLocaleUpperCase("ru-RU");return(data?.rows??[]).filter(row=>!needle||row.ticker.toLocaleUpperCase("ru-RU").includes(needle)||row.name.toLocaleUpperCase("ru-RU").includes(needle)).slice(0,40)},[data,query]);
 const coverage=data?.coverage,coverageRatio=coverage?.shares?coverage.matchedFundamentals/coverage.shares*100:null;
 return <section id="sam-income-market" className="v3-dividend-discovery" aria-labelledby="v3-dividend-discovery-title">
  <header><div><span>05 · MARKET DISCOVERY · TTM</span><h3 id="v3-dividend-discovery-title">Дивидендный обзор рынка</h3><p>Отдельная read-only выборка акций рынка, не расчёт дохода текущего портфеля.</p></div><strong>{coverage?.dividendRows??"—"} бумаг</strong></header>
  <div className="v3-dividend-discovery__method">Только <code>dividend_yield_daily_ttm</code> из T‑Invest GetAssetFundamentals по точному asset UID. Forward yield не используется; это не прогноз и не рекомендация.</div>
  <label className="v3-dividend-discovery__search"><span>Поиск по рынку</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Тикер или компания"/></label>
  {!data&&!failed&&<div className="v3-dividend-discovery__state">Загружаем подтверждённые фундаментальные данные…</div>}
  {failed&&<div className="v3-dividend-discovery__state is-warning">Рыночные фундаментальные данные сейчас недоступны. Значения не подменяются.</div>}
  {data&&!data.available&&<div className="v3-dividend-discovery__state">Недостаточное покрытие: подтверждённых строк с положительной TTM-доходностью нет.</div>}
  {data?.available&&rows.length===0&&<div className="v3-dividend-discovery__state">По текущему запросу подтверждённых строк нет.</div>}
  {rows.length>0&&<div className="v3-dividend-discovery__table" role="table" aria-label="Акции с подтверждённой TTM дивидендной доходностью">
   <div className="v3-dividend-discovery__row is-head" role="row"><span role="columnheader">Компания</span><span role="columnheader">TTM yield</span><span role="columnheader">Капитализация</span></div>
   {rows.map(row=><div className="v3-dividend-discovery__row" role="row" key={row.assetUid}><span role="cell"><strong>{row.ticker}</strong><small>{row.name}</small></span><b role="cell">{pct.format(row.dividendYieldDailyTtm)}%</b><span role="cell">{row.marketCapitalization==null?"нет данных":compact.format(row.marketCapitalization)}</span></div>)}
  </div>}
  {data&&<footer>Покрытие fundamentals: {coverage?.matchedFundamentals??"—"} из {coverage?.shares??"—"}{coverageRatio==null?"":` (${pct.format(coverageRatio)}%)`} · строк: {coverage?.dividendRows??"—"} · TTM отсутствует: {coverage?.missingDividendYieldTtm??"—"} · ноль/отрицательная: {coverage?.nonPositiveDividendYieldTtm??"—"}. Сортировка описательная, не сигнал купить или продать.</footer>}
 </section>;
}
