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
  const rows=valid.map(x=>{const cost=x.costBasis>0?x.costBasis:Math.max(0,x.currentValue-x.expectedYield),returnPct=cost>0?x.expectedYield/cost*100:null,capitalShare=total?x.currentValue/total*100:0,impactPct=total?x.expectedYield/total*100:0;return{x,returnPct,capitalShare,impactPct}}).filter(row=>row.returnPct!=null&&Number.isFinite(row.returnPct));
  const returnRows=[...rows].sort((a,b)=>b.capitalShare-a.capitalShare).slice(0,8).sort((a,b)=>b.returnPct!-a.returnPct!);
  const returnExtent=Math.max(1,...returnRows.map(row=>Math.abs(row.returnPct!)));
  const impactRows=[...rows].sort((a,b)=>Math.abs(b.x.expectedYield)-Math.abs(a.x.expectedYield)).slice(0,6);
  const impactExtent=Math.max(1,...impactRows.map(row=>Math.abs(row.x.expectedYield)));
  const gross=Math.max(1,grossGain+grossLoss);
  return{total,grossGain,grossLoss,net,positiveCapital,negativeCapital,flatCapital,returnRows,returnExtent,impactRows,impactExtent,gross};
 },[positions]);
 if(!host||model.total<=0)return null;
 const centeredRail=(value:number,extent:number,positive:boolean)=><i className="core-breadth-visual-v108__center-rail" aria-hidden="true"><span className="neg">{!positive&&<b className="downbar" style={{width:`${Math.max(2,Math.abs(value)/extent*100)}%`}}/>}</span><span className="pos">{positive&&<b className="upbar" style={{width:`${Math.max(2,Math.abs(value)/extent*100)}%`}}/>}</span></i>;
 return createPortal(<section className="core-breadth-visual-v108" aria-label="Визуальный разбор P/L">
  <header><span><b>P/L по позициям</b><small>без bubble-карты: точные значения, вес и вклад</small></span><strong className={model.net>0?"up":model.net<0?"down":""}>{money.format(model.net)} ₽</strong></header>
  <div className="core-breadth-visual-v108__summary">
   <article><span>Gross плюс</span><strong className="up">{money.format(model.grossGain)} ₽</strong><small>{neutralPct.format(model.positiveCapital/model.total*100)}% капитала</small></article>
   <article><span>Gross минус</span><strong className="down">-{money.format(model.grossLoss)} ₽</strong><small>{neutralPct.format(model.negativeCapital/model.total*100)}% капитала</small></article>
   <article><span>Net P/L</span><strong className={model.net>0?"up":model.net<0?"down":""}>{money.format(model.net)} ₽</strong><small>текущий нереализованный срез</small></article>
  </div>
  <div className="core-breadth-visual-v108__balance" aria-label="Баланс gross прибыли и убытка"><i className="gain" style={{width:`${model.grossGain/model.gross*100}%`}}/><i className="loss" style={{width:`${model.grossLoss/model.gross*100}%`}}/></div>
  <div className="core-breadth-visual-v108__balance-labels"><span className="up">Плюс {neutralPct.format(model.positiveCapital/model.total*100)}% капитала</span><span className="down">Минус {neutralPct.format(model.negativeCapital/model.total*100)}%</span></div>
  <div className="core-breadth-visual-v108__grid">
   <article className="core-breadth-visual-v108__returns"><div><span>Доходность крупных позиций</span><b>до 8 · по капиталу</b></div><div className="rows">{model.returnRows.map(row=><div key={row.x.figi||row.x.ticker} aria-label={`${row.x.ticker}: ${pct.format(row.returnPct!)}%, ${neutralPct.format(row.capitalShare)}% капитала`}><span>{row.x.ticker}</span>{centeredRail(row.returnPct!,model.returnExtent,row.returnPct!>=0)}<strong className={row.returnPct!>0?"up":row.returnPct!<0?"down":""}>{pct.format(row.returnPct!)}%</strong><small>{neutralPct.format(row.capitalShare)}% капитала</small></div>)}</div><footer><span>убыток</span><span>0%</span><span>прибыль</span></footer></article>
   <article className="core-breadth-visual-v108__leaders"><div><span>Вклад в общий P/L</span><b>₽ · текущий срез</b></div><div className="rows">{model.impactRows.map(row=><div key={row.x.figi||row.x.ticker}><span>{row.x.ticker}</span>{centeredRail(row.x.expectedYield,model.impactExtent,row.x.expectedYield>=0)}<strong className={row.x.expectedYield>0?"up":row.x.expectedYield<0?"down":""}>{money.format(row.x.expectedYield)} ₽</strong><small>{pct.format(row.impactPct)} п.п.</small></div>)}</div><footer><span>тянет вниз</span><span>0</span><span>тянет вверх</span></footer></article>
  </div>
  <p>Показываются крупнейшие по капиталу позиции и сильнейшие текущие вклады в P/L. Это описательный срез, а не прогноз, рейтинг привлекательности или рекомендация.</p>
 </section>,host);
}
