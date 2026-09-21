import{lazy,Suspense,useState}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import type{V3DetailMode,V3Shell}from"../app/model";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{V3SectionSelector}from"../navigation/V3SectionSelector";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const TARGET_KEY="qvanix.v3.goal.target";
const V3GoalScenarioLab=lazy(()=>import("./V3GoalScenarioLab").then(m=>({default:m.V3GoalScenarioLab})));
type GoalSection="overview"|"milestones"|"scenario";
const GOAL_SECTIONS=[
  {value:"overview",label:"Обзор",description:"Текущий капитал, прогресс и ближайший этап без предположений о доходности."},
  {value:"milestones",label:"Этапы",description:"25 / 50 / 75 / 100% заданного ориентира."},
  {value:"scenario",label:"Сценарии",description:"Отдельная лаборатория ваших предпосылок и исторического bootstrap; не прогноз."},
] as const;
function readTarget(){if(typeof window==="undefined")return null;const x=Number(localStorage.getItem(TARGET_KEY));return Number.isFinite(x)&&x>0?x:null}
export function V3Goal({value,trusted,shell,mode,history}:{value:number|null;trusted:boolean;shell:V3Shell;mode:V3DetailMode;history:HistoryPoint[]}){
  const[target,setTarget]=useState<number|null>(readTarget),[editing,setEditing]=useState(false),[draft,setDraft]=useState(target?String(target):""),[section,setSection]=useState<GoalSection>("overview");
  const progress=trusted&&value!=null&&target?Math.min(100,value/target*100):null,remaining=trusted&&value!=null&&target?Math.max(0,target-value):null,milestones=target?[25,50,75,100].map(p=>({p,amount:target*p/100,reached:progress!=null&&progress>=p})):[],next=progress==null?null:milestones.find(x=>!x.reached)??null;
  function save(){const next=Number(draft.replace(/\s/g,"").replace(",","."));if(!Number.isFinite(next)||next<=0)return;localStorage.setItem(TARGET_KEY,String(next));setTarget(next);setEditing(false);setSection("overview")}
  return <main className="v3-goal" data-shell={shell}>
    <header className="v3-page-head"><span>КАПИТАЛ · ОРИЕНТИР</span><h1>Цель</h1><p>Личный ориентир без прогноза доходности</p></header>
    <section className="v3-goal-hero"><div className="v3-goal-title"><span>Целевой капитал</span><small>{trusted?"Портфель подтверждён":"Текущие данные не подтверждены"}</small></div><strong>{target?rub.format(target)+" ₽":"Не задан"}</strong>{editing?<div className="v3-goal-editor"><label><span>Сумма, ₽</span><input inputMode="decimal" autoFocus value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false)}}/></label><button onClick={save}>Сохранить</button><button className="is-quiet" onClick={()=>setEditing(false)}>Отмена</button></div>:<button onClick={()=>{setDraft(target?String(target):"");setEditing(true)}}>{target?"Изменить ориентир":"Задать цель"}</button>}</section>
    {target&&<><section className="v3-goal-progress"><div><span>Прогресс <V3MetricHelp topic="goalProgress"/></span><strong>{progress==null?"—":pct.format(progress)+"%"}</strong></div><i aria-label={progress==null?"Прогресс недоступен":`Прогресс ${pct.format(progress)}%`}><b style={{width:(progress??0)+"%"}}/></i><small>{remaining==null?"Расчёт появится после подтверждения данных":"До ориентира "+rub.format(remaining)+" ₽"}</small></section>{trusted&&value!=null&&<section className="v3-goal-journey"><div><span>{next?"Следующий этап":"Ориентир достигнут"}</span><strong>{next?next.p+"% · "+rub.format(next.amount)+" ₽":"100% · "+rub.format(target)+" ₽"}</strong><small>{next?"Осталось до этапа "+rub.format(Math.max(0,next.amount-value))+" ₽":"Текущая стоимость не ниже заданного ориентира"}</small></div><i aria-hidden="true">{next?"→":"✓"}</i></section>}<section className="v3-goal-facts"><article><span>Сейчас</span><strong>{trusted&&value!=null?rub.format(value)+" ₽":"—"}</strong><small>подтверждённая стоимость</small></article><article><span>Разница</span><strong>{remaining==null?"—":rub.format(remaining)+" ₽"}</strong><small>без прогноза срока</small></article></section></>}
    {mode==="detailed"&&target&&<V3SectionSelector label="Раздел цели" value={section} onChange={setSection} options={GOAL_SECTIONS}/>} 
    {mode==="detailed"&&target&&section==="overview"&&<section className="v3-goal-detail"><h2>Как читать цель</h2><p>Прогресс сравнивает только подтверждённую текущую стоимость с вашим ориентиром. Здесь нет предполагаемой доходности, срока достижения или скрытого прогноза.</p></section>}
    {mode==="detailed"&&target&&section==="milestones"&&<section className="v3-goal-milestones"><h2>Этапы капитала</h2>{milestones.map(x=><div key={x.p} className={x.reached?"is-reached":""}><i aria-hidden="true">{x.reached?"✓":x.p+"%"}</i><span>{rub.format(x.amount)} ₽</span><small>{x.reached?"пройден":"ориентир"}</small></div>)}</section>}
    {mode==="detailed"&&target&&section==="scenario"&&(!trusted||value==null?<section className="v3-goal-detail"><h2>Сценарии закрыты</h2><p>Сценарная лаборатория откроется только после подтверждения текущего капитала. Неподтверждённые значения не подставляются в расчёты.</p></section>:<Suspense fallback={<section className="v3-goal-detail"><p>Открываем сценарную лабораторию…</p></section>}><V3GoalScenarioLab currentCapital={value} targetCapitalToday={target} history={history}/></Suspense>)}
    {mode==="detailed"&&target&&section==="scenario"&&<section className="v3-goal-detail"><h2>Метод</h2><p>Сценарный слой использует только ваши предпосылки и отдельно показывает исторический bootstrap. Это не инвестиционная рекомендация, прогноз или обещанный срок достижения.</p></section>}
  </main>
}
