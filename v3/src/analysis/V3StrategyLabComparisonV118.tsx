import{useMemo}from"react";
import type{StrategyLabScenarioResult}from"./strategyHistoryLab";
import"../styles/strategyLabComparisonV118.css";

type Props={a:StrategyLabScenarioResult|null;b:StrategyLabScenarioResult|null;windowYears:1|3|5};
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"2-digit"});
function fmtPct(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?`${value>0?"+":""}${pct.format(value*100)}%`:"—"}
function fmtIndex(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?pct.format(value*100):"—"}
function fmtDate(value:string|null|undefined){if(!value)return"—";const ts=Date.parse(value+"T00:00:00Z");return Number.isFinite(ts)?dateFmt.format(new Date(ts)):"—"}
function currentDrawdown(curve:{value:number}[]){let peak=0;for(const p of curve)peak=Math.max(peak,p.value);const last=curve.at(-1)?.value??0;return peak>0?last/peak-1:null}
function maxDivergence(a:{date:string;value:number}[],b:{date:string;value:number}[]){const n=Math.min(a.length,b.length);let best={date:"",gap:0};for(let i=0;i<n;i++){const gap=Math.abs(a[i].value-b[i].value);if(gap>best.gap)best={date:a[i].date,gap}}return best}
function crossings(a:{value:number}[],b:{value:number}[]){const n=Math.min(a.length,b.length);let count=0,prev=0;for(let i=0;i<n;i++){const d=a[i].value-b[i].value,sign=Math.abs(d)<1e-10?0:d>0?1:-1;if(sign&&prev&&sign!==prev)count++;if(sign)prev=sign}return count}
function leadShare(a:{value:number}[],b:{value:number}[]){const n=Math.min(a.length,b.length);if(!n)return null;let above=0,comparable=0;for(let i=0;i<n;i++){if(!Number.isFinite(a[i].value)||!Number.isFinite(b[i].value))continue;comparable++;if(a[i].value>b[i].value)above++}return comparable?above/comparable:null}
function chartPoints(curve:{value:number}[],min:number,max:number){const span=Math.max(1e-9,max-min),n=Math.max(1,curve.length-1);return curve.map((p,i)=>`${(i/n*100).toFixed(2)},${(100-(p.value-min)/span*100).toFixed(2)}`).join(" ")}

export function V3StrategyLabComparisonV118({a,b,windowYears}:Props){
 const model=useMemo(()=>{
  if(!a?.available||!b?.available||a.curve.length<2||b.curve.length<2)return null;
  const values=[...a.curve,...b.curve].map(x=>x.value).filter(Number.isFinite),rawMin=Math.min(...values),rawMax=Math.max(...values),padding=Math.max((rawMax-rawMin)*.08,.015),min=Math.max(0,rawMin-padding),max=rawMax+padding;
  const divergence=maxDivergence(a.curve,b.curve),share=leadShare(a.curve,b.curve),endA=a.curve.at(-1)?.value??null,endB=b.curve.at(-1)?.value??null;
  return{min,max,mid:(min+max)/2,pointsA:chartPoints(a.curve,min,max),pointsB:chartPoints(b.curve,min,max),divergence,share,endA,endB,finalGap:endA!=null&&endB!=null?endA-endB:null,crossings:crossings(a.curve,b.curve),currentDdA:currentDrawdown(a.curve),currentDdB:currentDrawdown(b.curve),start:a.curve[0]?.date??null,end:a.curve.at(-1)?.date??null,points:Math.min(a.curve.length,b.curve.length)};
 },[a,b]);
 if(!model)return <section className="v3-strategy-compare-v118 is-unavailable"><header><div><span>СРАВНЕНИЕ // ОБЩАЯ ШКАЛА</span><strong>Траектория стратегий</strong></div><small>{windowYears}Г</small></header><p>График появляется только когда оба пользовательских сценария рассчитаны на одной подтверждённой исторической выборке.</p></section>;
 const ddMax=Math.max(Math.abs(a?.metrics?.maxDrawdown??0),Math.abs(b?.metrics?.maxDrawdown??0),.0001);
 return <section className="v3-strategy-compare-v118" aria-label="Сравнение исторических траекторий сценариев A и B">
  <header><div><span>СРАВНЕНИЕ // ОБЩАЯ ШКАЛА</span><strong>Траектория стратегий</strong><p>Обе линии начинаются со 100 и используют одну историческую выборку. Это сравнение прошлой модели, не прогноз.</p></div><small>{windowYears}Г · {model.points} точек</small></header>
  <div className="v3-strategy-compare-v118__legend"><article><i className="is-a"/><span>Сценарий A</span><strong>{fmtIndex(model.endA)}</strong></article><article><i className="is-b"/><span>Сценарий B</span><strong>{fmtIndex(model.endB)}</strong></article><article><span>Период</span><strong>{fmtDate(model.start)} → {fmtDate(model.end)}</strong></article></div>
  <div className="v3-strategy-compare-v118__chart-wrap">
   <div className="v3-strategy-compare-v118__axis" aria-hidden="true"><span>{fmtIndex(model.max)}</span><span>{fmtIndex(model.mid)}</span><span>{fmtIndex(model.min)}</span></div>
   <svg className="v3-strategy-compare-v118__chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Исторический индекс сценариев A и B"><line x1="0" y1="0" x2="100" y2="0"/><line x1="0" y1="50" x2="100" y2="50"/><line x1="0" y1="100" x2="100" y2="100"/><polyline className="is-a" points={model.pointsA}/><polyline className="is-b" points={model.pointsB}/></svg>
  </div>
  <div className="v3-strategy-compare-v118__facts">
   <article><span>Финальная разница индекса</span><strong>{model.finalGap==null?"—":`${model.finalGap>0?"A +":"B +"}${pct.format(Math.abs(model.finalGap)*100)} п.`}</strong><small>разница нормированных траекторий, не рейтинг</small></article>
   <article><span>Макс. расхождение</span><strong>{pct.format(model.divergence.gap*100)} п.</strong><small>{fmtDate(model.divergence.date)}</small></article>
   <article><span>A выше B</span><strong>{model.share==null?"—":pct.format(model.share*100)+"% точек"}</strong><small>частота наблюдений, не вероятность будущего</small></article>
   <article><span>Пересечения</span><strong>{model.crossings}</strong><small>смен направления разницы A/B</small></article>
  </div>
  <section className="v3-strategy-compare-v118__drawdown"><header><div><span>ПРОСАДКА</span><strong>Глубина на одной шкале</strong></div><small>наблюдаемая история</small></header>{([{label:"A",max:a?.metrics?.maxDrawdown??null,current:model.currentDdA},{label:"B",max:b?.metrics?.maxDrawdown??null,current:model.currentDdB}] as const).map(row=><article key={row.label}><strong>{row.label}</strong><div><span>Макс. {fmtPct(row.max)}</span><i><b style={{width:`${Math.min(100,Math.abs(row.max??0)/ddMax*100)}%`}}/></i></div><div><span>Сейчас {fmtPct(row.current)}</span><i><b style={{width:`${Math.min(100,Math.abs(row.current??0)/ddMax*100)}%`}}/></i></div></article>)}</section>
  <footer>Индексы MCFTR/RGBITR, веса и методика ребалансировки остаются теми же, что в лаборатории. Блок только визуализирует уже рассчитанные исторические сценарии и не выбирает «лучший».</footer>
 </section>;
}
