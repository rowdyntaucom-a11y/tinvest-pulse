import{useEffect,useState}from"react";
import"../styles/sectionSelector.css";

export type V3SectionOption<T extends string>={
  value:T;
  label:string;
  description:string;
};

export function V3SectionSelector<T extends string>({label,value,onChange,options}:{label:string;value:T;onChange:(value:T)=>void;options:readonly V3SectionOption<T>[]}){
  const[open,setOpen]=useState(false);
  const active=options.find(option=>option.value===value)??options[0];
  useEffect(()=>{
    if(!open)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[open]);
  const choose=(next:T)=>{onChange(next);setOpen(false)};
  return <div className="v3-section-selector">
    <span>{label}</span>
    <button type="button" className="v3-section-selector__trigger" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>
      <strong>{active?.label??"Выбрать"}</strong><i aria-hidden="true">⌄</i>
    </button>
    <small>{active?.description??""}</small>
    {open&&<div className="v3-section-sheet" role="presentation" onClick={()=>setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-label={label} onClick={event=>event.stopPropagation()}>
        <header><div><span>{label}</span><strong>{active?.label??""}</strong></div><button type="button" aria-label="Закрыть" onClick={()=>setOpen(false)}>×</button></header>
        <div>{options.map(option=><button type="button" key={option.value} className={option.value===value?"is-active":""} aria-pressed={option.value===value} onClick={()=>choose(option.value)}>
          <span><strong>{option.label}</strong><small>{option.description}</small></span><i aria-hidden="true">{option.value===value?"✓":"›"}</i>
        </button>)}</div>
      </section>
    </div>}
  </div>;
}
