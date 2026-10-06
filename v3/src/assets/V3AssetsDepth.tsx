import{lazy,Suspense,useEffect,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{aggregateHoldings}from"../../../v2/src/features/analytics/holdingsExplorer";
import{buildBondMaturityDiagnostics}from"../../../v2/src/features/portfolio/bondMaturityDiagnostics";
import{buildBondRiskDimensions}from"../../../v2/src/features/portfolio/bondRiskDimensions";
import{calculatePortfolioPnlAttribution}from"../../../v2/src/features/portfolio/portfolioAttribution";
import{calculatePortfolioTopExposure}from"../../../v2/src/features/portfolio/portfolioExposureDiagnostics";
import{clampPercent}from"../data/units";
import{localizeFinancialLabel}from"../i18n/financialTerms";
import{InstrumentAvatar}from"./InstrumentAvatar";
import"../styles/assetsDepth.css";
import"../styles/assetsDepthV101.css";

const V3HoldingsExplorer=lazy(()=>import("./V3HoldingsExplorer").then(m=>({default:m.V3HoldingsExplorer})));
const V3BondYieldDepth=lazy(()=>import("./V3BondYieldDepth").then(m=>({default:m.V3BondYieldDepth})));
const V3EquityFundamentalsDepth=lazy(()=>import("./V3EquityFundamentalsDepth").then(m=>({default:m.V3EquityFundamentalsDepth})));

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const num=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});
type DepthMode="overview"|"equity"|"bonds"|"positions";
const DEPTH_MODES:readonly DepthMode[]=["overview","equity","bonds","positions"];
const DEPTH_STORAGE_KEY="qvanix-assets-depth-v101";

function share(value:number,total:number){return total>0?value/total:0}
function signedMoney(value:number){return(value>0?"+":"")+rub.format(value)+" ₽"}
function isDepthMode(value:unknown):value is DepthMode{return typeof value==="string"&&DEPTH_MODES.includes(value as DepthMode)}
function DepthLoading({label}:{label:string}){return <div className="v3-assets-depth__loading" aria-live="polite"><span><i aria-hidden="true"/><b>{label}</b><small>Подключаем только выбранный профессиональный модуль.</small></span></div>}

