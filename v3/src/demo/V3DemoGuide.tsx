import{useState}from"react";

const STEPS=[
  {title:"Сначала — Пульт",body:"Капитал, TWR, XIRR, доход и динамика собраны в первом экране. Все цифры здесь синтетические."},
  {title:"Потом — глубина",body:"Откройте Активы, Анализ и Доход: демо показывает структуру продукта, но не делает запросов к брокеру и глубоким live-карточкам."},
  {title:"Когда будете готовы",body:"Перейдите в рабочий QVANIX. Там финансовые расчёты появляются только после подтверждённого LIVE-снимка."},
]as const;

export function V3DemoGuide(){const[open,setOpen]=useState(true),[step,setStep]=useState(0);if(!open)return <button className="v3-demo-guide-reopen" type="button" onClick={()=>setOpen(true)}>Как смотреть демо</button>;const item=STEPS[step];return <aside className="v3-demo-guide" aria-label="Короткий тур по демо"><div className="v3-demo-guide-head"><span>ДЕМО-ТУР · {step+1}/{STEPS.length}</span><button type="button" aria-label="Скрыть демо-тур" onClick={()=>setOpen(false)}>×</button></div><strong>{item.title}</strong><p>{item.body}</p><div className="v3-demo-guide-dots" aria-hidden="true">{STEPS.map((_,i)=><i key={i} className={i===step?"is-active":""}/>)}</div><div className="v3-demo-guide-actions">{step>0&&<button type="button" onClick={()=>setStep(x=>x-1)}>Назад</button>}{step<STEPS.length-1?<button type="button" className="is-primary" onClick={()=>setStep(x=>x+1)}>Дальше</button>:<a className="is-primary" href="/v3/">Открыть рабочий QVANIX</a>}</div><small>Демо остаётся изолированным: синтетические данные не смешиваются с вашим портфелем.</small></aside>}
