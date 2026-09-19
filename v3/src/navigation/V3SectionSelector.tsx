import type{ChangeEvent}from"react";
import"../styles/sectionSelector.css";

export type V3SectionOption<T extends string>={
  value:T;
  label:string;
  description:string;
};

export function V3SectionSelector<T extends string>({label,value,onChange,options}:{label:string;value:T;onChange:(value:T)=>void;options:readonly V3SectionOption<T>[]}){
  const active=options.find(option=>option.value===value)??options[0];
  function handle(event:ChangeEvent<HTMLSelectElement>){onChange(event.target.value as T)}
  return <label className="v3-section-selector">
    <span>{label}</span>
    <div>
      <select value={value} onChange={handle} aria-label={label}>
        {options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <i aria-hidden="true">⌄</i>
    </div>
    <small>{active?.description??""}</small>
  </label>;
}
