import{V3_HISTORY_WINDOWS,type V3HistoryWindow}from"./historyLens";

export function V3HistoryWindowControl({value,onChange,label="Период истории"}:{value:V3HistoryWindow;onChange:(value:V3HistoryWindow)=>void;label?:string}){
  return <div className="v3-history-window" role="group" aria-label={label}>{V3_HISTORY_WINDOWS.map(item=><button key={item.id} type="button" aria-pressed={value===item.id} className={value===item.id?"is-active":""} onClick={()=>onChange(item.id)}>{item.label}</button>)}</div>;
}
