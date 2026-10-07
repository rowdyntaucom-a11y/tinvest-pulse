import{useEffect,useMemo,useRef,useState}from"react";
import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{buildV3AnalysisDepth,buildV3RelativeDepth}from"../analysis/analysisDepth";
import{V3ReturnLayer}from"../analysis/V3ReturnLayer";
import{V3RiskLayer}from"../analysis/V3RiskLayer";
import{V3MarketLayer}from"../analysis/V3MarketLayer";
import{filterHistoryWindow,type V3HistoryWindow}from"../history/historyLens";import{V3GlossaryHelp}from"../help/V3GlossaryHelp";
import"../styles/analysisDepth.css";
import{CoreDrawdownEpisodesV121}from"./CoreDrawdownEpisodesV121";
import{CoreRecoveryDepthV131}from"./CoreRecoveryDepthV131";
import{V3ReturnRegimeV127}from"../analysis/V3ReturnRegimeV127";
import{V3ReturnTailV145}from"../analysis/V3ReturnTailV145";
import{V3ReturnHitRateV155}from"../analysis/V3ReturnHitRateV155";

export type CoreAnalyticsMarketContext={
 riskFreeRate:number|null;
 riskFreeRateDate:string|null;
 nextRateMeeting:string|null;
};

type Section="return"|"risk"|"benchmark";
const SECTIONS:Array<[Section,string,string]>= [
 ["return","Доходность","TWR · скользящие окна · Sharpe"],
 ["risk","Риск","Просадка · хвостовые риски · связи активов"],
 ["benchmark","Сравнение с IMOEX","Результат · отклонение · чувствительность"],
];
const signedPct=(value:number|null)=>value==null?"—":new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"}).format(value*100)+"%";
const plainPct=(value:number|null)=>value==null?"—":new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1}).format(value*100)+"%";
const ratio=(value:number|null)=>value==null?"—":new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(value);

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
 const[pickerOpen,setPickerOpen]=useState(false);
 const[plainOpen,setPlainOpen]=useState(false);
 const pickerRef=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{
  if(!pickerOpen)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setPickerOpen(false)};
  document.addEventListener("keydown",onKey);
  return()=>document.removeEventListener("keydown",onKey);
 },[pickerOpen]);
 const depth=useMemo(()=>buildV3AnalysisDepth(history,positions,market.riskFreeRate),[history,positions,market.riskFreeRate]);
 const relative=useMemo(()=>buildV3RelativeDepth(filterHistoryWindow(history,window)),[history,window]);
 const integrity=depth.portfolio.historyIntegrity;
 const sectionMeta=SECTIONS.find(([id])=>id===section)??SECTIONS[0];
 const plain=section==="return"?{
  title:"Что это значит простыми словами",
  text:depth.portfolio.twr==null?"Сейчас истории недостаточно, чтобы честно оценить доходность стратегии отдельно от пополнений. Поэтому QVANIX оставляет показатель пустым.":`TWR показывает, как работал сам портфель без эффекта ваших пополнений и выводов. Волатильность описывает силу колебаний, а Sharpe — сколько исторической доходности приходилось на единицу риска.`,
 }:section==="risk"?{
  title:"Что это значит простыми словами",
  text:depth.portfolio.maxDrawdown==null?"Истории пока мало для устойчивого вывода о глубине прошлых просадок.":`Max Drawdown показывает самую глубокую подтверждённую просадку в доступной истории. Чем меньше эффективных позиций, тем сильнее результат может зависеть от нескольких крупных активов.`,
 }:{
  title:"Что это значит простыми словами",
  text:relative.available?`Здесь портфель сравнивается с IMOEX на одном и том же подтверждённом временном отрезке. Положительное относительное значение означает, что за этот отрезок портфель вырос сильнее индекса; отрицательное — слабее.`:"Для честного сравнения портфеля с IMOEX пока недостаточно общей подтверждённой истории.",
 };
 const decision=section==="return"?{
  eyebrow:"ГЛАВНЫЙ ОТВЕТ",
  title:depth.portfolio.twr==null?"Доходность пока не подтверждена":`TWR ${signedPct(depth.portfolio.twr)}`,
  text:depth.portfolio.twr==null?"Нужна достаточная непротиворечивая история. QVANIX не подставляет ноль вместо отсутствующей метрики.":`Волатильность ${plainPct(depth.portfolio.volatility)} · Sharpe ${ratio(depth.portfolio.sharpe)}. Ниже — выборка и дополнительные окна.`,
 }:section==="risk"?{
  eyebrow:"ГЛАВНЫЙ ОТВЕТ",
  title:depth.portfolio.maxDrawdown==null?"Риск пока ограничен историей":`Max Drawdown −${plainPct(depth.portfolio.maxDrawdown)}`,
  text:`Эквивалент позиций ${ratio(depth.portfolio.effectivePositions)} · хвостовой риск: ${depth.tail.available?"доступен":"ещё не прошёл проверку качества данных"}. Ниже — детали только по подтверждённой выборке.`,
 }:{
  eyebrow:"ГЛАВНЫЙ ОТВЕТ",
  title:relative.available?`Относительно IMOEX: ${signedPct(relative.excessReturn)}`:"Сравнение с IMOEX пока недоступно",
  text:relative.available?`Портфель ${signedPct(relative.portfolioReturn)} · IMOEX ${signedPct(relative.benchmarkReturn)} · общих точек ${relative.overlapPoints}.`:relative.note,
 };
 return <section className="core-analytics-depth" aria-label="Профессиональная аналитика портфеля">
  <header className="core-analytics-depth__head">
   <div><span>ПРОФЕССИОНАЛЬНАЯ АНАЛИТИКА // ТОЛЬКО ЧТЕНИЕ</span><h2>Профессиональная аналитика</h2><p>Каноническая TWR-история, риск и сравнение с IMOEX. Пополнения не выдаются за доходность, а неполные источники остаются закрытыми.</p></div>
   <strong className={integrity==="OK"?"is-ok":"is-warning"}>{integrity}</strong>
  </header>
  <div className="core-analytics-depth__help"><V3GlossaryHelp terms={["twr","var","cvar","beta","trackingError"]} label="Методика показателей"/><button type="button" className={plainOpen?"is-active":""} onClick={()=>setPlainOpen(v=>!v)}>{plainOpen?"Скрыть простое объяснение":"Объяснить простыми словами"}</button></div>
  {plainOpen&&<section className="core-analytics-depth__plain"><span>БЕЗ ЖАРГОНА</span><strong>{plain.title}</strong><p>{plain.text}</p><small>Это пояснение смысла метрик, а не инвестиционный вывод или прогноз.</small></section>}
  <section className="core-analytics-depth__route" aria-label="Текущий раздел аналитики">
   <span>ПРОФЕССИОНАЛЬНЫЙ СЛОЙ</span><strong>{sectionMeta[1]}</strong><small>{sectionMeta[2]}</small>
   <div className="core-analytics-depth__picker-anchor">
    <div className="core-analytics-depth__picker-control"><b>Раздел</b><button type="button" aria-haspopup="dialog" aria-expanded={pickerOpen} onClick={()=>setPickerOpen(true)}><span>{sectionMeta[1]}</span><i aria-hidden="true">⌄</i></button></div>
    {pickerOpen&&<div className="core-analytics-depth__picker-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setPickerOpen(false)}}>
     <div ref={pickerRef} className="core-analytics-depth__picker" role="dialog" aria-modal="true" aria-label="Выбрать раздел глубокой аналитики">
      <header><div><span>АНАЛИТИКА</span><strong>Выберите срез</strong></div><button type="button" aria-label="Закрыть" onClick={()=>setPickerOpen(false)}>×</button></header>
      <nav>{SECTIONS.map(([id,label,note])=><button key={id} type="button" className={section===id?"is-active":""} aria-pressed={section===id} onClick={()=>{setSection(id);setPickerOpen(false)}}><span><strong>{label}</strong><small>{note}</small></span><i aria-hidden="true">{section===id?"✓":"›"}</i></button>)}</nav>
     </div>
    </div>}
   </div>
  </section>
  <nav className="core-analytics-depth__nav" aria-label="Раздел глубокой аналитики" role="tablist">
   {SECTIONS.map(([id,label,note])=><button key={id} type="button" role="tab" aria-selected={section===id} className={section===id?"is-active":""} aria-pressed={section===id} onClick={()=>setSection(id)}><strong>{label}</strong><small>{note}</small></button>)}
  </nav>
  <section className="core-analytics-depth__decision" aria-live="polite"><span>{decision.eyebrow}</span><strong>{decision.title}</strong><p>{decision.text}</p></section>
  <section className="core-analytics-depth__evidence" aria-label="Основа расчёта"><span>ОСНОВА РАСЧЁТА</span><div><article><b>{history.length}</b><small>точек истории</small></article><article><b>{positions.length}</b><small>текущих позиций</small></article><article><b>{relative.available?relative.overlapPoints:"—"}</b><small>общих точек с IMOEX</small></article></div><p>{integrity==="OK"?"История прошла проверку целостности.":"История ограничена: недоступные метрики остаются пустыми."}</p></section>
  <div className="core-analytics-depth__stage">
   {section==="return"&&<><V3ReturnLayer portfolio={depth.portfolio} rolling={depth.rolling} riskFreeRate={market.riskFreeRate} riskFreeRateDate={market.riskFreeRateDate}/><V3ReturnRegimeV127 history={history}/><V3ReturnTailV145 history={history}/><V3ReturnHitRateV155 history={history}/></>}
   {section==="risk"&&<><V3RiskLayer portfolio={depth.portfolio} tail={depth.tail} positions={positions} totalPortfolioValue={totalPortfolioValue} onOpenAsset={onOpenAsset}/><CoreDrawdownEpisodesV121 history={history}/><CoreRecoveryDepthV131 history={history}/></>}
   {section==="benchmark"&&<V3MarketLayer relative={relative} window={window} onWindowChange={setWindow} market={market}/>}
  </div>
  <footer>Все показатели описательные. VaR/CVaR, корреляция, beta, excess return и rolling-метрики основаны на доступной подтверждённой истории и не являются прогнозом или торговым сигналом.</footer>
 </section>;
}
