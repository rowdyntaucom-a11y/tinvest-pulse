import type{CSSProperties}from"react";
import type{V3Workspace}from"../app/model";
import type{V3HomeViewModel}from"../home/homeViewModel";
import{buildV3RelativeDepth}from"../analysis/analysisDepth";

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const shortDate=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"2-digit",year:"2-digit"});

const moneyText=(value:number|null)=>value==null?"—":money.format(value)+" ₽";
const ratioText=(value:number|null)=>value==null?"—":pct.format(value*100)+"%";
const percentText=(value:number|null)=>value==null?"—":pct.format(value)+"%";
const ppText=(value:number|null)=>value==null?"—":pct.format(value*100)+" п.п.";

function dateOnly(value:string|null){
 if(!value)return null;
 const d=new Date(value);
 return Number.isNaN(d.getTime())?null:d.toISOString().slice(0,10);
}
function dateText(value:string|null){
 if(!value)return"—";
 const d=new Date(value);
 return Number.isNaN(d.getTime())?"—":shortDate.format(d);
}
function dayDistance(a:string|null,b:string|null){
 const aa=dateOnly(a),bb=dateOnly(b);
 if(!aa||!bb)return null;
 const x=Date.parse(aa+"T00:00:00Z"),y=Date.parse(bb+"T00:00:00Z");
 return Number.isFinite(x)&&Number.isFinite(y)?Math.max(0,Math.round((y-x)/86_400_000)):null;
}
function pairedGeometry(history:V3HomeViewModel["history"]){
 const rows=history
  .filter(x=>typeof x.portfolio==="number"&&Number.isFinite(x.portfolio)&&x.portfolio>0&&typeof x.imoex==="number"&&Number.isFinite(x.imoex)&&x.imoex>0)
  .map(x=>({date:x.date,portfolio:x.portfolio as number,imoex:x.imoex as number}))
  .sort((a,b)=>a.date.localeCompare(b.date));
 if(rows.length<2)return null;
 const p0=rows[0].portfolio,i0=rows[0].imoex;
 const normalized=rows.map((x,index)=>({index,p:x.portfolio/p0,i:x.imoex/i0}));
 const values=normalized.flatMap(x=>[x.p,x.i]);
 const min=Math.min(...values),max=Math.max(...values),span=Math.max(.0001,max-min);
 const xy=(value:number,index:number)=>{
  const x=360*(index/Math.max(1,normalized.length-1));
  const y=148-108*((value-min)/span);
  return{x,y};
 };
 return{
  portfolio:normalized.map(x=>xy(x.p,x.index)),
  imoex:normalized.map(x=>xy(x.i,x.index)),
  first:rows[0].date,
  last:rows.at(-1)!.date
 };
}
const points=(rows:Array<{x:number;y:number}>)=>rows.map(x=>`${x.x.toFixed(1)},${x.y.toFixed(1)}`).join(" ");

