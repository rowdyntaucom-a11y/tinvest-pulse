import{useEffect,useMemo,useState,type PointerEvent}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{AssetHistoryPoint}from"../../../v2/src/lib/assetHistoryApi";
import{V3HistoryWindowControl}from"../history/V3HistoryWindowControl";
import type{V3HistoryWindow}from"../history/historyLens";
import{filterAssetHistoryWindow,summarizeAssetHistory}from"./assetHistoryLens";

const priceFmt=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});
const shortDateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short"});

type HistoryMeta={
  from:string|null;
  to:string|null;
  source:string|null;
  version:string|null;
};

function isBond(v:string){return v.toLowerCase().includes("bond")}
function quote(position:PositionSnapshot,value:number){return priceFmt.format(value)+(isBond(position.instrumentType)?"%":" ₽")}
function dateValue(date:string){const value=Date.parse(date+"T00:00:00Z");return Number.isFinite(value)?value:null}
function percentChange(from:number,to:number){return from>0?to/from*100-100:null}

export function V3AssetHistoryChart({position,points,window,onWindowChange,meta}:{position:PositionSnapshot;points:AssetHistoryPoint[];window:V3HistoryWindow;onWindowChange:(value:V3HistoryWindow)=>void;meta:HistoryMeta}){
  const visible=useMemo(()=>filterAssetHistoryWindow(points,window),[points,window]);
  const summary=useMemo(()=>summarizeAssetHistory(visible),[visible]);
  const[selectedIndex,setSelectedIndex]=useState(Math.max(0,visible.length-1));

  useEffect(()=>{setSelectedIndex(Math.max(0,visible.length-1))},[window,visible.length]);

  const geometry=useMemo(()=>{
    if(visible.length<2)return null;
    const times=visible.map(point=>dateValue(point.date));
    if(times.some(value=>value==null))return null;
    const firstTime=times[0]!,lastTime=times.at(-1)!,timeSpan=Math.max(1,lastTime-firstTime);
    const min=Math.min(...visible.map(point=>point.value)),max=Math.max(...visible.map(point=>point.value)),valueSpan=Math.max(1e-9,max-min);
    const coords=visible.map((point,index)=>({
      x:4+((times[index]!-firstTime)/timeSpan)*92,
      y:42-((point.value-min)/valueSpan)*34,
    }));
    return{
      min,max,
      coords,
      line:coords.map(point=>`${point.x},${point.y}`).join(" "),
      area:`4,44 ${coords.map(point=>`${point.x},${point.y}`).join(" ")} 96,44`,
    };
  },[visible]);

  const selected=visible[selectedIndex]??visible.at(-1)??null;
  const selectedCoord=geometry?.coords[selectedIndex]??geometry?.coords.at(-1)??null;
  const prior=selectedIndex>0?visible[selectedIndex-1]:null;
  const start=visible[0]??null;
  const previousChange=selected&&prior?percentChange(prior.value,selected.value):null;
  const windowChange=selected&&start?percentChange(start.value,selected.value):null;

  const selectFromPointer=(event:PointerEvent<SVGSVGElement>)=>{
    if(!geometry||visible.length<2)return;
    const rect=event.currentTarget.getBoundingClientRect();
    if(rect.width<=0)return;
    const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width))*100;
    let nearest=0,best=Number.POSITIVE_INFINITY;
    geometry.coords.forEach((point,index)=>{const distance=Math.abs(point.x-x);if(distance<best){best=distance;nearest=index}});
    setSelectedIndex(nearest);
  };

  if(!summary||!geometry)return null;

  const first=visible[0],middle=visible[Math.floor((visible.length-1)/2)],last=visible.at(-1)!;
  const sourceRange=meta.from&&meta.to?`${shortDateFmt.format(new Date(meta.from+"T00:00:00Z"))} — ${shortDateFmt.format(new Date(meta.to+"T00:00:00Z"))}`:null;

  return <div className="v3-asset-history-explorer">
    <V3HistoryWindowControl value={window} onChange={onWindowChange} label={"Период истории "+position.ticker}/>
    <div className="v3-asset-history-selected" aria-live="polite">
      <div><span>Выбрано</span><strong>{selected?dateFmt.format(new Date(selected.date+"T00:00:00Z")):"—"}</strong></div>
      <div><span>Цена</span><strong>{selected?quote(position,selected.value):"—"}</strong></div>
      <div><span>К пред. точке</span><strong className={previousChange!=null&&previousChange<0?"is-negative":previousChange!=null&&previousChange>0?"is-positive":""}>{previousChange==null?"—":pct.format(previousChange)+"%"}</strong></div>
      <div><span>От начала периода</span><strong className={windowChange!=null&&windowChange<0?"is-negative":windowChange!=null&&windowChange>0?"is-positive":""}>{windowChange==null?"—":pct.format(windowChange)+"%"}</strong></div>
    </div>
    <div className="v3-asset-history-plot">
      <div className="v3-asset-history-y is-top">{quote(position,geometry.max)}</div>
      <div className="v3-asset-history-y is-bottom">{quote(position,geometry.min)}</div>
      <svg className="v3-asset-history-chart is-interactive" viewBox="0 0 100 48" preserveAspectRatio="none" role="img" aria-label={"Интерактивная история цены "+position.ticker} onPointerDown={selectFromPointer} onPointerMove={selectFromPointer}>
        <line x1="4" y1="8" x2="96" y2="8"/>
        <line x1="4" y1="25" x2="96" y2="25"/>
        <line x1="4" y1="42" x2="96" y2="42"/>
        <polygon points={geometry.area}/>
        <polyline points={geometry.line}/>
        {selectedCoord&&<><line className="v3-asset-history-guide" x1={selectedCoord.x} y1="6" x2={selectedCoord.x} y2="44"/><circle className="v3-asset-history-selected-dot" cx={selectedCoord.x} cy={selectedCoord.y} r="1.8"/></>}
      </svg>
    </div>
    <div className="v3-asset-history-axis" aria-hidden="true"><span>{shortDateFmt.format(new Date(first.date+"T00:00:00Z"))}</span><span>{shortDateFmt.format(new Date(middle.date+"T00:00:00Z"))}</span><span>{shortDateFmt.format(new Date(last.date+"T00:00:00Z"))}</span></div>
    <input className="v3-asset-history-scrubber" type="range" min={0} max={Math.max(0,visible.length-1)} step={1} value={selectedIndex} aria-label={"Выбор точки истории "+position.ticker} onChange={event=>setSelectedIndex(Number(event.currentTarget.value))}/>
    <div className="v3-asset-history-caption"><span>{dateFmt.format(new Date(summary.startDate+"T00:00:00Z"))} · {quote(position,summary.first)}</span><strong className={summary.change!=null&&summary.change<0?"is-negative":summary.change!=null&&summary.change>0?"is-positive":""}>{summary.change==null?"—":pct.format(summary.change)+"%"}</strong><span>{dateFmt.format(new Date(summary.endDate+"T00:00:00Z"))} · {quote(position,summary.last)}</span></div>
    <div className="v3-asset-history-stats"><article><span>Мин.</span><strong>{quote(position,summary.min)}</strong></article><article><span>Макс.</span><strong>{quote(position,summary.max)}</strong></article><article><span>Точек</span><strong>{summary.points}</strong></article></div>
    <div className="v3-asset-history-provenance">
      <article><span>Последняя подтверждённая точка</span><strong>{dateFmt.format(new Date(last.date+"T00:00:00Z"))}</strong></article>
      <article><span>Покрытие ответа</span><strong>{sourceRange??"по точкам ряда"}</strong></article>
      <article><span>Источник</span><strong>T‑Invest GetCandles</strong></article>
    </div>
    <small className="v3-asset-source">Точки расположены по реальному времени наблюдений, а не равномерно по индексу. Изменение «к пред. точке» относится к предыдущей подтверждённой точке и не называется дневной доходностью. Пропуски не интерполируются; наблюдаемый период не является прогнозом.</small>
  </div>
}