export function V3AssetsDepth({positions,onOpenAsset}:{positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}){
 const[mode,setMode]=useState<DepthMode>("overview");
 const[visited,setVisited]=useState<Set<DepthMode>>(()=>new Set<DepthMode>(["overview"]));
 useEffect(()=>{try{const stored=sessionStorage.getItem(DEPTH_STORAGE_KEY);if(isDepthMode(stored)){setMode(stored);setVisited(current=>new Set([...current,stored]))}}catch{}},[]);
 useEffect(()=>{setVisited(current=>current.has(mode)?current:new Set([...current,mode]));try{sessionStorage.setItem(DEPTH_STORAGE_KEY,mode)}catch{}},[mode]);
 const model=useMemo(()=>{
  const total=positions.reduce((sum,row)=>sum+Math.max(0,row.currentValue),0);
  const basis=positions.reduce((sum,row)=>sum+Math.max(0,row.costBasis),0);
  const sectors=aggregateHoldings(positions,"sector");
  const pnl=calculatePortfolioPnlAttribution(positions);
  const exposure=calculatePortfolioTopExposure(positions,3);
  const concentration=positions.map(row=>share(Math.max(0,row.currentValue),total)).filter(value=>value>0);
  const hhi=concentration.reduce((sum,value)=>sum+value*value,0);
  return{total,basis,sectors,pnl,exposure,pnlPct:basis>0?pnl.netPnl/basis*100:null,effectiveCount:hhi>0?1/hhi:null,bonds:buildBondMaturityDiagnostics(positions),bondRisk:buildBondRiskDimensions(positions)};
 },[positions]);

 const sectorCovered=model.sectors.rows.reduce((sum,row)=>sum+row.value,0);
 const sectorCoverage=model.total>0?sectorCovered/model.total:null;
 const top1=model.exposure.topPositions[0]?.weight??null;
 const top3=model.exposure.topWeight;
 const pnlLeaders=model.pnl.positions.slice(0,6);
 const positionByTicker=useMemo(()=>new Map(positions.map(position=>[position.ticker.toUpperCase(),position])),[positions]);
 const nav:readonly[DepthMode,string,string][]=[
  ["overview","Обзор","концентрация · P/L"],
  ["equity","Акции","фундаментальные данные"],
  ["bonds","Облигации","YTM · сроки"],
  ["positions","Позиции","поиск · срезы"],
 ];
 const openMode=(next:DepthMode)=>{setMode(next);window.requestAnimationFrame(()=>document.querySelector(".v3-assets-depth__nav")?.scrollIntoView({block:"nearest",behavior:"auto"}))};

 return <section id="v3-assets-depth" className="v3-assets-depth" aria-label="Профессиональная аналитика портфеля" data-depth-mode={mode}>
  <header className="v3-assets-depth__head">
   <div><span>ПРОФЕССИОНАЛЬНАЯ АНАЛИТИКА</span><h2>Глубина портфеля</h2><p>Расширенные показатели открываются по разделам. Выбранный раздел сохраняется в текущей сессии, а тяжёлые модули загружаются только после первого открытия.</p></div>
   <div><strong>{rub.format(model.total)} ₽</strong><small>{positions.length} позиций</small></div>
  </header>

  <section className="v3-assets-depth__answer" aria-label="Главный вывод по портфелю">
   <span>ГЛАВНЫЙ ВЫВОД</span>
   <strong>{top3==null?"Структура пока не подтверждена":top3>=.65?"Портфель заметно зависит от трёх крупнейших позиций":"Концентрация распределена между несколькими позициями"}</strong>
   <p>{top3==null?"Нужен подтверждённый состав портфеля.":`Топ-3 занимают ${pct.format(top3*100)}% капитала · P/L открытых позиций ${signedMoney(model.pnl.netPnl)}.`}</p>
   <small>Это описание текущей структуры, а не оценка качества портфеля и не рекомендация.</small>
  </section>

  <nav className="v3-assets-depth__nav" aria-label="Разделы профессиональной аналитики">
   {nav.map(([id,label,note])=><button type="button" key={id} className={mode===id?"is-active":""} aria-pressed={mode===id} onClick={()=>openMode(id)}><strong>{label}</strong><small>{note}</small></button>)}
  </nav>

  <div className="v3-assets-depth__stage" hidden={mode!=="overview"} aria-hidden={mode!=="overview"}>
   <section className="v3-assets-depth__metrics" aria-label="Сводка концентрации">
    <article><span>Крупнейшая позиция</span><strong>{top1==null?"—":pct.format(top1*100)+"%"}</strong><small>доля капитала в одной бумаге</small></article>
    <article><span>Три крупнейшие</span><strong>{top3==null?"—":pct.format(top3*100)+"%"}</strong><small>доля капитала в топ-3</small></article>
    <article><span>Эффективное число</span><strong>{model.effectiveCount==null?"—":num.format(model.effectiveCount)}</strong><small>насколько портфель распределён по весам</small></article>
    <article><span>P/L открытых позиций</span><strong className={model.pnl.netPnl<0?"is-negative":model.pnl.netPnl>0?"is-positive":""}>{signedMoney(model.pnl.netPnl)}</strong><small>{model.pnlPct==null?"к базе —":(model.pnlPct>0?"+":"")+pct.format(model.pnlPct)+"% к себестоимости"}</small></article>
   </section>

   <details className="v3-assets-depth__explain">
    <summary><i>i</i><span>Что означают эти показатели?</span></summary>
    <p><b>Эффективное число</b> показывает, насколько капитал распределён между позициями: чем число выше, тем меньше портфель зависит от нескольких крупнейших бумаг. <b>P/L открытых позиций</b> — накопленный результат текущих позиций по данным брокера, а не TWR и не дневная доходность.</p>
   </details>

   <section id="sam-assets-pnl" className="v3-assets-depth__block v3-assets-depth__pnl">
    <div className="v3-assets-depth__title"><div><span>РЕЗУЛЬТАТ</span><h3>Кто формирует текущий P/L</h3></div><small>не TWR-атрибуция</small></div>
    <div className="v3-assets-depth__pnl-summary"><span>Плюс {signedMoney(model.pnl.positivePnl)}</span><span>Минус {signedMoney(model.pnl.negativePnl)}</span><span>Абсолютный P/L {rub.format(model.pnl.grossAbsolutePnl)} ₽</span></div>
    <div className="v3-assets-depth__pnl-list">
     {pnlLeaders.map(row=>{const position=positionByTicker.get(row.ticker.toUpperCase());return <article key={row.key}><div className="v3-assets-depth__pnl-identity">{position&&<InstrumentAvatar position={position} size="sm"/>}<span><strong>{row.ticker}</strong><small>{row.name}</small></span></div><div><b className={row.direction==="negative"?"is-negative":row.direction==="positive"?"is-positive":""}>{signedMoney(row.pnl)}</b><small>{row.grossPnlShare==null?"—":pct.format(row.grossPnlShare*100)+"% абс. P/L"}</small></div><i aria-hidden="true"><b style={{width:clampPercent((row.grossPnlShare??0)*100)+"%"}}/></i></article>})}
    </div>
    <p>Доля считается от суммы абсолютных P/L открытых позиций. Это накопленный результат позиции, а не дневное изменение и не доходность стратегии.</p>
   </section>

   <section id="sam-assets-sectors" className="v3-assets-depth__block v3-assets-depth__sectors">
    <div className="v3-assets-depth__title"><div><span>ОТРАСЛИ</span><h3>Покрытие метаданных</h3></div><small>{sectorCoverage==null?"—":pct.format(sectorCoverage*100)+"% капитала"}</small></div>
    {model.sectors.rows.length?<div className="v3-assets-depth__bars">{model.sectors.rows.slice(0,6).map(row=>{const ratio=share(row.value,sectorCovered);return <article key={row.label}><div><strong>{localizeFinancialLabel(row.label)}</strong><span>{rub.format(row.value)} ₽ · {pct.format(ratio*100)}% покрытого</span></div><i aria-hidden="true"><b style={{width:clampPercent(ratio*100)+"%"}}/></i></article>})}</div>:<div className="v3-assets-depth__empty">Подтверждённых отраслевых метаданных пока нет.</div>}
    {model.sectors.unclassified>0&&<p>Без подтверждённой отрасли: {rub.format(model.sectors.unclassified)} ₽. QVANIX не угадывает сектор по названию бумаги.</p>}
   </section>
  </div>

  {visited.has("equity")&&<div className="v3-assets-depth__stage" hidden={mode!=="equity"} aria-hidden={mode!=="equity"}><section className="v3-assets-depth__professional-section"><header><div><span>АКЦИИ</span><h3>Фундаментальные показатели</h3></div><p>Мультипликаторы и денежные потоки показаны только там, где источник подтверждён. Это справочный слой, а не рейтинг бумаг.</p></header><Suspense fallback={<DepthLoading label="Загружаем фундаментальные показатели…"/>}><V3EquityFundamentalsDepth positions={positions} onOpenAsset={onOpenAsset}/></Suspense></section></div>}

  {visited.has("bonds")&&<div className="v3-assets-depth__stage" hidden={mode!=="bonds"} aria-hidden={mode!=="bonds"}><section className="v3-assets-depth__professional-section"><header><div><span>ОБЛИГАЦИИ</span><h3>Доходность и сроки</h3></div><p>YTM — оценка доходности к погашению при заданных условиях. Modified duration показывает чувствительность цены к изменению ставок, а не срок до погашения. Расширенный слой YTM и modified duration использует только отдельный проверяемый источник.</p></header>
   {model.bonds.bondCount?<section id="sam-assets-bonds" className="v3-assets-depth__block v3-assets-depth__bonds"><div className="v3-assets-depth__bond-grid">
    <article><span>ОФЗ</span><strong>{pct.format(model.bonds.ofzShare*100)}%</strong><small>облигационной части</small></article>
    <article><span>До погашения</span><strong>{model.bonds.weightedYearsToMaturity==null?"—":num.format(model.bonds.weightedYearsToMaturity)+" г."}</strong><small>взвешенный срок</small></article>
    <article><span>Известны даты</span><strong>{pct.format(model.bonds.maturityDateCoverage*100)}%</strong><small>покрытие капиталом</small></article>
    <article><span>Флоатеры</span><strong>{model.bonds.floatingCount}</strong><small>из {model.bonds.bondCount}</small></article>
   </div>
   <div className="v3-assets-depth__bond-line"><span>Ближайшее погашение</span><strong>{model.bonds.nearest?model.bonds.nearest.ticker+" · "+dateFmt.format(new Date(model.bonds.nearest.maturityDate)):"—"}</strong></div>
   <div className="v3-assets-depth__bond-line"><span>Эмитент · покрытие</span><strong>{pct.format(model.bondRisk.issuer.coverageRatio*100)}%</strong></div>
   <div className="v3-assets-depth__bond-line"><span>Сектор · покрытие</span><strong>{pct.format(model.bondRisk.sector.coverageRatio*100)}%</strong></div>
   <Suspense fallback={<DepthLoading label="Загружаем облигационную аналитику…"/>}><V3BondYieldDepth/></Suspense>
   </section>:<div className="v3-assets-depth__empty">Облигаций в текущем подтверждённом составе нет.</div>}
  </section></div>}

  {visited.has("positions")&&<div className="v3-assets-depth__stage" hidden={mode!=="positions"} aria-hidden={mode!=="positions"}><section className="v3-assets-depth__professional-section"><header><div><span>ПОЗИЦИИ</span><h3>Инструменты и срезы</h3></div><p>Поиск, эмитенты, отрасли и валюты без повторного блока классов активов.</p></header><Suspense fallback={<DepthLoading label="Загружаем исследователь позиций…"/>}><V3HoldingsExplorer positions={positions} onOpenAsset={onOpenAsset} initialDimension="instrument" showClassSummary={false}/></Suspense></section></div>}
 </section>;
}
