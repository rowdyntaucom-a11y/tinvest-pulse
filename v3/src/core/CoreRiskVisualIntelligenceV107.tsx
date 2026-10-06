import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

type Props={positions:PositionSnapshot[];history:HistoryPoint[]};
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const rub=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1,signDisplay:"exceptZero"});
const date=(v:string)=>{const d=new Date(v);return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"2-digit"}).format(d)};

export function CoreRiskVisualIntelligenceV107({positions,history}:Props){
 const[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let target:HTMLElement|null=null,portalHost:HTMLElement|null=null;
  const detach=()=>{if(portalHost?.isConnected)portalHost.remove();portalHost=null;target=null;setHost(null)};
  const attach=()=>{
   const next=document.querySelector<HTMLElement>(".sb-analytics .sb-risk-hero");
   if(next===target)return;
   detach();if(!next)return;
   portalHost=document.createElement("div");portalHost.className="core-risk-visual-host-v107";next.insertAdjacentElement("afterend",portalHost);target=next;setHost(portalHost);
  };
  attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();detach()};
 },[]);
 const model=useMemo(()=>{
  const rows=history.filter(x=>typeof x.value==="number"&&Number.isFinite(x.value)&&x.value!>0);
  let peak=0;const drawdowns=rows.map((row,index)=>{peak=Math.max(peak,row.value!);const dd=peak>0?row.value!/peak-1:0;return{index,dd,date:row.date,value:row.value!}});
  const maxPoint=drawdowns.length?drawdowns.reduce((worst,row)=>row.dd<worst.dd?row:worst,drawdowns[0]):null;
  const maxDd=maxPoint?.dd??0,currentDd=drawdowns.at(-1)?.dd??0,depth=Math.max(.0001,Math.abs(maxDd));
  const points=drawdowns.map((x,i)=>({x:drawdowns.length<2?50:i/(drawdowns.length-1)*100,y:12+Math.abs(x.dd)/depth*74,dd:x.dd,date:x.date}));
  const total=positions.reduce((s,x)=>s+(Number.isFinite(x.currentValue)?x.currentValue:0),0);
  const impacts=positions.filter(x=>Number.isFinite(x.expectedYield)&&x.expectedYield!==0).map(x=>({ticker:x.ticker,value:x.expectedYield,impact:total>0?x.expectedYield/total*100:0,weight:total>0?Math.max(0,x.currentValue)/total*100:0})).sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact)).slice(0,6);
  const maxImpact=Math.max(.0001,...impacts.map(x=>Math.abs(x.impact)));
  const negativeCapital=positions.filter(x=>x.expectedYield<0).reduce((s,x)=>s+Math.max(0,x.currentValue),0);
  const last=rows.at(-1)?.value??null,gapToPeak=last==null||peak<=0?null:last-peak;
  return{rows,points,maxDd,currentDd,total,impacts,maxImpact,negativeCapital,last,peak,maxPoint,gapToPeak};
 },[positions,history]);
 if(!host||model.rows.length<2)return null;
 const polygon=model.points.length?`0,12 ${model.points.map(p=>`${p.x},${p.y}`).join(" ")} 100,12`:"";
 return createPortal(<section className="core-risk-visual-v107" aria-label="Визуальный профиль риска">
  <header><span><b>Профиль просадки</b><small>только подтверждённая история стоимости</small></span><strong>{model.rows.length} точек</strong></header>
  <div className="core-risk-visual-v107__grid">
   <article className="core-risk-visual-v107__drawdown"><div className="head"><span>Историческая просадка</span><b className="down">{pct.format(model.maxDd*100)}%</b></div><div className="plot"><div className="scale" aria-hidden="true"><span>0%</span><span>{pct.format(model.maxDd*50)}%</span><span>{pct.format(model.maxDd*100)}%</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Просадка стоимости портфеля от предыдущего исторического максимума"><line className="zero" x1="0" y1="12" x2="100" y2="12"/><polygon points={polygon}/><polyline points={model.points.map(p=>`${p.x},${p.y}`).join(" ")}/></svg></div><div className="core-risk-visual-v107__drawdown-cues"><span><small>Сейчас</small><b className={model.currentDd<0?"down":""}>{pct.format(model.currentDd*100)}%</b></span><span><small>Макс. просадка</small><b className="down">{pct.format(model.maxDd*100)}%</b><em>{model.maxPoint?date(model.maxPoint.date):"—"}</em></span><span><small>До пика</small><b className={(model.gapToPeak??0)<0?"down":""}>{model.gapToPeak==null?"—":rub.format(model.gapToPeak)+" ₽"}</b></span><span><small>Пик</small><b>{model.peak?rub.format(model.peak)+" ₽":"—"}</b></span></div></article>
   <article className="core-risk-visual-v107__impact"><div className="head"><span>Вклад P/L по позициям</span><b>0 по центру</b></div><div className="rows">{model.impacts.map(row=><div key={row.ticker}><span>{row.ticker}</span><i className="center-rail" aria-hidden="true"><em className="neg">{row.impact<0&&<b className="downbar" style={{width:`${Math.max(3,Math.abs(row.impact)/model.maxImpact*100)}%`}}/>}</em><em className="pos">{row.impact>=0&&<b className="upbar" style={{width:`${Math.max(3,Math.abs(row.impact)/model.maxImpact*100)}%`}}/>}</em></i><strong className={row.impact>=0?"up":"down"}>{pct.format(row.impact)} п.п.</strong><small>{rub.format(row.value)} ₽ · {pct.format(row.weight)}% капитала</small></div>)}</div><footer className="axis"><span>вниз</span><span>0</span><span>вверх</span></footer></article>
   <article className="core-risk-visual-v107__loss"><div><span>Капитал в позициях с отрицательным P/L</span><b>{model.total>0?pct.format(model.negativeCapital/model.total*100)+"%":"—"}</b></div><i aria-hidden="true"><b style={{width:`${model.total>0?model.negativeCapital/model.total*100:0}%`}}/></i><small>Снимок текущих позиций, а не оценка будущей волатильности.</small></article>
  </div>
  <p>График показывает только наблюдавшуюся просадку стоимости и текущий вклад P/L. Он не заменяет VaR/CVaR и не является прогнозом.</p>
 </section>,host);
}
