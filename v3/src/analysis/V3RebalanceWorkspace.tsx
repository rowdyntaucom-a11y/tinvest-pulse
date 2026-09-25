import{useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{calculateAllocationDrift,PERSONAL_STRATEGY_V1,type StrategyConfig}from"../../../v2/src/features/analytics/drift";
import{calculateRebalanceScenario,type RebalanceScenarioMode}from"../../../v2/src/features/analytics/rebalanceScenarios";
import"../styles/samuraiRebalance.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});

function money(value:number|null|undefined){
 return typeof value==="number"&&Number.isFinite(value)?rub.format(value)+" ₽":"—";
}
function signedMoney(value:number){
 if(!Number.isFinite(value))return"—";
 const sign=value>0?"+":value<0?"−":"";
 return sign+rub.format(Math.abs(value))+" ₽";
}
function percent(value:number|null|undefined){
 return typeof value==="number"&&Number.isFinite(value)?pct.format(value*100)+"%":"—";
}
function pp(value:number|null|undefined){
 if(typeof value!=="number"||!Number.isFinite(value))return"—";
 const sign=value>0?"+":value<0?"−":"";
 return sign+pct.format(Math.abs(value)*100)+" п.п.";
}
function modeLabel(mode:RebalanceScenarioMode){
 if(mode==="ADD_CAPITAL")return"Довнести";
 if(mode==="WITHDRAW_CAPITAL")return"Вывести";
 return"Перераспределить";
}

export function V3RebalanceWorkspace({positions}:{positions:PositionSnapshot[]}){
 const[currentProbe]=useState(PERSONAL_STRATEGY_V1);
 const[targetInput,setTargetInput]=useState("");
 const[mode,setMode]=useState<RebalanceScenarioMode>("REBALANCE_EXISTING");
 const[flowInput,setFlowInput]=useState("");

 const current=useMemo(()=>calculateAllocationDrift(positions,currentProbe),[positions,currentProbe]);
 const equityTarget=Number(targetInput.replace(",","."));
 const targetReady=targetInput.trim()!==""&&Number.isFinite(equityTarget)&&equityTarget>0&&equityTarget<100;
 const strategy=useMemo<StrategyConfig|null>(()=>targetReady?{
  version:"1.0",
  name:`Пользовательская цель ${equityTarget}% / ${100-equityTarget}%`,
  targets:[
   {key:"equity",label:"Акции",target:equityTarget/100},
   {key:"bond",label:"Облигации",target:(100-equityTarget)/100},
  ],
  absoluteTolerance:.05,
  relativeTolerance:.20,
 }:null,[targetReady,equityTarget]);
 const drift=useMemo(()=>strategy?calculateAllocationDrift(positions,strategy):null,[positions,strategy]);
 const flow=Number(flowInput.replace(",","."));
 const scenario=useMemo(()=>drift?calculateRebalanceScenario(drift,mode,mode==="REBALANCE_EXISTING"?0:flow):null,[drift,mode,flow]);
 const equityNow=current.rows.find(row=>row.key==="equity")?.actual??null;
 const bondNow=current.rows.find(row=>row.key==="bond")?.actual??null;
 const needsFlow=mode!=="REBALANCE_EXISTING";

 return <section className="sam-rebalance" aria-label="Сценарий ребалансировки">
  <header className="sam-rebalance__head">
   <div><span>06 · REBALANCE</span><h2>Ребалансировка структуры</h2><p>Пользователь задаёт целевую долю сам. QVANIX считает только детерминированную дельту классов и не формирует заявки на конкретные бумаги.</p></div>
   <i aria-hidden="true">衡</i>
  </header>

  <section className="sam-rebalance__current">
   <article><span>Акции сейчас</span><strong>{percent(equityNow)}</strong><small>{money(current.rows.find(row=>row.key==="equity")?.currentValue)}</small></article>
   <article><span>Облигации сейчас</span><strong>{percent(bondNow)}</strong><small>{money(current.rows.find(row=>row.key==="bond")?.currentValue)}</small></article>
   <article><span>Вне двух классов</span><strong>{percent(current.unassignedWeight)}</strong><small>не меняются сценарием</small></article>
  </section>

  {!current.available?<div className="sam-rebalance__gate">Для расчёта нужен подтверждённый положительный объём акций или облигаций.</div>:<>
   <section className="sam-rebalance__target">
    <div><span>01 · ЦЕЛЕВАЯ СТРУКТУРА</span><h3>Задайте долю акций</h3><p>Доля облигаций вычисляется прозрачно как 100% минус доля акций. Значения 0% и 100% не поддерживаются двухклассовой моделью v1.</p></div>
    <label>
     <span>Акции, %</span>
     <input inputMode="decimal" value={targetInput} onChange={event=>setTargetInput(event.target.value)} placeholder="например, 50" aria-label="Целевая доля акций в процентах"/>
    </label>
    <div className="sam-rebalance__derived"><span>Облигации</span><strong>{targetReady?pct.format(100-equityTarget)+"%":"—"}</strong></div>
   </section>

   {!targetReady?<div className="sam-rebalance__gate">Введите собственную целевую долю акций от 1% до 99%. QVANIX не подставляет стратегию автоматически.</div>:drift&&!drift.available?<div className="sam-rebalance__gate">{drift.reason??"Структуру нельзя рассчитать по текущему снимку."}</div>:drift&&<>
    <section className="sam-rebalance__drift">
     <div className="sam-rebalance__section-title"><div><span>02 · DRIFT</span><h3>Текущее отклонение</h3></div><strong className={drift.withinTolerance?"is-ok":"is-watch"}>{drift.withinTolerance?"В ДОПУСКЕ":"ВНЕ ДОПУСКА"}</strong></div>
     <div className="sam-rebalance__rows">
      {drift.rows.map(row=><article key={row.key}>
       <div><strong>{row.label}</strong><small>текущая стоимость {money(row.currentValue)}</small></div>
       <div><span>Сейчас</span><b>{percent(row.actual)}</b></div>
       <div><span>Цель</span><b>{percent(row.target)}</b></div>
       <div><span>Отклонение</span><b className={row.delta>0?"is-positive":row.delta<0?"is-negative":""}>{pp(row.delta)}</b></div>
       <i aria-hidden="true"><b style={{width:Math.max(0,Math.min(100,row.actual*100))+"%"}}/><em style={{left:Math.max(0,Math.min(100,row.target*100))+"%"}}/></i>
      </article>)}
     </div>
     {drift.unassignedWeight>0&&<p>За пределами стратегии: {percent(drift.unassignedWeight)} портфеля. Эти активы сохраняются без изменений и не входят в целевые дельты.</p>}
    </section>

    <section className="sam-rebalance__scenario">
     <div className="sam-rebalance__section-title"><div><span>03 · СЦЕНАРИЙ</span><h3>Как меняется структура</h3></div><small>без списка заявок</small></div>
     <div className="sam-rebalance__modes" role="group" aria-label="Тип сценария ребалансировки">
      {(["REBALANCE_EXISTING","ADD_CAPITAL","WITHDRAW_CAPITAL"] as RebalanceScenarioMode[]).map(item=><button type="button" key={item} className={mode===item?"is-active":""} onClick={()=>setMode(item)}>{modeLabel(item)}</button>)}
     </div>
     {needsFlow&&<label className="sam-rebalance__flow"><span>{mode==="ADD_CAPITAL"?"Сумма довнесения":"Сумма вывода"}</span><input inputMode="decimal" value={flowInput} onChange={event=>setFlowInput(event.target.value)} placeholder="Введите ₽"/></label>}
     {!scenario?.available?<div className="sam-rebalance__gate is-inner">{needsFlow&&!flowInput.trim()?"Введите положительную сумму самостоятельно.":scenario?.reason??"Сценарий недоступен."}</div>:<>
      <div className="sam-rebalance__scenario-summary">
       <article><span>Капитал класса до</span><strong>{money(scenario.assignedValueBefore)}</strong></article>
       <article><span>После сценария</span><strong>{money(scenario.assignedValueAfter)}</strong></article>
       <article><span>Точная цель</span><strong className={scenario.exactTargetPossible?"is-positive":"is-warning"}>{scenario.exactTargetPossible?"Достижима":"Не этим потоком"}</strong></article>
       <article><span>Мин. поток для точной цели</span><strong>{scenario.minimumFlowForExactTarget==null?"—":money(scenario.minimumFlowForExactTarget)}</strong></article>
      </div>
      <div className="sam-rebalance__deltas">
       {scenario.rows.map(row=><article key={row.key}>
        <div><strong>{row.label}</strong><small>целевая стоимость {money(row.targetValue)}</small></div>
        <span>Целевая дельта класса</span>
        <b className={row.direction==="INCREASE"?"is-positive":row.direction==="DECREASE"?"is-negative":""}>{signedMoney(row.deltaValue)}</b>
       </article>)}
      </div>
      {!scenario.exactTargetPossible&&scenario.reason&&<p className="sam-rebalance__warning">{scenario.reason}</p>}
     </>}
    </section>

    <footer>Модель работает только на уровне классов «акции / облигации». Комиссии, налоги, спреды, лоты и конкретные инструменты здесь не моделируются. Результат — сценарная диагностика пользовательской цели, не команда совершить сделку.</footer>
   </>}
  </>}
 </section>;
}
