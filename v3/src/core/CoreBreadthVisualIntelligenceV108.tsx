import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

type Props={positions:PositionSnapshot[]};
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const money=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1,signDisplay:"exceptZero"});
const neutralPct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});

export function CoreBreadthVisualIntelligenceV108({positions}:Props){
 const[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let current:HTMLElement|null=null,portalHost:HTMLElement|null=null;
  const detach=()=>{if(portalHost?.isConnected)portalHost.remove();portalHost=null;current=null;setHost(null)};
  const attach=()=>{
   const target=document.querySelector<HTMLElement>(".sb-analytics .sb-market-table");
   if(target===current)return;
   detach();
   if(!target)return;
   portalHost=document.createElement("div");portalHost.className="core-breadth-visual-host-v108";target.insertAdjacentElement("beforebegin",portalHost);current=target;setHost(portalHost);
  };
  attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();detach()};
 },[]);
 const model=useMemo(()=>{
  const valid=positions.filter(x=>Number.isFinite(x.currentValue)&&x.currentValue>0&&Number.isFinite(x.expectedYield));
  const total=valid.reduce((s,x)=>s+x.currentValue,0),grossGain=valid.filter(x=>x.expectedYield>0).reduce((s,x)=>s+x.expectedYield,0),grossLoss=Math.abs(valid.filter(x=>x.expectedYield<0).reduce((s,x)=>s+x.expectedYield,0)),net=valid.reduce((s,x)=>s+x.expectedYield,0);
  const positiveCapital=valid.filter(x=>x.expectedYield>0).reduce((s,x)=>s+x.currentValue,0),negativeCapital=valid.filter(x=>x.expectedYield<0).reduce((s,x)=>s+x.currentValue,0),flatCapital=Math.max(0,total-positiveCapital-negativeCapital);
  const rows=valid.map(x=>{const cost=x.costBasis>0?x.costBasis:Math.max(0,x.currentValue-x.expectedYield),returnPct=cost>0?x.expectedYield/cost*100:null,capitalShare=total?x.currentValue/total*100:0;return{x,returnPct,capitalShare}}).filter(x=>x.returnPct!=null&&Number.isFinite(x.returnPct));
  const extent=Math.max(1,...rows.map(x=>Math.abs(x.returnPct!)));
  const scatter=rows.map((row,index)=>({ticker:row.x.ticker,x:50+row.returnPct!/extent*43,y:12+(index%8)*10.8,r:Math.max(1.5,Math.min(4.2,1.4+row.capitalShare*.11)),positive:row.x.expectedYield>0,value:row.x.expectedYield,returnPct:row.returnPct!,capitalShare:row.capitalShare}));
  const sorted=[...valid].sort((a,b)=>Math.abs(b.expectedYield)-Math.abs(a.expectedYield)).slice(0,6);
  const gross=Math.max(1,grossGain+grossLoss);
  return{total,grossGain,grossLoss,net,positiveCapital,negativeCapital,flatCapital,scatter,sorted,gross};
 },[positions]);
 if(!host||model.total<=0)return null;
 return createPortal(<section className="core-breadth-visual-v108" aria-label="Визуальный разбор P/L">
  <header><span><b>P/L breadth</b><small>ширина результата по подтверждённым текущим позициям</small></span><strong className={model.net>0?"up":model.net<0?"down":""}>{money.format(model.net)} ₽</strong></header>
  <div className="core-breadth-visual-v108__summary">
   <article><span>Gross плюс</span><strong className="up">{money.format(model.grossGain)} ₽</strong><small>{neutralPct.format(model.positiveCapital/model.total*100)}% капитала</small></article>
   <article><span>Gross минус</span><strong className="down">-{money.format(model.grossLoss)} ₽</strong><small>{neutralPct.format(model.negativeCapital/model.total*100)}% капитала</small></article>
   <article><span>Net P/L</span><strong className={model.net>0?"up":model.net<0?"down":""}>{money.format(model.net)} ₽</strong><small>текущий нереализованный срез</small></article>
  </div>
  <div className="core-breadth-visual-v108__balance" aria-label="Баланс gross прибыли и убытка"><i className="gain" style={{width:`${model.grossGain/model.gross*100}%`}}/><i className="loss" style={{width:`${model.grossLoss/model.gross*100}%`}}/></div>
  <div className="core-breadth-visual-v108__grid">
   <article className="core-breadth-visual-v108__scatter"><div><span>Карта доходности позиций</span><b>0% по центру</b></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Позиции по процентному P/L; размер точки отражает долю капитала"><line className="zero" x1="50" y1="7" x2="50" y2="94"/>{[25,75].map(x=><line key={x} className="guide" x1={x} y1="7" x2={x} y2="94"/>)}{model.scatter.map((p,i)=><circle key={p.ticker+i} className={p.positive?"up":"down"} cx={p.x} cy={p.y} r={p.r}><title>{p.ticker}: {pct.format(p.returnPct)}% · {neutralPct.format(p.capitalShare)}% капитала</title></circle>)}</svg><footer><span>хуже</span><span>0%</span><span>лучше</span></footer></article>
   <article className="core-breadth-visual-v108__leaders"><div><span>Самый сильный вклад</span><b>₽ P/L</b></div><div className="rows">{model.sorted.map(x=>{const max=Math.max(1,...model.sorted.map(y=>Math.abs(y.expectedYield))),width=Math.abs(x.expectedYield)/max*100;return <div key={x.figi||x.ticker}><span>{x.ticker}</span><i><b className={x.expectedYield>=0?"upbar":"downbar"} style={{width:`${width}%`}}/></i><strong className={x.expectedYield>0?"up":x.expectedYield<0?"down":""}>{money.format(x.expectedYield)} ₽</strong></div>})}</div></article>
  </div>
  <p>Это описательный срез текущего нереализованного P/L. Он не является прогнозом, рейтингом или рекомендацией.</p>
 </section>,host);
}
