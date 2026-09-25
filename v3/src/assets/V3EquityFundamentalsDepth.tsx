import{useEffect,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{formatAssetFundamentalMetric,type AssetFundamentalMetricKey}from"../../../v2/src/features/portfolio/assetFundamentals";
import{loadEquityFundamentals}from"./equityFundamentalsApi";
import{buildEquityFundamentalCoverage,fundamentalMetric,isEquityPosition,metricCapitalCoveragePct,type EquityFundamentalRow}from"./equityFundamentalsModel";
import"../styles/equityFundamentalsDepth.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});

const VIEWS=[
 {id:"valuation",label:"Мультипликаторы",keys:["peRatioTtm","priceToSalesTtm","priceToBookTtm","evToEbitdaTtm"]},
 {id:"returns",label:"Рентабельность",keys:["roeTtm","roaTtm","roicTtm","netDebtToEbitda"]},
 {id:"financials",label:"Финансы",keys:["revenueTtm","ebitdaTtm","netIncomeTtm","freeCashFlowTtm"]},
 {id:"shareholder",label:"Акционер",keys:["dividendYield","marketCap"]},
]as const;
type ViewId=typeof VIEWS[number]["id"];

function metricLabel(key:AssetFundamentalMetricKey){
 return({
  marketCap:"Капитализация",peRatioTtm:"P/E",priceToSalesTtm:"P/S",priceToBookTtm:"P/BV",evToEbitdaTtm:"EV/EBITDA",
  roeTtm:"ROE",roaTtm:"ROA",roicTtm:"ROIC",revenueTtm:"Выручка",ebitdaTtm:"EBITDA",netIncomeTtm:"Чистая прибыль",
  freeCashFlowTtm:"FCF",netDebtToEbitda:"Net Debt/EBITDA",dividendYield:"Dividend Yield",
 } satisfies Record<AssetFundamentalMetricKey,string>)[key];
}

function identityKey(position:PositionSnapshot){
 return position.instrumentUid?.trim()||position.figi?.trim()||position.ticker;
}

export function V3EquityFundamentalsDepth({positions,onOpenAsset}:{positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}){
 const[rows,setRows]=useState<EquityFundamentalRow[]>([]);
 const[state,setState]=useState<"idle"|"loading"|"live"|"empty">("idle");
 const[view,setView]=useState<ViewId>("valuation");
 const equities=useMemo(()=>positions.filter(isEquityPosition),[positions]);
 const requestKey=equities.map(row=>identityKey(row)+":"+row.currentValue).join("|");

 useEffect(()=>{
  const controller=new AbortController();
  let active=true;
  if(!equities.length){setRows([]);setState("empty");return()=>controller.abort()}
  setState("loading");
  void loadEquityFundamentals(equities,controller.signal).then(next=>{
   if(!active)return;
   setRows(next);
   setState(next.some(row=>row.snapshot.available)?"live":"empty");
  }).catch(error=>{
   if(!active||error instanceof DOMException&&error.name==="AbortError")return;
   setRows([]);
   setState("empty");
  });
  return()=>{active=false;controller.abort()};
 // requestKey is a stable exact-identity/value signature; avoid refetching on parent-only array recreation.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[requestKey]);

 const coverage=useMemo(()=>buildEquityFundamentalCoverage(rows),[rows]);
 const active=VIEWS.find(item=>item.id===view)??VIEWS[0];
 const primaryKey=active.keys[0] as AssetFundamentalMetricKey;
 const primaryCoverage=metricCapitalCoveragePct(rows,primaryKey);
 const sorted=useMemo(()=>[...rows].sort((a,b)=>b.position.currentValue-a.position.currentValue),[rows]);

 if(!equities.length)return <section id="sam-assets-fundamentals" className="v3-equity-fundamentals"><div className="v3-equity-fundamentals__gate">Акций в текущем подтверждённом составе нет.</div></section>;

 return <section id="sam-assets-fundamentals" className="v3-equity-fundamentals" aria-label="Фундаментальные показатели акций">
  <header className="v3-equity-fundamentals__head"><div><span>04 · АКЦИИ // EQUITY INTELLIGENCE V1</span><h3>Фундаментальные показатели акций</h3><p>Только официальные ненулевые метрики T‑Invest. Без скрытого скоринга, ярлыков «дёшево/дорого» и торговых выводов.</p></div><strong>{state==="loading"?"SYNC":state==="live"?"T‑INVEST":"NO DATA"}</strong></header>

  <div className="v3-equity-fundamentals__summary">
   <article><span>Капитал в акциях</span><strong>{rub.format(coverage.equityCapital||equities.reduce((sum,row)=>sum+row.currentValue,0))} ₽</strong><small>{coverage.companies||equities.length} компаний</small></article>
   <article><span>Проверено</span><strong>{coverage.verifiedCompanies}/{coverage.companies||equities.length}</strong><small>ответов с usable metrics</small></article>
   <article><span>Покрытие капиталом</span><strong>{coverage.capitalCoveragePct==null?"—":pct.format(coverage.capitalCoveragePct)+"%"}</strong><small>компании с verified fundamentals</small></article>
   <article><span>{metricLabel(primaryKey)} · покрытие</span><strong>{primaryCoverage==null?"—":pct.format(primaryCoverage)+"%"}</strong><small>по капиталу акций</small></article>
  </div>

  <nav className="v3-equity-fundamentals__tabs" aria-label="Группа фундаментальных показателей">
   {VIEWS.map(item=><button type="button" key={item.id} className={view===item.id?"is-active":""} aria-pressed={view===item.id} onClick={()=>setView(item.id)}>{item.label}</button>)}
  </nav>

  {state==="loading"?<div className="v3-equity-fundamentals__gate">Получаем подтверждённые показатели текущих акций…</div>:
  <div className="v3-equity-fundamentals__companies">{sorted.map(row=>{
   const available=row.snapshot.available&&row.snapshot.source==="T_INVEST";
   return <article key={identityKey(row.position)} className={available?"is-live":"is-gap"}>
    <header><div><strong>{row.position.ticker}</strong><small>{row.position.name}</small></div><div><b>{rub.format(row.position.currentValue)} ₽</b><small>{available?"verified":"нет покрытия"}</small></div></header>
    <div className="v3-equity-fundamentals__metric-grid">{active.keys.map(rawKey=>{
     const key=rawKey as AssetFundamentalMetricKey,metric=fundamentalMetric(row.snapshot,key);
     return <div key={key}><span>{metricLabel(key)}</span><strong>{metric?formatAssetFundamentalMetric(metric):"—"}</strong></div>;
    })}</div>
    {onOpenAsset&&<button type="button" className="v3-equity-fundamentals__open" onClick={()=>onOpenAsset(row.position)}>Открыть карточку {row.position.ticker} <i aria-hidden="true">›</i></button>}
   </article>;
  })}</div>}

  <footer>Источник: официальный T‑Invest InstrumentsService/GetAssetFundamentals через существующий серверный verified boundary. Значение 0 трактуется как отсутствие подтверждённой метрики согласно принятому контракту. Показатели разных компаний не сворачиваются в «оценку QVANIX» без отдельной прозрачной методологии.</footer>
 </section>;
}
