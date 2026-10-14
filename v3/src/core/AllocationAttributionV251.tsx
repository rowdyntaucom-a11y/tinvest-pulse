import{useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{buildAllocationAttribution,allocationAttributionCsv,ASSET_NAMES,type AssetClass}from"../analysis/allocationAttributionV251";

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0,signDisplay:"exceptZero"});
const percent=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const cash=(v:number|null)=>v===null?"—":money.format(v)+" ₽";
const pct=(v:number|null)=>v===null?"—":percent.format(v)+"%";
type GroupFilter=AssetClass|"all";
export function AllocationAttributionV251({positions,trusted,onOpenAsset}:{positions:PositionSnapshot[];trusted:boolean;onOpenAsset:(position:PositionSnapshot)=>void}){
 const model=useMemo(()=>buildAllocationAttribution(positions,trusted),[positions,trusted]);
 const[filter,setFilter]=useState<GroupFilter>("all");
 const[showAll,setShowAll]=useState(false);
 const selected:GroupFilter=filter==="all"||model.classes.some(g=>g.assetClass===filter)?filter:"all";
 const rows=model.positions.filter(row=>selected==="all"||row.assetClass===selected);
 const limited=showAll?rows:rows.slice(0,8);
 const sourceById=new Map(positions.map((position,index)=>[(position.instrumentUid||position.figi||position.ticker)+"-"+index,position]));
 if(!model.trusted||model.count===0)return null;
 const saveCsv=()=>{
  const content=allocationAttributionCsv(model,selected);if(!content)return;
  const blob=new Blob([content],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
  try{link.href=url;link.download="qvanix-allocation-"+selected+".csv";document.body.appendChild(link);link.click()}finally{link.remove();URL.revokeObjectURL(url)}
 };
 return <details className="qc-allocation-attribution">
 <summary>Структура и вклад активов <small>{model.count} позиций · {model.classes.length} классов</small></summary>
 <div className="qc-allocation-summary" aria-label="Ключевые показатели структуры портфеля">
 <div><span>Учтённые позиции</span><strong>{cash(model.total)}</strong></div>
 <div><span>Текущий результат позиций</span><strong>{cash(model.unrealizedPnl)}</strong><small>{pct(model.unrealizedPct)} к затратам</small></div>
 <div><span>Топ-5 по стоимости</span><strong>{pct(model.top5Pct)}</strong><small>HHI: {model.hhi===null?"—":Math.round(model.hhi)}</small></div>
 </div>
 <div className="qc-allocation-groups" role="group" aria-label="Фильтр по классу актива">
 <button type="button" aria-pressed={selected==="all"} onClick={()=>{setFilter("all");setShowAll(false)}}>Все <b>{model.count}</b></button>
 {model.classes.map(group=><button type="button" key={group.assetClass} aria-pressed={selected===group.assetClass} onClick={()=>{setFilter(group.assetClass);setShowAll(false)}}>
 <span>{group.title}</span><b>{pct(group.weightPct)}</b><small>{group.positions} шт. · результат {cash(group.unrealizedPnl)}</small>
 </button>)}
 </div>
 <div className="qc-allocation-controls">
 <span>{selected==="all"?"Все открытые позиции":ASSET_NAMES[selected]} · {rows.length}</span>
 <button type="button" onClick={saveCsv} aria-label="Скачать проверенную структуру и результат открытых позиций в CSV">CSV ↓</button>
 </div>
 <div className="qc-allocation-list">
 {limited.map(item=><button type="button" key={item.id} className="qc-allocation-position" onClick={()=>{const source=sourceById.get(item.id);if(source)onOpenAsset(source)}} aria-label={"Открыть актив "+item.ticker}>
 <span className="qc-allocation-identity"><b>{item.ticker||"—"}</b><small>{item.name||ASSET_NAMES[item.assetClass]}</small></span>
 <span className="qc-allocation-share"><span>{pct(item.weightPct)} от учтённой стоимости</span><i><em style={{width:Math.max(0,Math.min(100,item.weightPct))+"%"}}/></i></span>
 <span className="qc-allocation-money"><b>{cash(item.currentValue)}</b><small>{cash(item.unrealizedPnl)} · {pct(item.costReturnPct)}</small></span>
 </button>)}
 </div>
 {rows.length>8&&<button type="button" className="qc-allocation-more" aria-expanded={showAll} onClick={()=>setShowAll(x=>!x)}>{showAll?"Свернуть ↑":"Все позиции ("+rows.length+") ↓"}</button>}
 <small className="qc-allocation-explanation">Доли рассчитаны от рыночной стоимости учтённых открытых позиций, без неучтённого остатка денег. Результат — показатель по позициям от брокера, не TWR, не полученные дивиденды или купоны. Для фьючерсов рыночная стоимость не эквивалентна номинальному риску.</small>
 {model.unreconciledCount>0&&<small className="qc-allocation-difference" role="note">У {model.unreconciledCount} позиций стоимость минус затраты заметно отличается от переданного брокером результата. Причиной могут быть особенности учёта инструментов; оба значения сохранены без искусственной корректировки.</small>}
 </details>;
}
