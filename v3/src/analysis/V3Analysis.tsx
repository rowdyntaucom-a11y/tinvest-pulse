import{useMemo,useState}from"react";
import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3DetailMode,V3Shell}from"../app/model";
import{filterHistoryWindow,type V3HistoryWindow}from"../history/historyLens";
import{ratioToPercent,clampPercent}from"../data/units";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{V3AllocationDonut}from"./V3AllocationDonut";
import{buildV3AnalysisDepth,buildV3RelativeDepth}from"./analysisDepth";
import{V3ReturnLayer}from"./V3ReturnLayer";
import{V3RiskLayer}from"./V3RiskLayer";
import{V3MarketLayer}from"./V3MarketLayer";

const n=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const n2=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});

function assetClasses(items:PositionSnapshot[]){
  const map=new Map<string,number>();
  for(const item of items){
    const raw=item.instrumentType.toLowerCase();
    const label=raw.includes("bond")?"Облигации":raw.includes("share")||raw.includes("stock")?"Акции":raw.includes("etf")||raw.includes("fund")?"Фонды":"Прочее";
    map.set(label,(map.get(label)??0)+item.weight);
  }
  return[...map].sort((a,b)=>b[1]-a[1]);
}

function bondLens(items:PositionSnapshot[]){
  const bonds=items.filter(item=>item.bond);
  if(!bonds.length)return null;
  const weight=bonds.reduce((sum,item)=>sum+item.weight,0);
  const dated=bonds.filter(item=>item.bond?.maturityDate).sort((a,b)=>String(a.bond!.maturityDate).localeCompare(String(b.bond!.maturityDate)));
  const floating=bonds.filter(item=>item.bond?.floatingCoupon===true).reduce((sum,item)=>sum+item.weight,0);
  const amortizing=bonds.filter(item=>item.bond?.amortizing===true).reduce((sum,item)=>sum+item.weight,0);
  return{count:bonds.length,weight,next:dated[0]?.bond?.maturityDate??null,floating,amortizing};
}

function resultBreadth(items:PositionSnapshot[]){
  const active=items.filter(item=>item.currentValue>0);
  const positive=active.filter(item=>item.expectedYield>0);
  const negative=active.filter(item=>item.expectedYield<0);
  const flat=active.length-positive.length-negative.length;
  return{
    positive:positive.length,
    negative:negative.length,
    flat,
    positiveWeight:positive.reduce((sum,item)=>sum+item.weight,0),
    negativeWeight:negative.reduce((sum,item)=>sum+item.weight,0),
  };
}

