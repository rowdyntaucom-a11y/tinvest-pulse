import{useMemo,useState}from"react";
import type{PointerEvent}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{V3HistoryWindowControl}from"../history/V3HistoryWindowControl";
import{filterHistoryWindow,summarizeHistoryValue,type V3HistoryWindow}from"../history/historyLens";
import{buildHistorySegments,nearestHistoryPoint,type ChartPoint}from"../history/historyGeometry";
import"../history/historyInteraction.css";

const money=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});
const deltaMoney=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1,signDisplay:"exceptZero"});
const percent=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2,signDisplay:"exceptZero"});
const date=(v:string)=>{const d=new Date(v);return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short"}).format(d)};
export type V3HistoryChartMode="value"|"performance";

function rebase(points:HistoryPoint[],field:"portfolio"|"imoex"){
 const first=points.find(point=>point[field]!=null)?.[field]??null;
 if(first==null||!Number.isFinite(first)||first===0)return points.map(point=>({...point,[field]:null}));
 return points.map(point=>({...point,[field]:point[field]==null?null:Number(((point[field]!/first)*100).toFixed(4))}));
}

export function V3HistorySparkline({points,detailed=false,windowValue,onWindowChange,modeValue,onModeChange}:{points:HistoryPoint[];detailed?:boolean;windowValue?:V3HistoryWindow;onWindowChange?:(value:V3HistoryWindow)=>void;modeValue?:V3HistoryChartMode;onModeChange?:(value:V3HistoryChartMode)=>void}){
 const[internalWindow,setInternalWindow]=useState<V3HistoryWindow>("all");
 const[selected,setSelected]=useState<ChartPoint|null>(null);
 const[internalMode,setInternalMode]=useState<V3HistoryChartMode>("value");
 const window=windowValue??internalWindow,mode=modeValue??internalMode;
 const setWindow=(value:V3HistoryWindow)=>{if(windowValue==null)setInternalWindow(value);onWindowChange?.(value)};
 const setMode=(value:V3HistoryChartMode)=>{if(modeValue==null)setInternalMode(value);onModeChange?.(value)};
 const activeWindow=detailed?window:"all";
 const windowPoints=filterHistoryWindow(points,activeWindow);
 const performancePoints=useMemo(()=>{
  const portfolio=rebase(windowPoints,"portfolio");
  const imoex=rebase(windowPoints,"imoex");
  return portfolio.map((point,index)=>({...point,imoex:imoex[index]?.imoex??null}));
 },[windowPoints]);
 const valueSummary=summarizeHistoryValue(windowPoints);
 const valueRows=windowPoints.filter(x=>x.value!=null);
 const performanceRows=performancePoints.filter(x=>x.portfolio!=null);
 const hasPerformance=performanceRows.length>=2;
 const activeMode=detailed&&mode==="performance"&&hasPerformance?"performance":"value";
 if(activeMode==="value"&&(!valueSummary||valueRows.length<2))return <div className="v3-chart-empty">История появится после подтверждения данных</div>;

 const numeric=activeMode==="value"
  ?windowPoints.flatMap(x=>[x.value,x.invested]).filter((x):x is number=>x!=null&&Number.isFinite(x))
  :performancePoints.flatMap(x=>[x.portfolio,x.imoex]).filter((x):x is number=>x!=null&&Number.isFinite(x));
 const min=Math.min(...numeric),max=Math.max(...numeric),span=max-min||1;
 const sourcePoints=activeMode==="value"?windowPoints:performancePoints;
 const primarySegments=buildHistorySegments(sourcePoints,activeMode==="value"?"value":"portfolio",min,max);
 const secondarySegments=buildHistorySegments(sourcePoints,activeMode==="value"?"invested":"imoex",min,max);
 const primary=primarySegments.flat(),last=primary.at(-1)!;
 const selectedRow=selected?sourcePoints.find(point=>point.date===selected.date):null;
 const portfolioStart=performanceRows[0]?.portfolio??null,portfolioEnd=performanceRows.at(-1)?.portfolio??null;
 const benchmarkRows=performancePoints.filter(x=>x.imoex!=null),benchmarkStart=benchmarkRows[0]?.imoex??null,benchmarkEnd=benchmarkRows.at(-1)?.imoex??null;
 const portfolioDelta=portfolioStart!=null&&portfolioEnd!=null?portfolioEnd/portfolioStart*100-100:null;
 const benchmarkDelta=benchmarkStart!=null&&benchmarkEnd!=null?benchmarkEnd/benchmarkStart*100-100:null;
 const baselineY=activeMode==="performance"&&min<=100&&max>=100?44-((100-min)/span)*36:null;
 const firstDate=(activeMode==="value"?valueRows[0]?.date:performanceRows[0]?.date)??null;
 const lastDate=(activeMode==="value"?valueRows.at(-1)?.date:performanceRows.at(-1)?.date)??null;

 const select=(event:PointerEvent<SVGSVGElement>)=>{
  if(!detailed)return;
  const box=event.currentTarget.getBoundingClientRect();
  setSelected(nearestHistoryPoint(primarySegments,(event.clientX-box.left)/Math.max(1,box.width)));
 };

 return <figure className={"v3-history-figure is-"+activeMode}>
  {detailed&&<div className="v3-history-toolbar">
   <div className="v3-history-mode" role="group" aria-label="Режим графика">
    <button type="button" className={mode==="value"?"is-active":""} aria-pressed={mode==="value"} onClick={()=>{setMode("value");setSelected(null)}}>Стоимость</button>
    <button type="button" disabled={!hasPerformance} className={mode==="performance"?"is-active":""} aria-pressed={mode==="performance"} onClick={()=>{setMode("performance");setSelected(null)}}>TWR vs IMOEX</button>
   </div>
   <V3HistoryWindowControl value={window} onChange={v=>{setWindow(v);setSelected(null)}}/>
  </div>}
  {detailed&&<div className="v3-history-axis" aria-hidden="true"><span>{activeMode==="value"?money.format(max)+" ₽":percent.format(max-100)+"%"}</span><span>{activeMode==="value"?money.format(min)+" ₽":percent.format(min-100)+"%"}</span></div>}
  <svg className={`v3-chart is-${activeMode}${detailed?" is-interactive":""}`} viewBox="0 0 100 48" preserveAspectRatio="none" role="img" aria-label={activeMode==="value"?"История стоимости портфеля. Пропуски данных не соединяются.":"TWR портфеля и IMOEX, перебазированные к 100 в выбранном периоде."} onPointerDown={select} onPointerMove={e=>e.pointerType==="mouse"&&select(e)}>
   {detailed&&[8,20,32,44].map(y=><line key={y} className="v3-chart-grid" x1="0" x2="100" y1={y} y2={y}/>)}
   {detailed&&baselineY!=null&&<line className="v3-chart-baseline" x1="0" x2="100" y1={baselineY} y2={baselineY}/>}
   {detailed&&primarySegments.map((segment,i)=>segment.length>1?<polygon key={`a${i}`} className="v3-chart-area" points={`${segment[0].x},44 ${segment.map(p=>`${p.x},${p.y}`).join(" ")} ${segment.at(-1)!.x},44`}/>:null)}
   {primarySegments.map((segment,i)=>segment.length>1?<polyline key={`p${i}`} className="v3-chart-primary" points={segment.map(p=>`${p.x},${p.y}`).join(" ")}/>:null)}
   {secondarySegments.map((segment,i)=>segment.length>1?<polyline key={`s${i}`} className="v3-chart-secondary" points={segment.map(p=>`${p.x},${p.y}`).join(" ")}/>:null)}
   <circle className="v3-chart-end" cx={last.x} cy={last.y} r="1.5"/>
   {detailed&&selected&&<><line className="v3-chart-cursor" x1={selected.x} y1="4" x2={selected.x} y2="46"/><circle className="v3-chart-selected" cx={selected.x} cy={selected.y} r="2"/></>}
  </svg>
  {detailed&&firstDate&&lastDate&&<div className="v3-history-range" aria-hidden="true"><span>{date(firstDate)}</span><strong>{activeMode==="value"?`${valueRows.length} точек`:`${performanceRows.length} точек`}</strong><span>{date(lastDate)}</span></div>}
  {detailed&&selected&&<div className="v3-history-point" role="status">
   <span>{date(selected.date)}</span>
   <strong>{activeMode==="value"?money.format(selected.value)+" ₽":percent.format(selected.value-100)+"%"}</strong>
   <small>{activeMode==="value"?(selectedRow?.invested==null?"стоимость портфеля":"внесено · "+money.format(selectedRow.invested)+" ₽"):(selectedRow?.imoex==null?"TWR · IMOEX —":"TWR · IMOEX "+percent.format(selectedRow.imoex-100)+"%")}</small>
  </div>}
  {detailed&&<div className="v3-history-legend" aria-label="Легенда графика">
   <span><i/>{activeMode==="value"?"Стоимость":"TWR портфеля"}</span>
   {secondarySegments.some(x=>x.length>1)&&<span><i className="is-secondary"/>{activeMode==="value"?"Внесено":"IMOEX"}</span>}
  </div>}
  {activeMode==="value"&&valueSummary?<figcaption><span>{date(valueRows[0].date)} · {money.format(valueSummary.startValue)} ₽</span><strong className={valueSummary.deltaValue>0?"is-positive":valueSummary.deltaValue<0?"is-negative":"is-neutral"}>{deltaMoney.format(valueSummary.deltaValue)} ₽</strong><span>{date(valueRows.at(-1)!.date)} · {money.format(valueSummary.endValue)} ₽</span></figcaption>:<figcaption><span>TWR {portfolioDelta==null?"—":percent.format(portfolioDelta)+"%"}</span><strong className={(portfolioDelta??0)>0?"is-positive":(portfolioDelta??0)<0?"is-negative":"is-neutral"}>{portfolioDelta==null||benchmarkDelta==null?"—":percent.format(portfolioDelta-benchmarkDelta)+" п.п."}</strong><span>IMOEX {benchmarkDelta==null?"—":percent.format(benchmarkDelta)+"%"}</span></figcaption>}
  {detailed&&activeMode==="value"&&valueSummary&&<section className="v3-history-depth" aria-label="Детали выбранного периода"><div><span>Стоимость Δ</span><strong>{deltaMoney.format(valueSummary.deltaValue)} ₽</strong><small>изменение стоимости, не доходность</small></div><div><span>Диапазон</span><strong>{money.format(valueSummary.minValue)}–{money.format(valueSummary.maxValue)} ₽</strong><small>{valueSummary.points} точек</small></div><div><span>Внесено Δ</span><strong>{valueSummary.investedDelta==null?"—":deltaMoney.format(valueSummary.investedDelta)+" ₽"}</strong><small>по подтверждённой истории</small></div></section>}
  {detailed&&activeMode==="performance"&&<section className="v3-history-depth" aria-label="Сравнение за выбранный период"><div><span>TWR портфеля</span><strong>{portfolioDelta==null?"—":percent.format(portfolioDelta)+"%"}</strong><small>денежные потоки нейтрализованы</small></div><div><span>IMOEX</span><strong>{benchmarkDelta==null?"—":percent.format(benchmarkDelta)+"%"}</strong><small>тот же доступный период</small></div><div><span>Разница</span><strong>{portfolioDelta==null||benchmarkDelta==null?"—":percent.format(portfolioDelta-benchmarkDelta)+" п.п."}</strong><small>не прогноз и не рейтинг</small></div></section>}
 </figure>;
}
