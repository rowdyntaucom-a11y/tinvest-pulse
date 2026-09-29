import{useMemo,useState}from"react";
import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{buildV3AnalysisDepth,buildV3RelativeDepth}from"../analysis/analysisDepth";
import{V3ReturnLayer}from"../analysis/V3ReturnLayer";
import{V3RiskLayer}from"../analysis/V3RiskLayer";
import{V3MarketLayer}from"../analysis/V3MarketLayer";
import{filterHistoryWindow,type V3HistoryWindow}from"../history/historyLens";
import"../styles/analysisDepth.css";

export type CoreAnalyticsMarketContext={
 riskFreeRate:number|null;
 riskFreeRateDate:string|null;
 nextRateMeeting:string|null;
};

type Section="return"|"risk"|"benchmark";
const SECTIONS:Array<[Section,string,string]>= [
 ["return","Доходность","TWR · rolling · Sharpe"],
 ["risk","Риск","DD · VaR/CVaR · корреляции"],
 ["benchmark","IMOEX","beta · TE · excess"],
];

export function CoreAnalyticsDepth({
 positions,history,market,totalPortfolioValue,onOpenAsset,
}:{
 positions:PositionSnapshot[];
 history:HistoryPoint[];
 market:CoreAnalyticsMarketContext;
 totalPortfolioValue:number;
 onOpenAsset?:(position:PositionSnapshot)=>void;
}){
 const[section,setSection]=useState<Section>("return");
 const[window,setWindow]=useState<V3HistoryWindow>("all");
 const depth=useMemo(()=>buildV3AnalysisDepth(history,positions,market.riskFreeRate),[history,positions,market.riskFreeRate]);
 const relative=useMemo(()=>buildV3RelativeDepth(filterHistoryWindow(history,window)),[history,window]);
 const integrity=depth.portfolio.historyIntegrity;
 return <section className="core-analytics-depth" aria-label="Глубокая аналитика портфеля">
  <header className="core-analytics-depth__head">
   <div><span>ANALYTICS DEPTH // READ-ONLY</span><h2>Глубокая аналитика</h2><p>Каноническая TWR-история, риск и сравнение с IMOEX. Пополнения не выдаются за доходность, а неполные источники остаются закрытыми.</p></div>
   <strong className={integrity==="OK"?"is-ok":"is-warning"}>{integrity}</strong>
  </header>
  <nav className="core-analytics-depth__nav" aria-label="Раздел глубокой аналитики">
   {SECTIONS.map(([id,label,note])=><button key={id} type="button" className={section===id?"is-active":""} aria-pressed={section===id} onClick={()=>setSection(id)}><strong>{label}</strong><small>{note}</small></button>)}
  </nav>
  <div className="core-analytics-depth__stage">
   {section==="return"&&<V3ReturnLayer portfolio={depth.portfolio} rolling={depth.rolling} riskFreeRate={market.riskFreeRate} riskFreeRateDate={market.riskFreeRateDate}/>}
   {section==="risk"&&<V3RiskLayer portfolio={depth.portfolio} tail={depth.tail} positions={positions} totalPortfolioValue={totalPortfolioValue} onOpenAsset={onOpenAsset}/>}
   {section==="benchmark"&&<V3MarketLayer relative={relative} window={window} onWindowChange={setWindow} market={market}/>}
  </div>
  <footer>Все показатели описательные. VaR/CVaR, корреляция, beta, excess return и rolling-метрики основаны на доступной подтверждённой истории и не являются прогнозом или торговым сигналом.</footer>
 </section>;
}
