import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{InstrumentAvatar}from"../assets/InstrumentAvatar";

type Mode="map"|"compare";
type MapSort="impact"|"weight"|"return";
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const one=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const plain=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const money=(value:number)=>rub.format(value)+" ₽";
const pct=(value:number|null)=>value==null?"—":one.format(value)+"%";
const idOf=(x:PositionSnapshot)=>x.instrumentUid||x.figi||x.ticker;
const finite=(value:number|undefined|null)=>Number.isFinite(value)?Number(value):0;

function rowOf(x:PositionSnapshot,total:number){
 const currentValue=Math.max(0,finite(x.currentValue)),expectedYield=finite(x.expectedYield),costBasis=Math.max(0,finite(x.costBasis));
 const weight=total>0?currentValue/total*100:0,impact=total>0?expectedYield/total*100:0,returnPct=costBasis>0?expectedYield/costBasis*100:null;
 const entry=finite(x.averagePrice)>0?finite(x.averagePrice):(finite(x.quantity)>0&&costBasis>0?costBasis/finite(x.quantity):null);
 const priceMove=entry!=null&&entry>0&&finite(x.currentPrice)>0?finite(x.currentPrice)/entry*100-100:null;
 return{x,currentValue,expectedYield,costBasis,weight,impact,returnPct,entry,priceMove};
}

function CenterRail({value,maxAbs,label}:{value:number|null;maxAbs:number;label:string}){
 const safe=value??0,width=Math.min(100,Math.abs(safe)/Math.max(.0001,maxAbs)*100);
 return <div className="qv114-center-rail" aria-label={`${label}: ${one.format(safe)}%`}><i/><span className={safe<0?"neg":""} style={{width:(safe<0?width:0)+"%"}}/><b className={safe>0?"pos":""} style={{width:(safe>0?width:0)+"%"}}/></div>;
}

