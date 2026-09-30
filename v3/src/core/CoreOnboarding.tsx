import{useEffect,useState}from"react";
import type{CoreExperienceMode}from"./useCoreExperience";

const STEPS=[
 {k:"trust",eyebrow:"01 · ДАННЫЕ",title:"Сначала подтверждённые данные",text:"QVANIX не подменяет отсутствие данных нулями и не достраивает финансовую историю догадками.",hint:"Если источник временно недоступен, приложение покажет это прямо."},
 {k:"layers",eyebrow:"02 · ГЛУБИНА",title:"Главный ответ сверху, детали ниже",text:"Первый экран даёт быстрый ответ. Портфель, выплаты, риск и рынок можно раскрывать глубже по мере необходимости.",hint:"Ничего важного не удаляется — меняется только уровень детализации."},
 {k:"mode",eyebrow:"03 · РЕЖИМ",title:"Выберите привычный уровень",text:"«Просто» оставляет основные выводы и объяснения. «Профи» сразу открывает все расширенные метрики и профессиональные инструменты.",hint:"Режим можно переключить в верхней панели в любой момент."},
] as const;

export function CoreOnboarding({open,mode,onFinish,onClose}:{open:boolean;mode:CoreExperienceMode;onFinish:(mode:CoreExperienceMode)=>void;onClose:()=>void}){
 const[index,setIndex]=useState(0);
 const[selected,setSelected]=useState<CoreExperienceMode>(mode);
 useEffect(()=>{if(open){setIndex(0);setSelected(mode)}},[open,mode]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};
  window.addEventListener("keydown",onKey);
  return()=>window.removeEventListener("keydown",onKey);
 },[open,onClose]);
 if(!open)return null;
 const step=STEPS[index];
 return <div className="sb-onboarding-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
  <section className="sb-onboarding" role="dialog" aria-modal="true" aria-label="Краткое знакомство с QVANIX">
   <header><div><span>QVANIX CORE</span><strong>Как устроено приложение</strong></div><button type="button" aria-label="Закрыть знакомство" onClick={onClose}>×</button></header>
   <div className="sb-onboarding-progress" aria-label={"Шаг "+(index+1)+" из "+STEPS.length}>{STEPS.map((item,i)=><i key={item.k} className={i<=index?"is-active":""}/>)}</div>
   <article><span>{step.eyebrow}</span><h2>{step.title}</h2><p>{step.text}</p><small>{step.hint}</small></article>
   {step.k==="mode"&&<div className="sb-onboarding-modes" role="group" aria-label="Режим интерфейса">
    <button type="button" className={selected==="simple"?"is-active":""} onClick={()=>setSelected("simple")}><b>Просто</b><span>Основные ответы и пояснения</span></button>
    <button type="button" className={selected==="pro"?"is-active":""} onClick={()=>setSelected("pro")}><b>Профи</b><span>Все метрики и инструменты сразу</span></button>
   </div>}
   <footer><button type="button" className="is-secondary" onClick={()=>onFinish(selected)}>Пропустить</button><button type="button" onClick={()=>index<STEPS.length-1?setIndex(index+1):onFinish(selected)}>{index<STEPS.length-1?"Далее":"Начать"}</button></footer>
  </section>
 </div>;
}