export function V3Analysis({items,history,market,trusted,shell,mode,portfolioValue}:{items:PositionSnapshot[];history:HistoryPoint[];market:{riskFreeRate:number|null;riskFreeRateDate:string|null;nextRateMeeting:string|null};trusted:boolean;shell:V3Shell;mode:V3DetailMode;portfolioValue:number}){
  const rows=trusted?items:[],trustedHistory=trusted?history:[];
  const depth=useMemo(()=>buildV3AnalysisDepth(trustedHistory,rows,trusted?market.riskFreeRate:null),[trustedHistory,rows,trusted,market.riskFreeRate]);
  const ranked=[...rows].sort((a,b)=>b.currentValue-a.currentValue);
  const topRatio=ranked.slice(0,3).reduce((sum,item)=>sum+item.weight,0);
  const largest=ranked[0]??null;
  const positive=rows.filter(item=>item.expectedYield>0).length;
  const classes=assetClasses(rows),bonds=bondLens(rows),breadth=resultBreadth(rows);
  const[section,setSection]=useState<"overview"|"return"|"risk"|"structure"|"market">("overview");
  const[historyWindow,setHistoryWindow]=useState<V3HistoryWindow>("all");
  const relative=useMemo(()=>buildV3RelativeDepth(filterHistoryWindow(trustedHistory,historyWindow)),[trustedHistory,historyWindow]);
  const dd=depth.portfolio.maxDrawdown==null?null:-depth.portfolio.maxDrawdown*100;
  const effective=depth.portfolio.effectivePositions;
  const topPct=ratioToPercent(topRatio)??0;

  return <main className="v3-analysis" data-shell={shell}>
    <header className="v3-page-head"><span>ПОРТФЕЛЬ · ДИАГНОСТИКА</span><h1>Анализ</h1><p>{trusted?"Доходность, риск и структура · без торговых рекомендаций":"Аналитика скрыта до подтверждения данных"}</p></header>
    {trusted&&<section className="v3-analysis-signal"><div><span>Концентрация <V3MetricHelp topic="effectivePositions"/></span><strong>{effective==null?"—":n2.format(effective)+" экв."}</strong><small>{depth.portfolio.hhi==null?"HHI недоступен":"HHI "+n2.format(depth.portfolio.hhi)}</small></div><div><span>Крупнейшая</span><strong>{largest?.ticker??"—"}</strong><small>{largest?n.format(ratioToPercent(largest.weight)??0)+"% портфеля":"—"}</small></div></section>}
    <section className="v3-analysis-grid">
      <article><span>Макс. просадка <V3MetricHelp topic="maxDrawdown"/></span><strong className={dd==null?"is-neutral":dd<0?"is-negative":"is-neutral"}>{dd==null?"—":n.format(dd)+"%"}</strong><small>TWR · {depth.portfolio.historyPoints} точек</small></article>
      <article><span>В плюсе</span><strong>{trusted?positive+"/"+rows.length:"—"}</strong><small>По текущему broker P/L</small></article>
      <article><span>Топ-3 позиций <V3MetricHelp topic="top3"/></span><strong>{trusted?n.format(topPct)+"%":"—"}</strong><small>Концентрация капитала</small></article>
      <article><span>Позиций</span><strong>{trusted?rows.length:"—"}</strong><small>Подтверждённый состав</small></article>
    </section>
    {mode==="detailed"&&<nav className="v3-analysis-tabs is-depth" aria-label="Слои аналитики">
      {([["overview","Обзор"],["return","Доходность"],["risk","Риск"],["structure","Структура"],["market","Рынок"]] as const).map(([id,label])=><button key={id} className={section===id?"is-active":""} aria-current={section===id?"page":undefined} onClick={()=>setSection(id)}>{label}</button>)}
    </nav>}
    {mode==="detailed"&&section==="overview"&&<section className="v3-analysis-overview-depth">
      <div className="v3-analysis-quality"><div><span>Методика</span><strong>Analytics {depth.portfolio.calcVersion}</strong><small>TWR-first portfolio analytics</small></div><div><span>История</span><strong>{depth.portfolio.historyPoints} точек</strong><small>{depth.portfolio.historyDays} календарных дней</small></div><div><span>Целостность</span><strong className={depth.portfolio.historyIntegrity==="OK"?"is-positive":"is-negative"}>{depth.portfolio.historyIntegrity}</strong><small>{depth.portfolio.conflictingDates?depth.portfolio.conflictingDates+" конфликтных дат":"конфликтов не найдено"}</small></div></div>
      {rows.length>0&&<section className="v3-breadth"><h2>Ширина текущего broker P/L</h2><div><span>В плюсе</span><strong className="is-positive">{breadth.positive}</strong><small>{n.format(ratioToPercent(breadth.positiveWeight)??0)}% капитала</small></div><div><span>В минусе</span><strong className="is-negative">{breadth.negative}</strong><small>{n.format(ratioToPercent(breadth.negativeWeight)??0)}% капитала</small></div><div><span>Без изменения</span><strong>{breadth.flat}</strong><small>по текущему broker P/L</small></div></section>}
      <section className="v3-analysis-note">Верхняя просадка теперь считается по TWR-индексу, а не по рыночной стоимости счёта: пополнения и выводы не должны искажать риск-метрику. Текущий broker P/L позиций остаётся отдельным срезом.</section>
    </section>}
    {mode==="detailed"&&section==="return"&&trusted&&<V3ReturnLayer portfolio={depth.portfolio} rolling={depth.rolling} riskFreeRate={market.riskFreeRate} riskFreeRateDate={market.riskFreeRateDate}/>}
    {mode==="detailed"&&section==="risk"&&trusted&&<V3RiskLayer portfolio={depth.portfolio} tail={depth.tail} positions={rows} totalPortfolioValue={portfolioValue}/>}
    {mode==="detailed"&&section==="structure"&&rows.length>0&&<><V3AllocationDonut items={rows}/>{bonds&&<section className="v3-bond-lens"><h2>Облигационный слой</h2><div><span>Вес</span><strong>{n.format(ratioToPercent(bonds.weight)??0)}%</strong></div><div><span>Выпусков</span><strong>{bonds.count}</strong></div><div><span>Флоатеры</span><strong>{n.format(ratioToPercent(bonds.floating)??0)}%</strong></div><div><span>Амортиз.</span><strong>{n.format(ratioToPercent(bonds.amortizing)??0)}%</strong></div><small>{bonds.next?"Ближайшее погашение · "+bonds.next:"Даты погашения недоступны"}</small></section>}{classes.length>0&&<section className="v3-class-map"><h2>Классы активов</h2>{classes.map(([label,weight])=>{const weightPct=ratioToPercent(weight)??0;return <div key={label}><span>{label}</span><i><b style={{width:clampPercent(weightPct)+"%"}}/></i><strong>{n.format(weightPct)}%</strong></div>})}</section>}<section className="v3-analysis-detail"><h2>Карта концентрации</h2>{ranked.slice(0,5).map(item=>{const weightPct=ratioToPercent(item.weight)??0;return <div key={item.figi||item.ticker}><span>{item.ticker}</span><i><b style={{width:clampPercent(weightPct)+"%"}}/></i><strong>{n.format(weightPct)}%</strong></div>})}</section></>}
    {mode==="detailed"&&section==="market"&&trusted&&<V3MarketLayer relative={relative} window={historyWindow} onWindowChange={setHistoryWindow} market={market}/>}
    <section className="v3-analysis-note">Показатели описывают текущую структуру и подтверждённую историю. Они не являются рекомендацией купить, продать или выбрать конкретный актив.</section>
  </main>
}
