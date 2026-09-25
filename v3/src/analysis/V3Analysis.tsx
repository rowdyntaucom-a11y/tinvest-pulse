import{lazy,Suspense,useMemo,useState}from"react";
import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3DetailMode,V3Shell}from"../app/model";
import{filterHistoryWindow,type V3HistoryWindow}from"../history/historyLens";
import{ratioToPercent,clampPercent}from"../data/units";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{assetClassLabel,assetClassKey}from"../data/assetClasses";
import{V3SectionSelector}from"../navigation/V3SectionSelector";
import{V3AllocationDonut}from"./V3AllocationDonut";
import{buildV3AnalysisDepth,buildV3RelativeDepth}from"./analysisDepth";
import{V3ReturnLayer}from"./V3ReturnLayer";
import{V3RiskLayer}from"./V3RiskLayer";
import{V3MarketLayer}from"./V3MarketLayer";
import{SamuraiWorkspaceChrome}from"../samurai/SamuraiWorkspaceChrome";
import{SamuraiTrustGate}from"../samurai/SamuraiTrustGate";
import{SamuraiChapterNav,SamuraiNextCue}from"../samurai/SamuraiChapterNav";
import{CosmosTrustGate}from"../cosmos/CosmosTrustGate";
import{CosmosWorkspaceStage}from"../cosmos/CosmosWorkspaceStage";
import{NordTrustGate}from"../nord/NordTrustGate";
import{NordWorkspaceStage}from"../nord/NordWorkspaceStage";
import{NordAnalysisTerminal}from"../nord/NordTerminals";
import"../styles/analysisDepthTransition.css";
const V3RebalanceWorkspace=lazy(()=>import("./V3RebalanceWorkspace").then(m=>({default:m.V3RebalanceWorkspace})));
const V3PortfolioLab=lazy(()=>import("./V3PortfolioLab").then(m=>({default:m.V3PortfolioLab})));\nconst V3FallenAssetsDiscovery=lazy(()=>import("./V3FallenAssetsDiscovery").then(m=>({default:m.V3FallenAssetsDiscovery})));

const n=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const n2=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
function assetClasses(items:PositionSnapshot[]){const map=new Map<string,number>();for(const item of items){const label=assetClassLabel(assetClassKey(item.instrumentType));map.set(label,(map.get(label)??0)+item.weight)}return[...map].sort((a,b)=>b[1]-a[1])}
function bondLens(items:PositionSnapshot[]){const bonds=items.filter(item=>item.bond);if(!bonds.length)return null;const weight=bonds.reduce((sum,item)=>sum+item.weight,0),dated=bonds.filter(item=>item.bond?.maturityDate).sort((a,b)=>String(a.bond!.maturityDate).localeCompare(String(b.bond!.maturityDate))),floating=bonds.filter(item=>item.bond?.floatingCoupon===true).reduce((sum,item)=>sum+item.weight,0),amortizing=bonds.filter(item=>item.bond?.amortizing===true).reduce((sum,item)=>sum+item.weight,0);return{count:bonds.length,weight,next:dated[0]?.bond?.maturityDate??null,floating,amortizing}}
function resultBreadth(items:PositionSnapshot[]){const active=items.filter(item=>item.currentValue>0),positive=active.filter(item=>item.expectedYield>0),negative=active.filter(item=>item.expectedYield<0);return{positive:positive.length,negative:negative.length,flat:active.length-positive.length-negative.length,positiveWeight:positive.reduce((sum,item)=>sum+item.weight,0),negativeWeight:negative.reduce((sum,item)=>sum+item.weight,0)}}

