import type{V3Workspace}from"../app/model";
import type{V3HomeViewModel}from"../home/homeViewModel";

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const moneyText=(v:number|null)=>v==null?"—":money.format(v)+" ₽";
const pctText=(v:number|null)=>v==null?"—":pct.format(v)+"%";
const ratioText=(v:number|null)=>v==null?"—":pct.format(v*100)+"%";

export function CosmosPrototype({home,onNavigate,onPulse}:{home:V3HomeViewModel;onNavigate?:(x:V3Workspace)=>void;onPulse?:()=>void}){
 const trusted=home.isTrusted;
 const leader=home.leaders[0]?.ticker??"—";
 return <main className="cos-home" aria-label="Cosmos — обзор портфеля">
  <section className="cos-home__scene" aria-label="Cosmos Mix C">
   <div className="cos-home__orbit cos-home__orbit--a" aria-hidden="true"/>
   <div className="cos-home__orbit cos-home__orbit--b" aria-hidden="true"/>
   <div className="cos-home__stars" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div>
   <div className="cos-home__scan" aria-hidden="true"/>
   <header className="cos-home__scene-head">
    <div><span>QVANIX</span><b>COSMOS // 01</b></div>
    <small>{trusted?"LIVE LINK":"DATA LINK OFFLINE"}</small>
   </header>
   <footer className="cos-home__scene-foot">
    <span>SENTINEL ORDER</span><i/><b>BLUE SINGULARITY</b>
   </footer>
  </section>

  <section className="cos-home__capital" aria-label="Капитал">
   <div className="cos-home__capital-main">
    <small>CAPITAL VECTOR</small>
    <strong>{moneyText(home.value)}</strong>
    <p>{trusted?<><span>Результат</span><b>{moneyText(home.profit)}</b><em>{pctText(home.profitPct)}</em></>:"Источник ещё не подтверждён"}</p>
   </div>
   <div className="cos-home__capital-node" aria-hidden="true"><i/><b>Q</b><i/></div>
  </section>

  <section className="cos-home__telemetry" aria-label="Ключевые метрики">
   <header><span>TELEMETRY DECK</span><i/><b>{trusted?"SYNCED":"FAIL-CLOSED"}</b></header>
   <div>
    <article><small>TWR</small><strong>{ratioText(home.twr)}</strong><span>СТРАТЕГИЯ</span><i/></article>
    <article><small>XIRR</small><strong>{ratioText(home.xirr)}</strong><span>С ПОТОКАМИ</span><i/></article>
    <article><small>ДОХОД</small><strong>{moneyText(home.passiveIncome)}</strong><span>ФАКТ</span><i/></article>
    <article><small>АКТИВЫ</small><strong>{home.positions??"—"}</strong><span>{leader}</span><i/></article>
   </div>
  </section>

  <section className="cos-home__routes" aria-label="Навигация по данным">
   <button onClick={()=>onNavigate?.("assets")}><i>01</i><span>СОСТАВ</span><b>{home.positions??"—"}</b></button>
   <button onClick={()=>onNavigate?.("analysis")}><i>02</i><span>АНАЛИЗ</span><b>RISK</b></button>
   <button onClick={()=>onNavigate?.("income")}><i>03</i><span>ДОХОД</span><b>{moneyText(home.monthlyIncome)}</b></button>
   <button onClick={()=>onNavigate?.("goal")}><i>04</i><span>ЦЕЛЬ</span><b>VECTOR</b></button>
  </section>

  <section className="cos-home__status">
   <div><span>{trusted?"Источник подтверждён":"Данные не подтверждены"}</span><small>{trusted?"Финансовые расчёты активны":"Нули и догадки не подставляются"}</small></div>
   <button type="button" disabled={!trusted||!onPulse} onClick={onPulse}>ПУЛЬС</button>
  </section>
 </main>;
}