function MapWorkspace({positions}:{positions:PositionSnapshot[]}){
 const[sort,setSort]=useState<MapSort>("impact"),total=positions.reduce((sum,x)=>sum+Math.max(0,finite(x.currentValue)),0);
 const rows=useMemo(()=>positions.filter(x=>finite(x.currentValue)>0).map(x=>rowOf(x,total)),[positions,total]);
 const sorted=useMemo(()=>[...rows].sort((a,b)=>sort==="weight"?b.weight-a.weight:sort==="return"?Math.abs(b.returnPct??0)-Math.abs(a.returnPct??0):Math.abs(b.impact)-Math.abs(a.impact)),[rows,sort]);
 const maxAbsImpact=Math.max(.01,...rows.map(row=>Math.abs(row.impact))),maxWeight=Math.max(1,...rows.map(row=>row.weight)),maxAbsReturn=Math.max(.1,...rows.map(row=>Math.abs(row.returnPct??0)));
 const positive=rows.filter(row=>row.impact>0).reduce((sum,row)=>sum+row.impact,0),negative=rows.filter(row=>row.impact<0).reduce((sum,row)=>sum+row.impact,0),net=rows.reduce((sum,row)=>sum+row.impact,0);
 const weights=[...rows].map(row=>row.weight).sort((a,b)=>a-b),median=weights.length?weights[Math.floor(weights.length/2)]:0;
 const quadrants=[
  {key:"heavy-up",title:"Вес ≥ медианы · P/L +",rows:rows.filter(r=>r.weight>=median&&r.impact>=0).sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact))},
  {key:"heavy-down",title:"Вес ≥ медианы · P/L −",rows:rows.filter(r=>r.weight>=median&&r.impact<0).sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact))},
  {key:"light-up",title:"Вес < медианы · P/L +",rows:rows.filter(r=>r.weight<median&&r.impact>=0).sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact))},
  {key:"light-down",title:"Вес < медианы · P/L −",rows:rows.filter(r=>r.weight<median&&r.impact<0).sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact))},
 ];
 return <section className="qv114 qv114-map" aria-label="Карта влияния позиций">
  <header className="qv114-head"><div><span>PORTFOLIO IMPACT · V114</span><h2>Вес и вклад позиций без пересечений</h2><p>Одна строка — одна бумага. Все значения относятся к текущему подтверждённому брокерскому снимку.</p></div><strong>{rows.length} поз.</strong></header>
  <div className="qv114-kpis"><article><span>Сумма +вкладов</span><b className="up">{one.format(positive)} п.п.</b></article><article><span>Сумма −вкладов</span><b className="down">{one.format(negative)} п.п.</b></article><article><span>Net открытого P/L</span><b className={net>0?"up":net<0?"down":""}>{one.format(net)} п.п.</b></article><article><span>Медиана веса</span><b>{plain.format(median)}%</b></article></div>
  <nav className="qv114-sort" aria-label="Сортировка карты"><button className={sort==="impact"?"active":""} onClick={()=>setSort("impact")}>По вкладу P/L</button><button className={sort==="weight"?"active":""} onClick={()=>setSort("weight")}>По весу</button><button className={sort==="return"?"active":""} onClick={()=>setSort("return")}>По P/L %</button></nav>
  <section className="qv114-panel"><header><b>Точный вклад в капитал</b><span>0 по центру · п.п.</span></header><div className="qv114-impact-list">{sorted.slice(0,10).map(row=><div className="qv114-impact-row" key={idOf(row.x)}><span className="qv114-asset"><InstrumentAvatar position={row.x} size="sm"/><span><b>{row.x.ticker}</b><small>{row.x.name}</small></span></span><CenterRail value={row.impact} maxAbs={maxAbsImpact} label="Вклад P/L"/><strong className={row.impact>0?"up":row.impact<0?"down":""}>{one.format(row.impact)} п.п.</strong><em>{plain.format(row.weight)}%</em></div>)}</div></section>
  <div className="qv114-split"><section className="qv114-panel"><header><b>Вес капитала</b><span>общая шкала</span></header><div className="qv114-weight-list">{[...rows].sort((a,b)=>b.weight-a.weight).slice(0,8).map(row=><div key={idOf(row.x)}><span>{row.x.ticker}</span><i><b style={{width:Math.max(2,row.weight/maxWeight*100)+"%"}}/></i><strong>{plain.format(row.weight)}%</strong></div>)}</div></section><section className="qv114-panel"><header><b>P/L к себестоимости</b><span>0 по центру</span></header><div className="qv114-return-list">{[...rows].sort((a,b)=>Math.abs(b.returnPct??0)-Math.abs(a.returnPct??0)).slice(0,8).map(row=><div key={idOf(row.x)}><span>{row.x.ticker}</span><CenterRail value={row.returnPct} maxAbs={maxAbsReturn} label="P/L к себестоимости"/><strong className={(row.returnPct??0)>0?"up":(row.returnPct??0)<0?"down":""}>{pct(row.returnPct)}</strong></div>)}</div></section></div>
  <section className="qv114-panel qv114-quadrants"><header><b>Матрица веса и знака P/L</b><span>порог веса = медиана {plain.format(median)}%</span></header><div>{quadrants.map(group=><article key={group.key}><span>{group.title}</span><b>{group.rows.length}</b><small>{group.rows.slice(0,3).map(row=>row.x.ticker).join(" · ")||"—"}</small></article>)}</div></section>
  <section className="qv114-table"><header><span>Бумага</span><span>Вес</span><span>Стоимость</span><span>P/L</span><span>Вклад</span><span>P/L %</span></header>{sorted.map(row=><div key={idOf(row.x)}><span className="qv114-asset"><InstrumentAvatar position={row.x} size="sm"/><span><b>{row.x.ticker}</b><small>{row.x.name}</small></span></span><strong>{plain.format(row.weight)}%</strong><span>{money(row.currentValue)}</span><em className={row.expectedYield>0?"up":row.expectedYield<0?"down":""}>{money(row.expectedYield)}</em><em className={row.impact>0?"up":row.impact<0?"down":""}>{one.format(row.impact)} п.п.</em><em className={(row.returnPct??0)>0?"up":(row.returnPct??0)<0?"down":""}>{pct(row.returnPct)}</em></div>)}</section>
  <footer className="qv114-note">Вклад P/L = открытый P/L позиции / текущая стоимость портфеля. Матрица не является рейтингом, прогнозом или рекомендацией.</footer>
 </section>;
}

