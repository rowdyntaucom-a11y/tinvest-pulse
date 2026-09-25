import type{CSSProperties}from"react";
import type{V3Workspace}from"../app/model";
import type{V3HomeViewModel}from"../home/homeViewModel";
import{buildV3RelativeDepth}from"../analysis/analysisDepth";
import{NordOfflineDeck}from"./NordOfflineDeck";
import{NordScrollCue}from"./NordScrollCue";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const shortDate=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"2-digit",year:"2-digit"});
const money=(value:number|null)=>value==null?"—":rub.format(value)+" ₽";
const percent=(value:number|null)=>value==null?"—":pct.format(value*100)+"%";
const percentRaw=(value:number|null)=>value==null?"—":pct.format(value)+"%";
function dateText(value:string|null){if(!value)return"—";const d=new Date(value);return Number.isNaN(d.getTime())?"—":shortDate.format(d)}
export function NordPrototype({home,onNavigate}:{home:V3HomeViewModel;onNavigate?:(workspace:V3Workspace)=>void}){
 const trusted=home.isTrusted;
 const relative=buildV3RelativeDepth(home.history);
 const leaders=home.leaders.slice(0,3);
 const topWeight=leaders.reduce((sum,item)=>sum+item.weight,0);
 const leader=leaders[0]??null;
 return <main className="nord-home-v3" aria-label="NORD — северный терминал">
  <section className="nord-home-v3__first" aria-label="NORD Rune Gate">
   <div className="nord-home-v3__scene" aria-hidden="true">
    <div className="nord-home-v3__aurora"><i/><i/><i/></div>
    <div className="nord-home-v3__mist"><i/><i/></div>
    <div className="nord-home-v3__snow"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
    <div className="nord-home-v3__embers"><i/><i/><i/><i/></div>
    <div className="nord-home-v3__scene-mark"><span>QVANIX</span><b>NORD // 01</b></div>
    <div className="nord-home-v3__scene-line"><i/><span>RUNE GATE</span><i/></div>
   </div>

   <section className="nord-home-v3__threshold" aria-label="Ключевой ответ">
    <div className="nord-home-v3__threshold-copy">
     <span>{trusted?"ПОРТФЕЛЬ ПОДТВЕРЖДЁН":"DATA GATE // FAIL-CLOSED"}</span>
     <strong>{trusted?money(home.value):"Источник не подтверждён"}</strong>
     <small>{trusted?<>Результат {money(home.profit)} · {percentRaw(home.profitPct)}</>:"Финансовые значения не подставляются до подтверждения снимка"}</small>
    </div>
    <div className="nord-home-v3__threshold-sigil" aria-hidden="true"><i/><b>ᛟ</b><i/></div>
    <NordScrollCue targetId="nord-terminal" label="ВОЙТИ В ТЕРМИНАЛ"/>
   </section>
  </section>

  <section id="nord-terminal" className="nord-home-v3__terminal" aria-label="Северный терминал">
   <header className="nord-home-v3__terminal-head">
    <div><span>RUNE HALL // 02</span><strong>Северный терминал</strong><small>{trusted?"Счёт открыт · "+dateText(home.openedDate):"Ждём подтверждённый источник данных"}</small></div>
    <i aria-hidden="true">ᚱ</i>
   </header>

   {trusted?<><section className="nord-home-v3__instruments" aria-label="Ключевые приборы">
    <article className="nord-home-v3__compass">
     <header><span>FORMATION COMPASS</span><b>{leader?.ticker??"—"}</b></header>
     <div className="nord-home-v3__compass-ring" style={{"--nord-top":Math.min(100,Math.max(0,topWeight*100))+"%"} as CSSProperties} aria-label={"Топ-3 занимают "+pct.format(topWeight*100)+"% портфеля"}><i/><b>ᛟ</b><span/></div>
     <footer><span>Топ-3</span><strong>{pct.format(topWeight*100)}%</strong><small>{home.positions??0} позиций</small></footer>
    </article>

    <article className="nord-home-v3__tide">
     <header><span>TREASURY TIDE</span><b>ᚠ</b></header>
     <strong>{money(home.passiveIncome)}</strong>
     <small>Фактически получено</small>
     <div className="nord-home-v3__wake" aria-hidden="true"><i/><i/><i/><i/><i/></div>
     <footer><span>Средний месяц</span><b>{money(home.monthlyIncome)}</b></footer>
    </article>
   </section>

   <section className="nord-home-v3__rune-strip" aria-label="Метрики портфеля">
    <div><i>ᛏ</i><span>TWR</span><strong>{percent(home.twr)}</strong><small>стратегия</small></div>
    <div><i>ᛃ</i><span>XIRR</span><strong>{percent(home.xirr)}</strong><small>с потоками</small></div>
    <div><i>ᛞ</i><span>CAGR</span><strong>{percent(home.cagr)}</strong><small>годовой темп</small></div>
    <div><i>ᛗ</i><span>IMOEX</span><strong>{percent(relative.benchmarkReturn)}</strong><small>общий период</small></div>
   </section>

   <section className="nord-home-v3__expedition" aria-label="Маршруты терминала">
    <header><span>EXPEDITION MAP // 03</span><strong>Куда дальше</strong></header>
    <div className="nord-home-v3__route-line" aria-hidden="true"><i/><i/><i/><i/></div>
    <button type="button" onClick={()=>onNavigate?.("assets")}><i>ᛟ</i><span><b>Активы</b><small>строй и структура</small></span><em>01</em></button>
    <button type="button" onClick={()=>onNavigate?.("analysis")}><i>ᚱ</i><span><b>Анализ</b><small>риск и результат</small></span><em>02</em></button>
    <button type="button" onClick={()=>onNavigate?.("income")}><i>ᚠ</i><span><b>Доход</b><small>казна и выплаты</small></span><em>03</em></button>
    <button type="button" onClick={()=>onNavigate?.("goal")}><i>ᛏ</i><span><b>Цель</b><small>путь капитала</small></span><em>04</em></button>
   </section>
   </>:<NordOfflineDeck onNavigate={onNavigate}/> }

   <footer className="nord-home-v3__footer" aria-hidden="true"><i/><span>СЕВЕРНЫЙ ПУТЬ · ДИСЦИПЛИНА · ГОРИЗОНТ</span><i/></footer>
  </section>
 </main>;
}
