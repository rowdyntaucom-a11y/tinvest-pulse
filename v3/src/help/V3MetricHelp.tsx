import{useEffect,useRef,useState}from"react";
import{V3_METRIC_HELP,type V3MetricHelpTopic}from"./metricHelp";

export function V3MetricHelp({topic}:{topic:V3MetricHelpTopic}){
  const item=V3_METRIC_HELP[topic],root=useRef<HTMLSpanElement>(null),[open,setOpen]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const onPointer=(event:PointerEvent)=>{if(root.current&&!root.current.contains(event.target as Node))setOpen(false)};
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    document.addEventListener("pointerdown",onPointer);
    document.addEventListener("keydown",onKey);
    return()=>{document.removeEventListener("pointerdown",onPointer);document.removeEventListener("keydown",onKey)};
  },[open]);
  return <span className="v3-metric-help" ref={root}>
    <button type="button" aria-label={"Объяснить показатель: "+item.title} aria-expanded={open} onClick={()=>setOpen(value=>!value)}>i</button>
    {open&&<span className="v3-metric-help-panel" role="note">
      <strong>{item.title}</strong>
      <span>{item.simple}</span>
      <span>{item.detail}</span>
      {item.note&&<small>{item.note}</small>}
    </span>}
  </span>
}
