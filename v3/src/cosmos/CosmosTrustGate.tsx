type GateKind="assets"|"analysis"|"income";
type GateModule={code:string;label:string;detail:string};

const COPY:Record<GateKind,{code:string;title:string;lead:string;label:string;modules:GateModule[]}>={
 assets:{
  code:"FORMATION // 02",title:"Строй закрыт",lead:"Состав появится только после подтверждённого снимка портфеля.",label:"PORTFOLIO ROSTER",
  modules:[
   {code:"01",label:"Состав",detail:"позиции · веса"},
   {code:"02",label:"Классы",detail:"акции · облигации · фонды"},
   {code:"03",label:"Концентрация",detail:"HHI · Top-3 · эмитенты"},
   {code:"04",label:"Актив",detail:"история · P/L · детали"}
  ]
 },
 analysis:{
  code:"TACTICAL // 03",title:"Матрица закрыта",lead:"Риск и доходность не строятся без подтверждённой истории.",label:"RISK MATRIX",
  modules:[
   {code:"01",label:"Доходность",detail:"TWR · XIRR"},
   {code:"02",label:"Риск",detail:"просадка · VaR · CVaR"},
   {code:"03",label:"Бенчмарк",detail:"IMOEX · относительная"},
   {code:"04",label:"Структура",detail:"HHI · корреляции"}
  ]
 },
 income:{
  code:"TREASURY // 04",title:"Поток закрыт",lead:"Купоны и дивиденды не заменяются расчётными значениями.",label:"CASH FLOW",
  modules:[
   {code:"01",label:"Получено",detail:"купоны · дивиденды"},
   {code:"02",label:"Календарь",detail:"месяцы · события"},
   {code:"03",label:"Источники",detail:"вклад бумаг"},
   {code:"04",label:"Покрытие",detail:"факт · подтверждение"}
  ]
 }
};

export function CosmosTrustGate({kind,onRefresh,refreshing=false}:{kind:GateKind;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
 const x=COPY[kind];
 return <main className={"cos-gate cos-gate--"+kind} aria-label={x.title}>
  <section className="cos-gate__scene">
   <div className="cos-gate__stars" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
   <header className="cos-gate__scene-head"><span>{x.code}</span><b>{x.label}</b></header>
   <div className="cos-gate__instrument" aria-hidden="true">
    {kind==="assets"?<div className="cos-formation"><i/><i/><i/><i/><span/><span/><b>陣</b></div>:kind==="analysis"?<div className="cos-radar"><i/><i/><i/><span/><b>眼</b></div>:<div className="cos-flow"><i/><i/><i/><span/><b>禄</b></div>}
   </div>
   <div className="cos-gate__modules" aria-label="Функциональные модули">
    {x.modules.map(module=><article key={module.code}>
     <i>{module.code}</i><small>{module.label}</small><strong>—</strong><span>{module.detail}</span>
    </article>)}
   </div>
  </section>
  <section className="cos-gate__panel">
   <div className="cos-gate__chapter"><span>{x.code}</span><b>{x.label}</b></div>
   <header><span>DATA GATE // FAIL-CLOSED</span><strong>{x.title}</strong><p>{x.lead}</p></header>
   <div className="cos-gate__source"><i>●</i><span>Источник не подтверждён · значения не подставляются</span></div>
   <button type="button" onClick={()=>void onRefresh?.()} disabled={refreshing||!onRefresh}>{refreshing?"СИНХРОНИЗАЦИЯ…":"ПРОВЕРИТЬ ИСТОЧНИК"}</button>
  </section>
 </main>;
}
