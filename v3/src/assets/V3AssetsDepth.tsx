import{useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{aggregateHoldings}from"../../../v2/src/features/analytics/holdingsExplorer";
import{buildBondMaturityDiagnostics}from"../../../v2/src/features/portfolio/bondMaturityDiagnostics";
import{buildBondRiskDimensions}from"../../../v2/src/features/portfolio/bondRiskDimensions";
import{calculatePortfolioPnlAttribution}from"../../../v2/src/features/portfolio/portfolioAttribution";
import{calculatePortfolioTopExposure}from"../../../v2/src/features/portfolio/portfolioExposureDiagnostics";
import{clampPercent}from"../data/units";
import{V3HoldingsExplorer}from"./V3HoldingsExplorer";
import{V3BondYieldDepth}from"./V3BondYieldDepth";
import{V3EquityFundamentalsDepth}from"./V3EquityFundamentalsDepth";
import"../styles/assetsDepth.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const num=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});
type DepthMode="overview"|"equity"|"bonds"|"positions";

function share(value:number,total:number){return total>0?value/total:0}
function signedMoney(value:number){return(value>0?"+":"")+rub.format(value)+" ₽"}

export function V3AssetsDepth({positions,onOpenAsset}:{positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}){
 const[mode,setMode]=useState<DepthMode>("overview");
 const model=useMemo(()=>{
  const total=positions.reduce((sum,row)=>sum+Math.max(0,row.currentValue),0);
  const basis=positions.reduce((sum,row)=>sum+Math.max(0,row.costBasis),0);
  const sectors=aggregateHoldings(positions,"sector");
  const pnl=calculatePortfolioPnlAttribution(positions);
  const exposure=calculatePortfolioTopExposure(positions,3);
  const concentration=positions.map(row=>share(Math.max(0,row.currentValue),total)).filter(value=>value>0);
  const hhi=concentration.reduce((sum,value)=>sum+value*value,0);
  return{
   total,basis,sectors,pnl,exposure,
   pnlPct:basis>0?pnl.netPnl/basis*100:null,
   effectiveCount:hhi>0?1/hhi:null,
   bonds:buildBondMaturityDiagnostics(positions),
   bondRisk:buildBondRiskDimensions(positions),
  };
 },[positions]);

 const sectorCovered=model.sectors.rows.reduce((sum,row)=>sum+row.value,0);
 const sectorCoverage=model.total>0?sectorCovered/model.total:null;
 const top1=model.exposure.topPositions[0]?.weight??null;
 const top3=model.exposure.topWeight;
 const pnlLeaders=model.pnl.positions.slice(0,6);
 const nav:readonly[DepthMode,string,string][]=[
  ["overview","Обзор","концентрация · P/L"],
  ["equity","Акции","fundamentals"],
  ["bonds","Облигации","YTM · сроки"],
  ["positions","Позиции","поиск · срезы"],
 ];

 return <section id="v3-assets-depth" className="v3-assets-depth" aria-label="Профессиональная аналитика портфеля">
  <header className="v3-assets-depth__head">
   <div><span>ПРОФЕССИОНАЛЬНАЯ АНАЛИТИКА</span><h2>Глубина портфеля</h2><p>Расширенные показатели открываются по разделам. Базовые активы и структура остаются на предыдущих вкладках.</p></div>
   <div><strong>{rub.format(model.total)} ₽</strong><small>{positions.length} позиций</small></div>
  </header>

  <nav className="v3-assets-depth__nav" aria-label="Разделы профессиональной аналитики">
   {nav.map(([id,label,note])=><button type="button" key={id} className={mode===id?"is-active":""} onClick={()=>setMode(id)}><strong>{label}</strong><small>{note}</small></button>)}
  </nav>

  {mode==="overview"&&<>
   <section className="v3-assets-depth__metrics" aria-label="Сводка концентрации">
    <article><span>Крупнейшая позиция</span><strong>{top1==null?"—":pct.format(top1*100)+"%"}</strong><small>доля капитала в одной бумаге</small></article>
    <article><span>Три крупнейшие</span><strong>{top3==null?"—":pct.format(top3*100)+"%"}</strong><small>доля капитала в топ-3</small></article>
    <article><span>Эффективное число</span><strong>{model.effectiveCount==null?"—":num.format(model.effectiveCount)}</strong><small>насколько портфель распределён по весам</small></article>
    <article><span>Broker P/L</span><strong className={model.pnl.netPnl<0?"is-negative":model.pnl.netPnl>0?"is-positive":""}>{signedMoney(model.pnl.netPnl)}</strong><small>{model.pnlPct==null?"к базе —":(model.pnlPct>0?"+":"")+pct.format(model.pnlPct)+"% к себестоимости"}</small></article>
   </section>

   <details className="v3-assets-depth__explain">
    <summary><i>i</i><span>Что означают эти показатели?</span></summary>
    <p><b>Эффективное число</b> показывает, насколько капитал распределён между позициями: чем число выше, тем меньше портфель зависит от нескольких крупнейших бумаг. <b>Broker P/L</b> — накопленный результат открытых позиций у брокера, а не TWR и не дневная доходность.</p>
   </details>

   <section id="sam-assets-pnl" className="v3-assets-depth__block v3-assets-depth__pnl">
    <div className="v3-assets-depth__title"><div><span>РЕЗУЛЬТАТ</span><h3>Кто формирует текущий P/L</h3></div><small>не TWR-атрибуция</small></div>
    <div className="v3-assets-depth__pnl-summary"><span>Плюс {signedMoney(model.pnl.positivePnl)}</span><span>Минус {signedMoney(model.pnl.negativePnl)}</span><span>Абсолютный P/L {rub.format(model.pnl.grossAbsolutePnl)} ₽</span></div>
    <div className="v3-assets-depth__pnl-list">
     {pnlLeaders.map(row=><article key={row.key}><div><strong>{row.ticker}</strong><span>{row.name}</span></div><div><b className={row.direction==="negative"?"is-negative":row.direction==="positive"?"is-positive":""}>{signedMoney(row.pnl)}</b><small>{row.grossPnlShare==null?"—":pct.format(row.grossPnlShare*100)+"% абс. P/L"}</small></div><i aria-hidden="true"><b style={{width:clampPercent((row.grossPnlShare??0)*100)+"%"}}/></i></article>)}
    </div>
    <p>Доля считается от суммы абсолютных broker P/L. Это накопленный результат позиции, а не дневное изменение и не доходность стратегии.</p>
   </section>

   <section id="sam-assets-sectors" className="v3-assets-depth__block v3-assets-depth__sectors">
    <div className="v3-assets-depth__title"><div><span>ОТРАСЛИ</span><h3>Покрытие метаданных</h3></div><small>{sectorCoverage==null?"—":pct.format(sectorCoverage*100)+"% капитала"}</small></div>
    {model.sectors.rows.length?<div className="v3-assets-depth__bars">{model.sectors.rows.slice(0,6).map(row=>{const ratio=share(row.value,sectorCovered);return <article key={row.label}><div><strong>{row.label}</strong><span>{rub.format(row.value)} ₽ · {pct.format(ratio*100)}% покрытого</span></div><i aria-hidden="true"><b style={{width:clampPercent(ratio*100)+"%"}}/></i></article>})}</div>:<div className="v3-assets-depth__empty">Подтверждённых отраслевых метаданных пока нет.</div>}
    {model.sectors.unclassified>0&&<p>Без подтверждённой отрасли: {rub.format(model.sectors.unclassified)} ₽. QVANIX не угадывает сектор по названию бумаги.</p>}
   </section>
  </>}

  {mode==="equity"&&<section className="v3-assets-depth__professional-section"><header><div><span>АКЦИИ</span><h3>Фундаментальные показатели</h3></div><p>Мультипликаторы и денежные потоки показаны только там, где источник подтверждён. Это справочный слой, а не рейтинг бумаг.</p></header><V3EquityFundamentalsDepth positions={positions} onOpenAsset={onOpenAsset}/></section>}

  {mode==="bonds"&&<section className="v3-assets-depth__professional-section"><header><div><span>ОБЛИГАЦИИ</span><h3>Доходность и сроки</h3></div><p>YTM — оценка доходности к погашению при заданных условиях. Modified duration показывает чувствительность цены к изменению ставок, а не срок до погашения.</p></header>
   {model.bonds.bondCount?<section id="sam-assets-bonds" className="v3-assets-depth__block v3-assets-depth__bonds"><div className="v3-assets-depth__bond-grid">
    <article><span>ОФЗ</span><strong>{pct.format(model.bonds.ofzShare*100)}%</strong><small>облигационной части</small></article>
    <article><span>До погашения</span><strong>{model.bonds.weightedYearsToMaturity==null?"—":num.format(model.bonds.weightedYearsToMaturity)+" г."}</strong><small>взвешенный срок</small></article>
    <article><span>Известны даты</span><strong>{pct.format(model.bonds.maturityDateCoverage*100)}%</strong><small>покрытие капиталом</small></article>
    <article><span>Флоатеры</span><strong>{model.bonds.floatingCount}</strong><small>из {model.bonds.bondCount}</small></article>
   </div>
   <div className="v3-assets-depth__bond-line"><span>Ближайшее погашение</span><strong>{model.bonds.nearest?model.bonds.nearest.ticker+" · "+dateFmt.format(new Date(model.bonds.nearest.maturityDate)):"—"}</strong></div>
   <div className="v3-assets-depth__bond-line"><span>Эмитент · покрытие</span><strong>{pct.format(model.bondRisk.issuer.coverageRatio*100)}%</strong></div>
   <div className="v3-assets-depth__bond-line"><span>Сектор · покрытие</span><strong>{pct.format(model.bondRisk.sector.coverageRatio*100)}%</strong></div>
   <V3BondYieldDepth/>
   </section>:<div className="v3-assets-depth__empty">Облигаций в текущем подтверждённом составе нет.</div>}
  </section>}

  {mode==="positions"&&<section className="v3-assets-depth__professional-section"><header><div><span>ПОЗИЦИИ</span><h3>Инструменты и срезы</h3></div><p>Поиск, эмитенты, отрасли и валюты без повторного блока классов активов.</p></header><V3HoldingsExplorer positions={positions} onOpenAsset={onOpenAsset} initialDimension="instrument" showClassSummary={false}/></section>}
 </section>;
}