export function V3Analysis({items,history,market,trusted,shell,mode,portfolioValue,onOpenAsset,onRefresh,refreshing=false}:{items:PositionSnapshot[];history:HistoryPoint[];market:{riskFreeRate:number|null;riskFreeRateDate:string|null;nextRateMeeting:string|null};trusted:boolean;shell:V3Shell;mode:V3DetailMode;portfolioValue:number;onOpenAsset?:(position:PositionSnapshot)=>void;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
 const rows=trusted?items:[],trustedHistory=trusted?history:[];
 const depth=useMemo(()=>buildV3AnalysisDepth(trustedHistory,rows,trusted?market.riskFreeRate:null),[trustedHistory,rows,trusted,market.riskFreeRate]);
 const ranked=[...rows].sort((a,b)=>b.currentValue-a.currentValue),topRatio=ranked.slice(0,3).reduce((sum,item)=>sum+item.weight,0),largest=ranked[0]??null,positive=rows.filter(item=>item.expectedYield>0).length,classes=assetClasses(rows),bonds=bondLens(rows),breadth=resultBreadth(rows);
 const[section,setSection]=useState<"overview"|"return"|"risk"|"structure"|"market">("overview");
 const sectionOptions=[{value:"overview",label:"Обзор",description:"Методика, качество истории и ширина текущего broker P/L."},{value:"return",label:"Доходность",description:"TWR, волатильность, Sharpe, Sortino и rolling-окна."},{value:"risk",label:"Риск",description:"Просадка, tail risk, вклад позиций и корреляции."},{value:"structure",label:"Структура",description:"Классы активов, облигационный слой и концентрация капитала."},{value:"market",label:"Рынок",description:"Сопоставление портфеля с IMOEX на общей выборке."}] as const;
 const[historyWindow,setHistoryWindow]=useState<V3HistoryWindow>("all"),relative=useMemo(()=>buildV3RelativeDepth(filterHistoryWindow(trustedHistory,historyWindow)),[trustedHistory,historyWindow]);
 const dd=depth.portfolio.maxDrawdown==null?null:-depth.portfolio.maxDrawdown*100,effective=depth.portfolio.effectivePositions,topPct=ratioToPercent(topRatio)??0,themedDepth=shell==="samurai"||shell==="carbon"||shell==="aurora",samuraiReference=shell==="samurai";
 const scrollToDepth=()=>{const el=document.getElementById("v3-analysis-depth");if(!el)return;const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})};
 if(shell==="carbon"&&!trusted)return <CosmosTrustGate kind="analysis" onRefresh={onRefresh} refreshing={refreshing}/>;if(shell==="aurora"&&!trusted)return <NordTrustGate kind="analysis" onRefresh={onRefresh} refreshing={refreshing}/>;
 return <main className="v3-analysis" data-shell={shell} data-trusted={trusted}><SamuraiWorkspaceChrome shell={shell} glyph="眼" code="TACTICAL // 03" label="RISK & RETURN"/>{shell==="carbon"&&<CosmosWorkspaceStage/>}{shell==="aurora"&&trusted&&<NordWorkspaceStage kind="analysis" targetId="nord-analysis-terminal" value={dd==null?"—":n.format(dd)+"%"} meta={(effective==null?"концентрация —":"концентрация "+n2.format(effective)+" экв.")+" · "+rows.length+" позиций"}/>} 
  {shell!=="aurora"&&<header className="v3-page-head"><span>ПОРТФЕЛЬ · ДИАГНОСТИКА</span><h1>Анализ</h1><p>{trusted?"Доходность, риск и структура · без торговых рекомендаций":"Аналитика скрыта до подтверждения данных"}</p></header>}
  {shell==="samurai"&&!trusted&&<SamuraiTrustGate kind="analysis" onRefresh={onRefresh} refreshing={refreshing}/>}
  {shell==="aurora"&&trusted&&<div id="nord-analysis-terminal" className="nord-terminal-anchor" aria-hidden="true"/>}{shell==="aurora"&&trusted&&<NordAnalysisTerminal maxDrawdown={dd} effective={effective} largestTicker={largest?.ticker??null} largestWeight={largest?ratioToPercent(largest.weight):null} positive={positive} totalPositions={rows.length} top3={topPct}/>} {shell!=="aurora"&&trusted&&<section className="v3-analysis-signal"><div><span>Концентрация <V3MetricHelp topic="effectivePositions"/></span><strong>{effective==null?"—":n2.format(effective)+" экв."}</strong><small>{depth.portfolio.hhi==null?"HHI недоступен":"HHI "+n2.format(depth.portfolio.hhi)}</small></div><div><span>Крупнейшая</span><strong>{largest?.ticker??"—"}</strong><small>{largest?n.format(ratioToPercent(largest.weight)??0)+"% портфеля":"—"}</small></div></section>}
  {shell!=="aurora"&&<section className="v3-analysis-grid"><article><span>Макс. просадка <V3MetricHelp topic="maxDrawdown"/></span><strong className={dd==null?"is-neutral":dd<0?"is-negative":"is-neutral"}>{dd==null?"—":n.format(dd)+"%"}</strong><small>TWR · {depth.portfolio.historyPoints} точек</small></article><article><span>В плюсе</span><strong>{trusted?positive+"/"+rows.length:"—"}</strong><small>По текущему broker P/L</small></article><article><span>Топ-3 позиций <V3MetricHelp topic="top3"/></span><strong>{trusted?n.format(topPct)+"%":"—"}</strong><small>Концентрация капитала</small></article><article><span>Позиций</span><strong>{trusted?rows.length:"—"}</strong><small>Подтверждённый состав</small></article></section>}
  {trusted&&themedDepth&&<button type="button" className="v3-analysis-depth-cue" onClick={scrollToDepth} aria-label="Перейти к глубокому анализу"><i aria-hidden="true">⌄</i></button>}
  {trusted&&themedDepth&&<div className="v3-analysis-depth-spacer" aria-hidden="true"/>}
  <section id="v3-analysis-depth" className={themedDepth?"v3-analysis-depth-anchor":""}>
   {samuraiReference&&trusted&&<SamuraiChapterNav label="Аналитика Samurai" chapters={[
    {id:"sam-analysis-overview",code:"壱",label:"Обзор",note:"качество и ширина"},
    {id:"sam-analysis-return",code:"弐",label:"Доходность",note:"TWR · Sharpe · rolling"},
    {id:"sam-analysis-risk",code:"参",label:"Риск",note:"DD · VaR/CVaR"},
    {id:"sam-analysis-structure",code:"肆",label:"Структура",note:"классы · облигации"},
    {id:"sam-analysis-market",code:"伍",label:"Рынок",note:"IMOEX · beta · TE"},
    {id:"sam-analysis-rebalance",code:"陸",label:"Ребалансировка",note:"цель · drift · сценарий"},
    {id:"sam-analysis-lab",code:"漆",label:"Лаборатория",note:"MCFTR · RGBITR · сценарии"},\n    {id:"sam-analysis-discovery",code:"捌",label:"Просадки",note:"high · low · SMA · recovery"}
   ]}/>}
   {!samuraiReference&&mode==="detailed"&&<V3SectionSelector label="Раздел аналитики" value={section} onChange={setSection} options={sectionOptions}/>} 

   {((samuraiReference&&trusted)||(mode==="detailed"&&section==="overview"))&&<div id="sam-analysis-overview" className={samuraiReference?"sam-reference-chapter":undefined}>
    <section className="v3-analysis-overview-depth"><div className="v3-analysis-quality"><div><span>Методика</span><strong>Analytics {depth.portfolio.calcVersion}</strong><small>TWR-first portfolio analytics</small></div><div><span>История</span><strong>{depth.portfolio.historyPoints} точек</strong><small>{depth.portfolio.historyDays} календарных дней</small></div><div><span>Целостность</span><strong className={depth.portfolio.historyIntegrity==="OK"?"is-positive":"is-negative"}>{depth.portfolio.historyIntegrity}</strong><small>{depth.portfolio.conflictingDates?depth.portfolio.conflictingDates+" конфликтных дат":"конфликтов не найдено"}</small></div></div>{rows.length>0&&<section className="v3-breadth"><h2>Ширина текущего broker P/L</h2><div><span>В плюсе</span><strong className="is-positive">{breadth.positive}</strong><small>{n.format(ratioToPercent(breadth.positiveWeight)??0)}% капитала</small></div><div><span>В минусе</span><strong className="is-negative">{breadth.negative}</strong><small>{n.format(ratioToPercent(breadth.negativeWeight)??0)}% капитала</small></div><div><span>Без изменения</span><strong>{breadth.flat}</strong><small>по текущему broker P/L</small></div></section>}<section className="v3-analysis-note">Верхняя просадка считается по TWR-индексу, а не по рыночной стоимости счёта: пополнения и выводы не должны искажать риск-метрику. Текущий broker P/L позиций остаётся отдельным срезом.</section></section>
    {samuraiReference&&<SamuraiNextCue targetId="sam-analysis-return" label="ДАЛЬШЕ · ДОХОДНОСТЬ"/>}
   </div>}

   {((samuraiReference&&trusted)||(mode==="detailed"&&section==="return"))&&trusted&&<div id="sam-analysis-return" className={samuraiReference?"sam-reference-chapter":undefined}>
    <V3ReturnLayer portfolio={depth.portfolio} rolling={depth.rolling} riskFreeRate={market.riskFreeRate} riskFreeRateDate={market.riskFreeRateDate}/>
    {samuraiReference&&<SamuraiNextCue targetId="sam-analysis-risk" label="ДАЛЬШЕ · РИСК"/>}
   </div>}

   {((samuraiReference&&trusted)||(mode==="detailed"&&section==="risk"))&&trusted&&<div id="sam-analysis-risk" className={samuraiReference?"sam-reference-chapter":undefined}>
    <V3RiskLayer portfolio={depth.portfolio} tail={depth.tail} positions={rows} totalPortfolioValue={portfolioValue} onOpenAsset={onOpenAsset}/>
    {samuraiReference&&<SamuraiNextCue targetId="sam-analysis-structure" label="ДАЛЬШЕ · СТРУКТУРА"/>}
   </div>}

   {((samuraiReference&&trusted&&rows.length>0)||(mode==="detailed"&&section==="structure"&&rows.length>0))&&<div id="sam-analysis-structure" className={samuraiReference?"sam-reference-chapter":undefined}>
    <V3AllocationDonut items={rows}/>
    {bonds&&<section className="v3-bond-lens"><h2>Облигационный слой</h2><div><span>Вес</span><strong>{n.format(ratioToPercent(bonds.weight)??0)}%</strong></div><div><span>Выпусков</span><strong>{bonds.count}</strong></div><div><span>Флоатеры</span><strong>{n.format(ratioToPercent(bonds.floating)??0)}%</strong></div><div><span>Амортиз.</span><strong>{n.format(ratioToPercent(bonds.amortizing)??0)}%</strong></div><small>{bonds.next?"Ближайшее погашение · "+bonds.next:"Даты погашения недоступны"}</small></section>}
    {classes.length>0&&<section className="v3-class-map"><h2>Классы активов</h2>{classes.map(([label,weight])=>{const weightPct=ratioToPercent(weight)??0;return <div key={label}><span>{label}</span><i><b style={{width:clampPercent(weightPct)+"%"}}/></i><strong>{n.format(weightPct)}%</strong></div>})}</section>}
    <section className="v3-analysis-detail is-drillable"><h2>Карта концентрации</h2>{ranked.slice(0,5).map(item=>{const weightPct=ratioToPercent(item.weight)??0;return <button type="button" key={item.instrumentUid||item.figi||item.ticker} onClick={()=>onOpenAsset?.(item)} aria-label={"Открыть актив "+item.ticker}><span>{item.ticker}</span><i><b style={{width:clampPercent(weightPct)+"%"}}/></i><strong>{n.format(weightPct)}%</strong><em aria-hidden="true">›</em></button>})}</section>
    {samuraiReference&&<SamuraiNextCue targetId="sam-analysis-market" label="ДАЛЬШЕ · РЫНОК"/>}
   </div>}

   {((samuraiReference&&trusted)||(mode==="detailed"&&section==="market"))&&trusted&&<div id="sam-analysis-market" className={samuraiReference?"sam-reference-chapter":undefined}>
    <V3MarketLayer relative={relative} window={historyWindow} onWindowChange={setHistoryWindow} market={market}/>
    {samuraiReference&&<SamuraiNextCue targetId="sam-analysis-rebalance" label="ДАЛЬШЕ · РЕБАЛАНСИРОВКА"/>}
   </div>}

   {samuraiReference&&trusted&&<div id="sam-analysis-rebalance" className="sam-reference-chapter"><Suspense fallback={<section className="v3-analysis-note">Открываем сценарий ребалансировки…</section>}><V3RebalanceWorkspace positions={rows}/></Suspense><SamuraiNextCue targetId="sam-analysis-lab" label="ДАЛЬШЕ · PORTFOLIO LAB"/></div>}

   {samuraiReference&&trusted&&<div id="sam-analysis-lab" className="sam-reference-chapter"><Suspense fallback={<section className="v3-analysis-note">Открываем Portfolio Laboratory…</section>}><V3PortfolioLab positions={rows}/></Suspense><SamuraiNextCue targetId="sam-analysis-discovery" label="ДАЛЬШЕ · ТЕХНИЧЕСКИЙ DISCOVERY"/></div>}\n\n   {samuraiReference&&trusted&&<div id="sam-analysis-discovery" className="sam-reference-chapter"><Suspense fallback={<section className="v3-analysis-note">Открываем технический discovery…</section>}><V3FallenAssetsDiscovery/></Suspense></div>}

   <section className="v3-analysis-note">Показатели описывают текущую структуру и подтверждённую историю. Они не являются рекомендацией купить, продать или выбрать конкретный актив.</section>
  </section>
 </main>
}
