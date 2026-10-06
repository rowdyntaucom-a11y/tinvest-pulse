import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{InstrumentAvatar}from"../assets/InstrumentAvatar";

type Props={positions:PositionSnapshot[]};
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const neutralPct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const price=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const finite=(value:number)=>Number.isFinite(value)?value:0;

export function CoreAssetPositionCockpitV113({positions}:Props){
 const[host,setHost]=useState<HTMLElement|null>(null),[ticker,setTicker]=useState<string|null>(null);
 useEffect(()=>{
  let root:HTMLElement|null=null,portalHost:HTMLElement|null=null,lastTicker:string|null=null;
  const detach=()=>{if(portalHost?.isConnected)portalHost.remove();portalHost=null;root=null;lastTicker=null;setHost(null);setTicker(null)};
  const sync=()=>{
   const next=document.querySelector<HTMLElement>(".sb-asset-detail");
   if(!next){if(root)detach();return}
   if(next!==root){detach();root=next;portalHost=document.createElement("div");portalHost.className="core-asset-position-host-v113";const anchor=next.querySelector<HTMLElement>(".sb-asset-impact")??next.querySelector<HTMLElement>(".sb-asset-answer");anchor?.insertAdjacentElement("afterend",portalHost);if(!portalHost.isConnected)next.append(portalHost);setHost(portalHost)}
   const nextTicker=next.querySelector<HTMLElement>(".sb-asset-hero h1")?.textContent?.trim()||null;
   if(nextTicker!==lastTicker){lastTicker=nextTicker;setTicker(nextTicker)}
  };
  sync();const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true,characterData:true});return()=>{observer.disconnect();detach()};
 },[]);
 const model=useMemo(()=>{
  if(!ticker)return null;
  const current=positions.find(row=>row.ticker===ticker);if(!current)return null;
  const ranked=[...positions].filter(row=>finite(row.currentValue)>=0).sort((a,b)=>finite(b.currentValue)-finite(a.currentValue));
  const total=ranked.reduce((sum,row)=>sum+Math.max(0,finite(row.currentValue)),0),index=Math.max(0,ranked.findIndex(row=>row===current||row.ticker===current.ticker)),weight=total>0?finite(current.currentValue)/total*100:0,maxWeight=total>0?Math.max(...ranked.map(row=>finite(row.currentValue)/total*100)):0;
  const cost=Math.max(0,finite(current.costBasis)),value=Math.max(0,finite(current.currentValue)),pnl=finite(current.expectedYield),pnlPct=cost>0?pnl/cost*100:null,impact=total>0?pnl/total*100:null;
  const impacts=ranked.map(row=>total>0?finite(row.expectedYield)/total*100:0),maxImpact=Math.max(.0001,...impacts.map(Math.abs)),gross=ranked.reduce((sum,row)=>sum+Math.abs(finite(row.expectedYield)),0),grossShare=gross>0?Math.abs(pnl)/gross*100:null;
  const avg=finite(current.averagePrice)>0?finite(current.averagePrice):(finite(current.quantity)>0&&cost>0?cost/finite(current.quantity):0),last=finite(current.currentPrice),priceMove=avg>0&&last>0?last/avg*100-100:null,priceScale=Math.max(avg,last,1),valueScale=Math.max(cost,value,1);
  let start=Math.max(0,index-1),end=Math.min(ranked.length,start+3);if(end-start<3)start=Math.max(0,end-3);const peers=ranked.slice(start,end);
  return{current,ranked,total,index,weight,maxWeight,cost,value,pnl,pnlPct,impact,maxImpact,grossShare,avg,last,priceMove,priceScale,valueScale,peers};
 },[positions,ticker]);
 if(!host||!model)return null;
 const impactWidth=model.impact==null?0:Math.min(100,Math.abs(model.impact)/model.maxImpact*100);
 return createPortal(<section className="core-asset-position-v113" aria-label="Точный профиль позиции">
  <header><span className="identity"><InstrumentAvatar position={model.current}/><span><b>Позиционный профиль</b><small>{model.current.ticker} · подтверждённый брокерский снимок</small></span></span><strong>#{model.index+1} по капиталу</strong></header>
  <div className="core-asset-position-v113__kpis"><article><span>Вес портфеля</span><b>{neutralPct.format(model.weight)}%</b><small>{model.index+1} из {model.ranked.length}</small></article><article><span>Открытый P/L</span><b className={model.pnl>0?"up":model.pnl<0?"down":""}>{model.pnl>0?"+":""}{money.format(model.pnl)} ₽</b><small>{model.pnlPct==null?"к себестоимости —":pct.format(model.pnlPct)+"% к себестоимости"}</small></article><article><span>Вклад в капитал</span><b className={(model.impact??0)>0?"up":(model.impact??0)<0?"down":""}>{model.impact==null?"—":pct.format(model.impact)+" п.п."}</b><small>{model.grossShare==null?"доля P/L —":neutralPct.format(model.grossShare)+"% абсолютного P/L"}</small></article><article><span>Цена к средней</span><b className={(model.priceMove??0)>0?"up":(model.priceMove??0)<0?"down":""}>{model.priceMove==null?"—":pct.format(model.priceMove)+"%"}</b><small>без прогноза</small></article></div>
  <div className="core-asset-position-v113__grid">
   <article className="bridge"><div className="head"><span>Себестоимость → текущая стоимость</span><b>{money.format(model.value)} ₽</b></div><div className="bar-row"><span>Себестоимость</span><i><b style={{width:`${model.cost/model.valueScale*100}%`}}/></i><strong>{money.format(model.cost)} ₽</strong></div><div className="bar-row current"><span>Сейчас</span><i><b style={{width:`${model.value/model.valueScale*100}%`}}/></i><strong>{money.format(model.value)} ₽</strong></div><footer><span>P/L</span><b className={model.pnl>0?"up":model.pnl<0?"down":""}>{model.pnl>0?"+":""}{money.format(model.pnl)} ₽{model.pnlPct==null?"":" · "+pct.format(model.pnlPct)+"%"}</b></footer></article>
   <article className="impact"><div className="head"><span>Вклад P/L в портфель</span><b>0 по центру</b></div><div className="center-rail" aria-label="Отрицательный и положительный вклад позиции"><em className="neg">{(model.impact??0)<0&&<b style={{width:`${impactWidth}%`}}/>}</em><em className="pos">{(model.impact??0)>=0&&<b style={{width:`${impactWidth}%`}}/>}</em></div><div className="axis"><span>минус</span><span>0</span><span>плюс</span></div><footer><span>Точная величина</span><b className={(model.impact??0)>0?"up":(model.impact??0)<0?"down":""}>{model.impact==null?"—":pct.format(model.impact)+" п.п."}</b></footer></article>
   <article className="price"><div className="head"><span>Цена позиции</span><b>{model.last>0?price.format(model.last)+" ₽":"—"}</b></div><div className="bar-row"><span>Средняя</span><i><b style={{width:`${model.avg/model.priceScale*100}%`}}/></i><strong>{model.avg>0?price.format(model.avg)+" ₽":"—"}</strong></div><div className="bar-row current"><span>Текущая</span><i><b style={{width:`${model.last/model.priceScale*100}%`}}/></i><strong>{model.last>0?price.format(model.last)+" ₽":"—"}</strong></div><footer><span>Разница</span><b className={(model.priceMove??0)>0?"up":(model.priceMove??0)<0?"down":""}>{model.priceMove==null?"—":pct.format(model.priceMove)+"%"}</b></footer></article>
  </div>
  <article className="core-asset-position-v113__rank"><div className="head"><span>Соседи по размеру позиции</span><b>ранг по текущей стоимости</b></div><div className="rows">{model.peers.map(row=>{const rowWeight=model.total>0?finite(row.currentValue)/model.total*100:0,rowPnl=finite(row.costBasis)>0?finite(row.expectedYield)/finite(row.costBasis)*100:null,rowIndex=model.ranked.indexOf(row)+1;return <div key={row.figi||row.ticker} className={row.ticker===model.current.ticker?"active":""}><strong>#{rowIndex}</strong><span className="asset"><InstrumentAvatar position={row} size="sm"/><span><b>{row.ticker}</b><small>{row.name}</small></span></span><span className="weight"><i><b style={{width:`${model.maxWeight>0?rowWeight/model.maxWeight*100:0}%`}}/></i><small>{neutralPct.format(rowWeight)}%</small></span><em>{money.format(finite(row.currentValue))} ₽</em><b className={(rowPnl??0)>0?"up":(rowPnl??0)<0?"down":""}>{rowPnl==null?"—":pct.format(rowPnl)+"%"}</b></div>})}</div></article>
  <p>Профиль использует только текущую стоимость, себестоимость, количество, среднюю цену и открытый P/L из подтверждённого снимка. Это не оценка качества бумаги, не прогноз и не торговый сигнал.</p>
 </section>,host);
}
