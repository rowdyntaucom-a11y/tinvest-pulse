import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3IncomeModel}from"../income/V3Income";
import{buildCommandCenterModelV110}from"./coreCommandCenterModelV110";

type Props={positions:PositionSnapshot[];history:HistoryPoint[];income:V3IncomeModel};
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const neutralPct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const compact=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});
const money=(v:number|null)=>v==null?"—":rub.format(v)+" ₽";
const percent=(v:number|null)=>v==null?"—":pct.format(v)+"%";

export function CoreCommandCenterV110({positions,history,income}:Props){
 const[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let current:HTMLElement|null=null,portalHost:HTMLElement|null=null;
  const detach=()=>{if(portalHost?.isConnected)portalHost.remove();portalHost=null;current=null;setHost(null)};
  const attach=()=>{const target=document.querySelector<HTMLElement>(".sb-home-cockpit");if(target===current)return;detach();if(!target)return;portalHost=document.createElement("div");portalHost.className="core-command-center-host-v110";target.insertAdjacentElement("afterend",portalHost);current=target;setHost(portalHost)};
  attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();detach()};
 },[]);
 const model=useMemo(()=>buildCommandCenterModelV110(positions,history,income),[positions,history,income]);
 if(!host||model.total<=0)return null;
 const pnlMax=Math.max(.0001,...model.positions.map(row=>Math.abs(row.impactPct)));
 const primaryClass=[...model.classes].sort((a,b)=>b.share-a.share)[0];
 const impactRail=(value:number)=><span className="rail" aria-hidden="true"><i className="neg">{value<0&&<em className="downbar" style={{width:`${Math.max(3,Math.abs(value)/pnlMax*100)}%`}}/>}</i><i className="pos">{value>=0&&<em className="upbar" style={{width:`${Math.max(3,Math.abs(value)/pnlMax*100)}%`}}/>}</i></span>;
 return createPortal(<section className="core-command-center-v110" aria-label="Центр управления портфелем">
  <header className="core-command-center-v110__head"><div><span>QVANIX COMMAND CENTER</span><h2>Портфель одним экраном</h2><p>Капитал, риск, структура, P/L и пассивный поток — только подтверждённые данные.</p></div><strong>{model.historyReady?"LIVE VIEW":"CURRENT VIEW"}</strong></header>
  <div className="core-command-center-v110__hero">
   <article className="core-command-center-v110__capital"><div className="core-command-center-v110__title"><span><small>КАПИТАЛ</small><b>{compact.format(model.total)} ₽</b></span><span><small>P/L</small><b className={model.profit>=0?"up":"down"}>{money(model.profit)}</b></span></div>{model.historyReady?<><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Подтверждённая траектория капитала"><defs><linearGradient id="v110fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopOpacity=".22"/><stop offset="1" stopOpacity="0"/></linearGradient></defs><g className="grid">{[25,50,75].map(y=><line key={y} x1="0" y1={y} x2="100" y2={y}/>)}</g><polygon className="fill" points={`0,100 ${model.curve.map(p=>`${p.x},${p.y}`).join(" ")} 100,100`}/><polyline className="line" points={model.curve.map(p=>`${p.x},${p.y}`).join(" ")}/></svg><footer><span>Δ капитал <b className={(model.capitalDelta??0)>=0?"up":"down"}>{money(model.capitalDelta)}</b></span><span>Δ внесено <b>{money(model.investedDelta)}</b></span></footer></>:<div className="core-command-center-v110__empty">История капитала ещё накапливается</div>}</article>
   <article className="core-command-center-v110__risk"><div className="core-command-center-v110__title"><span><small>РИСК-КОНТУР</small><b>Текущий срез</b></span><span><small>Просадка</small><b className="down">{percent(model.currentDrawdown)}</b></span></div><div className="core-command-center-v110__risk-grid"><div><span>Макс. просадка</span><b className="down">{percent(model.maxDrawdown)}</b><small>по подтверждённой истории</small></div><div><span>Топ-3</span><b>{neutralPct.format(model.top3Share)}%</b><small>капитала</small></div><div><span>Эффективных позиций</span><b>{model.effectiveCount==null?"—":neutralPct.format(model.effectiveCount)}</b><small>1 / HHI</small></div><div><span>В минусе</span><b>{neutralPct.format(model.negativeShare)}%</b><small>текущего капитала</small></div></div><div className="core-command-center-v110__breadth" aria-label="Распределение капитала по знаку P/L"><i className="upbar" style={{width:`${model.positiveShare}%`}}/><i className="downbar" style={{width:`${model.negativeShare}%`}}/><i className="flatbar" style={{width:`${model.flatShare}%`}}/></div><footer><span className="up">Плюс {neutralPct.format(model.positiveShare)}%</span><span className="down">Минус {neutralPct.format(model.negativeShare)}%</span></footer></article>
  </div>
  <div className="core-command-center-v110__middle">
   <article className="core-command-center-v110__allocation"><div className="core-command-center-v110__title"><span><small>СТРУКТУРА</small><b>{model.classes.length} класса</b></span><span><small>Главный класс</small><b>{primaryClass?.key||"—"}</b></span></div><div className="core-command-center-v110__allocation-stack" aria-label="Точные доли классов активов">{model.classes.map((row,index)=><i key={row.key} className={`c${index}`} style={{width:`${row.share}%`}} title={`${row.key}: ${neutralPct.format(row.share)}%`}/>)}</div><ul>{model.classes.map((row,index)=><li key={row.key}><span><i className={`c${index}`}/>{row.key}</span><b>{neutralPct.format(row.share)}%</b><small>{compact.format(row.value)} ₽</small></li>)}</ul></article>
   <article className="core-command-center-v110__income"><div className="core-command-center-v110__title"><span><small>ПАССИВНЫЙ ПОТОК</small><b>{money(model.incomeTotal)}</b></span><span><small>Среднее / мес.</small><b>{money(model.incomeMonthly)}</b></span></div><div className="core-command-center-v110__income-grid"><div><span>Темп в год</span><b>{money(model.incomeAnnual)}</b><small>масштаб среднего</small></div><div><span>Темп / капитал</span><b>{model.incomeAnnualShare==null?"—":neutralPct.format(model.incomeAnnualShare)+"%"}</b><small>не прогноз</small></div><div><span>Получено / месяц</span><b>{model.incomeFlowMonths==null?"—":neutralPct.format(model.incomeFlowMonths)+"×"}</b><small>отношение факта</small></div></div><p>Годовой темп — эквивалент наблюдаемого среднего, а не обещание будущих выплат.</p></article>
  </div>
  <article className="core-command-center-v110__impact"><div className="core-command-center-v110__title"><span><small>ВКЛАД В P/L</small><b>Что двигает текущий результат</b></span><span><small>Всего</small><b className={model.profit>=0?"up":"down"}>{percent(model.profitPct)}</b></span></div><div className="core-command-center-v110__impact-list">{model.positions.map(row=><div key={row.ticker}><span className="ticker">{row.ticker}</span>{impactRail(row.impactPct)}<b className={row.pnl>=0?"up":"down"}>{money(row.pnl)}</b><small>{pct.format(row.impactPct)} п.п. · {neutralPct.format(row.weight)}% капитала</small></div>)}</div><div className="core-command-center-v110__impact-axis"><span>тянет вниз</span><span>0</span><span>тянет вверх</span></div></article>
  <div className="core-command-center-v110__foot"><span><b>Концентрация топ-5</b>{neutralPct.format(model.top5Share)}%</span><span><b>Пик капитала</b>{money(model.peakValue)}</span><span><b>Позиций</b>{positions.length}</span><span><b>Статус</b>{model.trusted?"подтверждено":"ограничено"}</span></div>
 </section>,host);
}
