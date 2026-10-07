import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{CorePortfolioConcentrationV126}from"./CorePortfolioConcentrationV126";
import{CoreConcentrationLadderV136}from"./CoreConcentrationLadderV136";
import{CorePortfolioWeightBandsV147}from"./CorePortfolioWeightBandsV147";
import{CorePortfolioPnLBreadthV152}from"./CorePortfolioPnLBreadthV152";
import{CorePortfolioClassBreadthV157}from"./CorePortfolioClassBreadthV157";
import{CorePortfolioTailV161}from"./CorePortfolioTailV161";
import{CorePortfolioCostBasisV165}from"./CorePortfolioCostBasisV165";

type Props={positions:PositionSnapshot[]};
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const money=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});
const classOf=(row:PositionSnapshot)=>{const t=(row.instrumentType||"").toLowerCase();return t.includes("bond")?"Облигации":t.includes("share")||t.includes("stock")?"Акции":"Другое"};

export function CorePortfolioVisualIntelligenceV106({positions}:Props){
 const[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let current:HTMLElement|null=null,portalHost:HTMLElement|null=null;
  const detach=()=>{if(portalHost?.isConnected)portalHost.remove();portalHost=null;current=null;setHost(null)};
  const attach=()=>{
   const target=document.querySelector<HTMLElement>(".sb-analytics .sb-analytic-list");
   if(target===current)return;
   detach();
   if(!target)return;
   portalHost=document.createElement("div");portalHost.className="core-portfolio-visual-host-v106";target.insertAdjacentElement("beforebegin",portalHost);current=target;setHost(portalHost);
  };
  attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();detach()};
 },[]);
 const model=useMemo(()=>{
  const valid=positions.filter(x=>Number.isFinite(x.currentValue)&&x.currentValue>0),total=valid.reduce((s,x)=>s+x.currentValue,0),rank=[...valid].sort((a,b)=>b.currentValue-a.currentValue);
  let cumulative=0;const curve=rank.map((x,i)=>{cumulative+=x.currentValue;return{x:rank.length<2?50:i/(rank.length-1)*100,y:92-(total?cumulative/total*82:0),share:total?x.currentValue/total*100:0,ticker:x.ticker}});
  const classes=["Акции","Облигации","Другое"].map(key=>({key,value:valid.filter(x=>classOf(x)===key).reduce((s,x)=>s+x.currentValue,0)})).filter(x=>x.value>0);
  const positive=valid.filter(x=>x.expectedYield>0).reduce((s,x)=>s+x.currentValue,0),negative=valid.filter(x=>x.expectedYield<0).reduce((s,x)=>s+x.currentValue,0),flat=Math.max(0,total-positive-negative);
  const top1=total?(rank[0]?.currentValue??0)/total*100:0,top3=total?rank.slice(0,3).reduce((s,x)=>s+x.currentValue,0)/total*100:0,top5=total?rank.slice(0,5).reduce((s,x)=>s+x.currentValue,0)/total*100:0;
  const leaders=rank.slice(0,5).map((row,index)=>({index:index+1,ticker:row.ticker||"—",name:row.name||row.ticker||"—",value:row.currentValue,share:total?row.currentValue/total*100:0}));
  return{total,rank,curve,classes,positive,negative,flat,top1,top3,top5,leaders};
 },[positions]);
 if(!host||model.total<=0)return null;
 let offset=0;
 return createPortal(<section className="core-portfolio-visual-v106" aria-label="Визуальная карта портфеля">
  <header><span><b>Структура капитала</b><small>концентрация и точные веса крупнейших позиций</small></span><strong>{model.rank.length} позиций</strong></header>
  <div className="core-portfolio-visual-v106__grid">
   <article className="core-portfolio-visual-v106__curve"><div><span>Накопленная концентрация</span><b>от крупнейшей позиции</b></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Накопленная доля капитала по позициям от крупнейшей к меньшей"><g className="grid">{[25,50,75].map(v=><line key={v} x1="0" y1={92-v*.82} x2="100" y2={92-v*.82}/>)}</g><polyline points={model.curve.map(p=>`${p.x},${p.y}`).join(" ")}/></svg><div className="core-portfolio-visual-v106__concentration-cues"><span>Топ-1 <b>{pct.format(model.top1)}%</b></span><span>Топ-3 <b>{pct.format(model.top3)}%</b></span><span>Топ-5 <b>{pct.format(model.top5)}%</b></span></div><div className="core-portfolio-visual-v106__ranking" aria-label="Крупнейшие позиции"><div className="head"><span>Крупнейшие позиции</span><b>вес · стоимость</b></div>{model.leaders.map(row=><div className="row" key={row.index+row.ticker}><i>{row.index}</i><span><b>{row.ticker}</b><small>{row.name}</small></span><strong>{pct.format(row.share)}%</strong><em>{money.format(row.value)} ₽</em></div>)}</div><footer><span>{model.rank[0]?.ticker||"—"}</span><span>все позиции</span></footer></article>
   <article className="core-portfolio-visual-v106__classes"><div><span>Классы активов</span><b>{money.format(model.total)} ₽</b></div><div className="stack" role="img" aria-label="Доли классов активов">{model.classes.map((x,i)=>{const width=x.value/model.total*100,start=offset;offset+=width;return <i key={x.key} className={`c${i}`} style={{width:`${width}%`}} title={`${x.key}: ${pct.format(width)}%`} data-start={start}/>})}</div><ul>{model.classes.map((x,i)=><li key={x.key}><i className={`c${i}`}/><span>{x.key}</span><b>{pct.format(x.value/model.total*100)}%</b></li>)}</ul></article>
   <article className="core-portfolio-visual-v106__breadth"><div><span>Капитал по знаку P/L</span><b>текущий срез</b></div><div className="breadth" role="img" aria-label="Капитал в прибыльных, убыточных и нейтральных позициях"><i className="upbar" style={{width:`${model.positive/model.total*100}%`}}/><i className="downbar" style={{width:`${model.negative/model.total*100}%`}}/><i className="flatbar" style={{width:`${model.flat/model.total*100}%`}}/></div><footer><span className="up">В плюсе {pct.format(model.positive/model.total*100)}%</span><span className="down">В минусе {pct.format(model.negative/model.total*100)}%</span></footer></article>
  </div>
  <CorePortfolioConcentrationV126 positions={positions}/><CoreConcentrationLadderV136 positions={positions}/><CorePortfolioWeightBandsV147 positions={positions}/><CorePortfolioPnLBreadthV152 positions={positions}/><CorePortfolioClassBreadthV157 positions={positions}/><CorePortfolioTailV161 positions={positions}/><CorePortfolioCostBasisV165 positions={positions}/><p>Визуализация описывает текущую структуру капитала. Это не прогноз, рейтинг или рекомендация.</p>
 </section>,host);
}