export function SamuraiPrototype({home,onNavigate}:{home:V3HomeViewModel;onNavigate?:(x:V3Workspace)=>void}){
 const relative=buildV3RelativeDepth(home.history);
 const geometry=pairedGeometry(home.history);
 const opened=home.openedDate;
 const asOf=home.updatedAt??home.history.at(-1)?.date??null;
 const ageDays=dayDistance(opened,asOf);
 const historyGap=dayDistance(opened,relative.sampleFrom);
 const sinceOpen=Boolean(opened&&relative.available&&historyGap!=null&&historyGap<=3);
 const originTitle=sinceOpen?"С МОМЕНТА ОТКРЫТИЯ":"ДОСТУПНАЯ ИСТОРИЯ";
 const originMeta=opened
  ?`СЧЁТ ОТКРЫТ · ${dateText(opened)}${ageDays==null?"":` · ${ageDays} ДН.`}`
  :"ДАТА ОТКРЫТИЯ НЕ ПОДТВЕРЖДЕНА";
 const coverage=relative.available
  ?sinceOpen
    ?`Сравнение покрывает период открытия · ${relative.overlapPoints} общих точек`
    :`Сравнение IMOEX доступно с ${dateText(relative.sampleFrom)} · ${relative.overlapPoints} общих точек`
  :home.isTrusted
    ?"Для сравнения с IMOEX нужны минимум две общие подтверждённые точки"
    :"Аналитика появится после подтверждения данных";
 const leaders=home.leaders.slice(0,3);
 return <main className="sam-proto sam-world">
  <div className="sam-world__spine" aria-hidden="true"><b>侍</b><i/><span>RONIN // 01</span><i/></div>

  <section className="sam-world__hero">
   <div className="sam-world__brand"><span>戦略 TERMINAL</span><b>QVANIX</b><i>壱</i></div>
   <div className="sam-world__reticle" aria-hidden="true"><i/><i/><b>道</b></div>
   <div className="sam-world__rain" aria-hidden="true"/>
   <div className="sam-world__mist" aria-hidden="true"/>
   <div className="sam-world__embers" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
   <div className="sam-world__slash" aria-hidden="true"/>
  </section>

  <section className="sam-world__capital" aria-label="Капитал портфеля">
   <div className="sam-world__capital-main"><small>壱 / КАПИТАЛ</small><strong>{moneyText(home.value)}</strong></div>
   <div className="sam-world__capital-change"><span>РЕЗУЛЬТАТ</span><b>{moneyText(home.profit)}</b><em>{percentText(home.profitPct)}</em></div>
   <i className="sam-world__capital-mark" aria-hidden="true">資</i>
  </section>

  <section className="sam-world__origin" aria-label="Аналитика с момента открытия">
   <header><div><span>弐 / {originTitle}</span><strong>{originMeta}</strong></div><i aria-hidden="true">始</i></header>
   <div className="sam-world__origin-metrics">
    <article><span>ПОРТФЕЛЬ</span><strong>{ratioText(relative.portfolioReturn)}</strong><small>TWR-период</small></article>
    <article><span>IMOEX</span><strong>{ratioText(relative.benchmarkReturn)}</strong><small>тот же период</small></article>
    <article><span>ОПЕРЕЖЕНИЕ</span><strong>{ppText(relative.excessReturn)}</strong><small>портфель − IMOEX</small></article>
   </div>
   <footer>{coverage}</footer>
  </section>

  <section className="sam-world__pulse" aria-label="Ключевые метрики">
   <div className="sam-world__pulsemarks">
    <span><i>TWR</i><b>{ratioText(home.twr)}</b><em>СТРАТЕГИЯ</em></span>
    <span><i>XIRR</i><b>{ratioText(home.xirr)}</b><em>С ПОТОКАМИ</em></span>
    <span><i>ДОХОД</i><b>{moneyText(home.passiveIncome)}</b><em>ФАКТ</em></span>
    <span><i>АКТИВЫ</i><b>{home.positions??"—"}</b><em>В ПОРТФЕЛЕ</em></span>
   </div>
   <div className="sam-world__pulse-line" aria-hidden="true"><i/><i/><i/><i/></div>
  </section>

  <div className="sam-world__bridge" aria-hidden="true"><i/><b>道</b><i/></div>

  <section className="sam-world__path">
   <header><div><span>参 / CAPITAL PATH</span><strong>ПУТЬ КАПИТАЛА</strong></div><b>{ppText(relative.excessReturn)}</b></header>
   <div className="sam-world__chart">
    {geometry?<svg viewBox="0 0 360 170" preserveAspectRatio="none" aria-label="Портфель против IMOEX за общий подтверждённый период">
      <polyline className="sam-world__portfolio" points={points(geometry.portfolio)}/>
      <polyline className="sam-world__index" points={points(geometry.imoex)}/>
     </svg>:<div className="sam-world__chart-empty">Сравнение появится после подтверждения истории</div>}
    <div className="sam-world__sun" aria-hidden="true"><i/><i/></div>
    <i className="sam-world__beacon"/>
    <footer><span>朱 PORTFOLIO</span><span>翠 IMOEX</span><b>{relative.available?`${dateText(relative.sampleFrom)} → ${dateText(relative.sampleTo)}`:"—"}</b></footer>
   </div>
  </section>

  <section className="sam-world__formation">
   <header><span>肆</span><strong>СТРОЙ</strong><small>{leaders.length} / {home.positions??0}</small></header>
   {leaders.length?<div>{leaders.map((x,i)=><button key={x.ticker} onClick={()=>onNavigate?.("assets")}><i>{String(i+1).padStart(2,"0")}</i><span>{x.ticker}</span><b>{pct.format(x.weight*100)}%</b><em><i style={{"--rank":i+1} as CSSProperties}/></em></button>)}</div>:<div className="sam-world__formation-empty">Состав появится после подтверждения портфеля</div>}
  </section>

  <div className="sam-world__seal" aria-hidden="true"><b>Q</b><span>侍</span></div>
 </main>;
}
