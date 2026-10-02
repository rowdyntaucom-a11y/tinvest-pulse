import{useMemo}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{buildImpactMap}from"./impactMap";

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});

export function V3ImpactTreemap({positions,onOpenAsset}:{positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}){
 const map=useMemo(()=>buildImpactMap(positions),[positions]);
 if(!map.cells.length)return null;
 return <section className="v3-impact-map" aria-label="Карта влияния позиций на текущий P/L">
  <header><div><span>ВИЗУАЛЬНАЯ КАРТА</span><h2>Карта влияния на P/L</h2><p>Размер блока = доля позиции в текущем капитале. Тон блока показывает знак текущего broker P/L.</p></div><small>{map.cells.length} позиций</small></header>
  <div className="v3-impact-map__legend"><span><i className="is-positive"/>В плюсе · {map.positiveCount}</span><span><i className="is-negative"/>В минусе · {map.negativeCount}</span>{map.flatCount>0&&<span><i className="is-flat"/>Без изменения · {map.flatCount}</span>}</div>
  <div className="v3-impact-map__mosaic">{map.cells.map(cell=><button type="button" key={cell.key} className={"v3-impact-map__cell is-"+cell.state} style={{flexGrow:Math.max(.02,cell.weight),flexBasis:`${Math.max(18,cell.weightPct*5.4)}px`}} onClick={()=>onOpenAsset?.(cell.position)} aria-label={`${cell.ticker}: ${pct.format(cell.weightPct)}% капитала, P/L ${cell.pl>=0?"плюс ":"минус "}${money.format(Math.abs(cell.pl))} рублей`}>
    <strong>{cell.ticker}</strong><span>{pct.format(cell.weightPct)}%</span><small>{cell.pl>0?"+":cell.pl<0?"−":""}{money.format(Math.abs(cell.pl))} ₽{cell.plPct==null?"":" · "+(cell.plPct>0?"+":"")+pct.format(cell.plPct)+"%"}</small>
   </button>)}</div>
  <footer>Это визуализация текущего состава и broker P/L, а не оценка качества актива и не рекомендация.</footer>
 </section>;
}