function CompareWorkspace({positions}:{positions:PositionSnapshot[]}){
 const total=positions.reduce((sum,x)=>sum+Math.max(0,finite(x.currentValue)),0),initial=useMemo(()=>[...positions].sort((a,b)=>finite(b.currentValue)-finite(a.currentValue)).slice(0,3).map(idOf),[positions]),[selected,setSelected]=useState<string[]>(initial);
 useEffect(()=>setSelected(current=>{const valid=current.filter(id=>positions.some(x=>idOf(x)===id));return valid.length?valid:initial}),[positions,initial]);
 const toggle=(x:PositionSnapshot)=>{const id=idOf(x);setSelected(current=>current.includes(id)?current.filter(value=>value!==id):current.length>=3?current:[...current,id])};
 const rows=selected.map(id=>positions.find(x=>idOf(x)===id)).filter((x):x is PositionSnapshot=>Boolean(x)).map(x=>rowOf(x,total));
 const maxWeight=Math.max(1,...rows.map(r=>r.weight)),maxAbsReturn=Math.max(.1,...rows.map(r=>Math.abs(r.returnPct??0))),maxAbsPrice=Math.max(.1,...rows.map(r=>Math.abs(r.priceMove??0)));
 return <section className="qv114 qv114-compare" aria-label="Сравнение позиций"><header className="qv114-head"><div><span>POSITION COMPARE · V114</span><h2>Сравнение на общих шкалах</h2><p>До трёх текущих позиций. Общий масштаб позволяет сравнивать цифры, а не площадь фигур.</p></div><strong>{rows.length}/3</strong></header>
  <div className="qv114-picker">{[...positions].sort((a,b)=>finite(b.currentValue)-finite(a.currentValue)).map(x=>{const id=idOf(x),active=selected.includes(id);return <button type="button" className={active?"active":""} aria-pressed={active} disabled={!active&&selected.length>=3} onClick={()=>toggle(x)} key={id}><InstrumentAvatar position={x} size="sm"/><span><b>{x.ticker}</b><small>{plain.format(total>0?finite(x.currentValue)/total*100:0)}%</small></span></button>})}</div>
  {rows.length?<><div className="qv114-compare-grid">{rows.map(row=><article key={idOf(row.x)}><header><InstrumentAvatar position={row.x}/><span><b>{row.x.ticker}</b><small>{row.x.name}</small></span></header><strong>{money(row.currentValue)}</strong><small>{plain.format(row.weight)}% портфеля</small><div className="qv114-card-rail"><span>Вес</span><i><b style={{width:Math.max(2,row.weight/maxWeight*100)+"%"}}/></i><em>{plain.format(row.weight)}%</em></div><div className="qv114-card-center"><span>P/L к себестоимости</span><CenterRail value={row.returnPct} maxAbs={maxAbsReturn} label="P/L к себестоимости"/><em className={(row.returnPct??0)>0?"up":(row.returnPct??0)<0?"down":""}>{pct(row.returnPct)}</em></div><div className="qv114-card-center"><span>Цена к средней</span><CenterRail value={row.priceMove} maxAbs={maxAbsPrice} label="Цена к средней"/><em className={(row.priceMove??0)>0?"up":(row.priceMove??0)<0?"down":""}>{pct(row.priceMove)}</em></div><dl><div><dt>Себестоимость</dt><dd>{money(row.costBasis)}</dd></div><div><dt>Открытый P/L</dt><dd className={row.expectedYield>0?"up":row.expectedYield<0?"down":""}>{money(row.expectedYield)}</dd></div><div><dt>Вклад P/L</dt><dd className={row.impact>0?"up":row.impact<0?"down":""}>{one.format(row.impact)} п.п.</dd></div><div><dt>Средняя цена</dt><dd>{row.entry==null?"—":money(row.entry)}</dd></div><div><dt>Текущая цена</dt><dd>{money(finite(row.x.currentPrice))}</dd></div><div><dt>Количество</dt><dd>{plain.format(finite(row.x.quantity))}</dd></div></dl></article>)}</div><section className="qv114-compare-table"><header><span>Метрика</span>{rows.map(row=><b key={idOf(row.x)}>{row.x.ticker}</b>)}</header>{[["Вес",...rows.map(r=>plain.format(r.weight)+"%")],["Стоимость",...rows.map(r=>money(r.currentValue))],["P/L",...rows.map(r=>money(r.expectedYield))],["Вклад P/L",...rows.map(r=>one.format(r.impact)+" п.п.")],["P/L %",...rows.map(r=>pct(r.returnPct))],["Цена к средней",...rows.map(r=>pct(r.priceMove))]].map((row,index)=><div key={index}><span>{row[0]}</span>{row.slice(1).map((value,i)=><b key={idOf(rows[i].x)}>{value}</b>)}</div>)}</section></>:<div className="qv114-empty">Выбери хотя бы одну позицию.</div>}
  <footer className="qv114-note">Сравнение использует только текущий брокерский снимок. Оно не ранжирует бумаги по привлекательности и не формирует торговый сигнал.</footer></section>;
}

export function CorePortfolioDecisionMatrixV114({positions}:{positions:PositionSnapshot[]}){
 const[mode,setMode]=useState<Mode|null>(null),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{let currentTarget:HTMLElement|null=null,currentHost:HTMLElement|null=null;const detach=()=>{if(currentTarget)delete currentTarget.dataset.qv114Replaced;if(currentHost?.isConnected)currentHost.remove();currentTarget=null;currentHost=null};const attach=()=>{const map=document.querySelector<HTMLElement>(".sb-contribution-map"),compare=document.querySelector<HTMLElement>(".sb-compare"),next=map??compare,nextMode:Mode|null=map?"map":compare?"compare":null;if(!next){detach();setHost(null);setMode(null);return}if(next===currentTarget)return;detach();const nextHost=document.createElement("div");nextHost.className="qv114-host";next.insertAdjacentElement("beforebegin",nextHost);next.dataset.qv114Replaced="true";currentTarget=next;currentHost=nextHost;setHost(nextHost);setMode(nextMode)};attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();detach()}},[]);
 if(!host||!mode)return null;return createPortal(mode==="map"?<MapWorkspace positions={positions}/>:<CompareWorkspace positions={positions}/>,host);
}
